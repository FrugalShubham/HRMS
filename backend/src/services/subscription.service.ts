import { Company, Plan, Subscription, Payment } from '../models';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors';

export async function getCompanySubscription(companyId: string) {
  const sub = await Subscription.findOne({ companyId }).populate('planId');
  if (!sub) throw new NotFoundError('Subscription not found');
  return sub;
}

export async function upgradePlan(companyId: string, planId: string) {
  const plan = await Plan.findById(planId);
  if (!plan || !plan.isActive) throw new NotFoundError('Plan not found');

  const company = await Company.findById(companyId);
  if (!company) throw new NotFoundError('Company not found');

  const startsAt = new Date();
  const expiresAt = new Date();
  expiresAt.setMonth(expiresAt.getMonth() + 1);

  const subscription = await Subscription.findOneAndUpdate(
    { companyId },
    {
      planId: plan._id,
      status: plan.slug === 'free-trial' ? 'trial' : 'active',
      startsAt,
      expiresAt: plan.durationDays
        ? new Date(Date.now() + plan.durationDays * 86400000)
        : expiresAt,
      autoRenew: true,
    },
    { upsert: true, new: true }
  );

  company.planId = plan._id;
  company.subscriptionId = subscription._id;
  company.features = plan.features as typeof company.features;
  company.status = 'active';
  await company.save();

  return { subscription, company, plan };
}

export async function downgradePlan(companyId: string, planId: string) {
  const company = await Company.findById(companyId);
  if (!company) throw new NotFoundError('Company not found');

  if (company.employeeCount > 0) {
    const newPlan = await Plan.findById(planId);
    if (newPlan && company.employeeCount > newPlan.maxEmployees) {
      throw new ValidationError(
        `Cannot downgrade: ${company.employeeCount} employees exceed plan limit of ${newPlan.maxEmployees}`
      );
    }
  }

  return upgradePlan(companyId, planId);
}

export async function cancelSubscription(companyId: string) {
  const sub = await Subscription.findOneAndUpdate(
    { companyId },
    { status: 'cancelled', autoRenew: false },
    { new: true }
  );
  if (!sub) throw new NotFoundError('Subscription not found');
  return sub;
}

export async function assignPlanBySuperAdmin(companyId: string, planId: string, customFeatures?: Record<string, boolean>) {
  const result = await upgradePlan(companyId, planId);
  if (customFeatures) {
    result.company.features = { ...result.company.features, ...customFeatures };
    await result.company.save();
  }
  return result;
}

export async function enforceEmployeeLimit(companyId: string) {
  const company = await Company.findById(companyId).populate('planId');
  if (!company) throw new NotFoundError('Company not found');
  const plan = company.planId as unknown as { maxEmployees: number } | null;
  const max = plan?.maxEmployees ?? 10;
  if (company.employeeCount >= max) {
    throw new ForbiddenError(`Employee limit (${max}) reached. Upgrade your plan.`);
  }
}

export async function getBillingHistory(companyId: string) {
  return Payment.find({ companyId }).sort({ createdAt: -1 }).limit(50);
}
