import Razorpay from 'razorpay';
import Stripe from 'stripe';
import { env } from '../config/env';
import { Payment, Plan, Subscription, Company, Invoice } from '../models';
import { NotFoundError } from '../utils/errors';
import { v4 as uuidv4 } from 'uuid';

function getRazorpay(): Razorpay | null {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) return null;
  return new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET });
}

function getStripe(): Stripe | null {
  if (!env.STRIPE_SECRET_KEY) return null;
  return new Stripe(env.STRIPE_SECRET_KEY);
}

export async function createRazorpayOrder(companyId: string, planId: string) {
  const razorpay = getRazorpay();
  if (!razorpay) throw new Error('Razorpay not configured');

  const plan = await Plan.findById(planId);
  if (!plan) throw new NotFoundError('Plan not found');

  const order = await razorpay.orders.create({
    amount: plan.priceMonthly * 100,
    currency: plan.currency,
    receipt: `hrflow_${companyId}_${Date.now()}`,
  });

  return { orderId: order.id, amount: plan.priceMonthly, currency: plan.currency, keyId: env.RAZORPAY_KEY_ID };
}

export async function verifyRazorpayPayment(params: {
  companyId: string;
  planId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const crypto = await import('crypto');
  const body = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest('hex');

  if (expected !== params.razorpaySignature) {
    throw new Error('Invalid payment signature');
  }

  const plan = await Plan.findById(params.planId);
  if (!plan) throw new NotFoundError('Plan not found');

  const startsAt = new Date();
  const expiresAt = new Date();
  if (plan.durationDays) {
    expiresAt.setDate(expiresAt.getDate() + plan.durationDays);
  } else {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  }

  const subscription = await Subscription.findOneAndUpdate(
    { companyId: params.companyId },
    {
      planId: plan._id,
      status: 'active',
      startsAt,
      expiresAt,
    },
    { upsert: true, new: true }
  );

  await Company.findByIdAndUpdate(params.companyId, {
    planId: plan._id,
    subscriptionId: subscription._id,
    features: plan.features,
    status: 'active',
  });

  const payment = await Payment.create({
    companyId: params.companyId,
    subscriptionId: subscription._id,
    amount: plan.priceMonthly,
    currency: plan.currency,
    provider: 'razorpay',
    providerPaymentId: params.razorpayPaymentId,
    status: 'completed',
  });

  const invoice = await Invoice.create({
    companyId: params.companyId,
    invoiceNumber: `INV-${uuidv4().slice(0, 8).toUpperCase()}`,
    amount: plan.priceMonthly,
    tax: 0,
    total: plan.priceMonthly,
    currency: plan.currency,
    status: 'paid',
    dueDate: new Date(),
    paidAt: new Date(),
    lineItems: [{ description: `${plan.name} subscription`, amount: plan.priceMonthly }],
  });

  payment.invoiceId = invoice._id;
  await payment.save();

  return { subscription, payment, invoice };
}

export async function createStripeCheckoutSession(companyId: string, planId: string) {
  const stripe = getStripe();
  if (!stripe) throw new Error('Stripe not configured');

  const plan = await Plan.findById(planId);
  if (!plan) throw new NotFoundError('Plan not found');

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [
      {
        price_data: {
          currency: plan.currency.toLowerCase(),
          product_data: { name: `HRFlow ${plan.name}` },
          unit_amount: plan.priceMonthly * 100,
          recurring: { interval: 'month' },
        },
        quantity: 1,
      },
    ],
    success_url: `${env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.FRONTEND_URL}/billing/cancel`,
    metadata: { companyId, planId: planId.toString() },
  });

  return { sessionId: session.id, url: session.url };
}
