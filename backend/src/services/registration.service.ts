import { Company, Plan, Subscription, User, Employee, LeaveType } from '../models';
import { hashPassword } from './auth.password';
import { createOtp } from './otp.service';
import { ValidationError } from '../utils/errors';
import { sendTrialExpiryReminder } from './email.service';

const DEFAULT_LEAVE_TYPES = [
  { name: 'Casual Leave', code: 'CL', annualQuota: 12 },
  { name: 'Sick Leave', code: 'SL', annualQuota: 10 },
  { name: 'Earned Leave', code: 'EL', annualQuota: 15 },
  { name: 'Work From Home', code: 'WFH', annualQuota: 24 },
];

export async function registerCompanyTrial(params: {
  companyName: string;
  slug: string;
  ownerEmail: string;
  ownerPassword: string;
  ownerFirstName: string;
  ownerLastName: string;
  phone?: string;
}) {
  const slug = params.slug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const existingSlug = await Company.findOne({ slug });
  if (existingSlug) throw new ValidationError('Company URL slug already taken');

  const existingEmail = await User.findOne({ email: params.ownerEmail.toLowerCase() });
  if (existingEmail) throw new ValidationError('Email already registered');

  const plan = await Plan.findOne({ slug: 'free-trial', isActive: true });
  if (!plan) throw new ValidationError('Trial plan not configured');

  const passwordHash = await hashPassword(params.ownerPassword);
  const owner = await User.create({
    email: params.ownerEmail.toLowerCase(),
    passwordHash,
    firstName: params.ownerFirstName,
    lastName: params.ownerLastName,
    phone: params.phone,
    role: 'company_owner',
    isActive: true,
    emailVerified: false,
  });

  const startsAt = new Date();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (plan.durationDays ?? 14));

  const company = await Company.create({
    name: params.companyName,
    slug,
    status: 'active',
    ownerId: owner._id,
    planId: plan._id,
    features: plan.features,
    employeeCount: 0,
    aiCredits: 10,
    whatsappCredits: 50,
  });

  const subscription = await Subscription.create({
    companyId: company._id,
    planId: plan._id,
    status: 'trial',
    startsAt,
    expiresAt,
    autoRenew: false,
  });

  company.subscriptionId = subscription._id;
  await company.save();

  owner.companyId = company._id;
  await owner.save();

  for (const lt of DEFAULT_LEAVE_TYPES) {
    await LeaveType.create({ companyId: company._id, ...lt, isPaid: true, isActive: true });
  }

  const otp = await createOtp({
    purpose: 'email_verify',
    userId: owner._id.toString(),
    email: owner.email,
  });

  return {
    company,
    owner: sanitizeUser(owner),
    subscription,
    verification: { expiresAt: otp.expiresAt, devCode: otp.devCode },
  };
}

export async function processTrialReminders() {
  const now = new Date();
  const in3Days = new Date(now);
  in3Days.setDate(in3Days.getDate() + 3);

  const subs = await Subscription.find({
    status: 'trial',
    expiresAt: { $lte: in3Days, $gte: now },
  });

  let remindersSent = 0;
  for (const sub of subs) {
    const company = await Company.findById(sub.companyId);
    if (!company) continue;
    const owner = await User.findById(company.ownerId);
    if (!owner) continue;
    const daysLeft = Math.ceil((sub.expiresAt.getTime() - now.getTime()) / 86400000);
    if (daysLeft <= 3) {
      await sendTrialExpiryReminder(owner.email, company.name, daysLeft);
      remindersSent += 1;
    }
  }

  await Subscription.updateMany(
    { status: 'trial', expiresAt: { $lt: now } },
    { $set: { status: 'expired' } }
  );

  const expiredCompanyIds = await Subscription.find({ status: 'expired' }).distinct('companyId');
  await Company.updateMany(
    { _id: { $in: expiredCompanyIds }, status: 'active' },
    { $set: { status: 'suspended' } }
  );

  return { remindersSent, expired: expiredCompanyIds.length };
}

function sanitizeUser(user: { _id: unknown; email: string; firstName: string; lastName: string; role: string; companyId?: unknown }) {
  return {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    companyId: user.companyId,
  };
}
