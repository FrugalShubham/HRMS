import { Company, User, Employee, Plan, Subscription, Payment } from '../models';
import { hashPassword } from './auth.password';
import { NotFoundError, ValidationError } from '../utils/errors';

export async function createCompany(params: {
  name: string;
  slug: string;
  ownerEmail: string;
  ownerPassword: string;
  ownerFirstName: string;
  ownerLastName: string;
  planSlug?: string;
}) {
  const existing = await Company.findOne({ slug: params.slug.toLowerCase() });
  if (existing) throw new ValidationError('Company slug already exists');

  const plan = await Plan.findOne({ slug: params.planSlug ?? 'free-trial', isActive: true });
  if (!plan) throw new NotFoundError('Plan not found');

  const passwordHash = await hashPassword(params.ownerPassword);
  const owner = await User.create({
    email: params.ownerEmail.toLowerCase(),
    passwordHash,
    firstName: params.ownerFirstName,
    lastName: params.ownerLastName,
    role: 'company_owner',
    isActive: true,
  });

  const startsAt = new Date();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (plan.durationDays ?? 14));

  const company = await Company.create({
    name: params.name,
    slug: params.slug.toLowerCase(),
    status: 'active',
    ownerId: owner._id,
    planId: plan._id,
    features: plan.features,
    employeeCount: 0,
  });

  const subscription = await Subscription.create({
    companyId: company._id,
    planId: plan._id,
    status: plan.slug === 'free-trial' ? 'trial' : 'active',
    startsAt,
    expiresAt,
  });

  company.subscriptionId = subscription._id;
  await company.save();

  owner.companyId = company._id;
  await owner.save();

  return { company, owner, subscription };
}

export async function updateCompanyStatus(companyId: string, status: 'active' | 'suspended' | 'deleted') {
  const company = await Company.findByIdAndUpdate(companyId, { status }, { new: true });
  if (!company) throw new NotFoundError('Company not found');
  return company;
}

export async function getPlatformAnalytics() {
  const [companies, activeCompanies, employees, revenue, users] = await Promise.all([
    Company.countDocuments({ status: { $ne: 'deleted' } }),
    Company.countDocuments({ status: 'active' }),
    Employee.countDocuments(),
    Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    User.countDocuments({ isActive: true, lastLoginAt: { $gte: new Date(Date.now() - 86400000) } }),
  ]);

  const plans = await Plan.find({ isActive: true }).sort({ sortOrder: 1 });
  const subscriptionsByPlan = await Subscription.aggregate([
    { $group: { _id: '$planId', count: { $sum: 1 } } },
  ]);

  return {
    companies: { total: companies, active: activeCompanies },
    employees,
    revenue: revenue[0]?.total ?? 0,
    activeUsers24h: users,
    plans,
    subscriptionsByPlan,
  };
}

export async function updatePlanFeatures(planId: string, features: Record<string, boolean>) {
  const plan = await Plan.findByIdAndUpdate(planId, { features }, { new: true });
  if (!plan) throw new NotFoundError('Plan not found');
  return plan;
}

export async function adjustCredits(companyId: string, aiCredits?: number, whatsappCredits?: number) {
  const update: Record<string, number> = {};
  if (aiCredits !== undefined) update.aiCredits = aiCredits;
  if (whatsappCredits !== undefined) update.whatsappCredits = whatsappCredits;
  const company = await Company.findByIdAndUpdate(companyId, update, { new: true });
  if (!company) throw new NotFoundError('Company not found');
  return company;
}
