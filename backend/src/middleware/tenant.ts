import { Response, NextFunction } from 'express';
import { Company, ICompany } from '../models/Company';
import { AuthenticatedRequest } from './auth';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { CompanyFeatures } from '../types';

export interface TenantRequest extends AuthenticatedRequest {
  tenantId?: string;
  company?: ICompany | null;
}

export async function tenantMiddleware(
  req: TenantRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) throw new UnauthorizedError();

  if (req.user.role === 'super_admin') {
    const headerTenant = req.headers['x-tenant-id'] as string | undefined;
    if (headerTenant) req.tenantId = headerTenant;
    return next();
  }

  if (!req.user.companyId) {
    throw new ForbiddenError('No company associated with user');
  }

  const company = await Company.findById(req.user.companyId);
  if (!company || company.status === 'deleted') {
    throw new ForbiddenError('Company not found');
  }
  if (company.status === 'suspended') {
    throw new ForbiddenError('Company account is suspended');
  }

  req.tenantId = req.user.companyId;
  req.company = company;
  next();
}

export function requireFeature(feature: keyof CompanyFeatures) {
  return (req: TenantRequest, _res: Response, next: NextFunction): void => {
    if (req.user?.role === 'super_admin') return next();
    const features = req.company?.features as CompanyFeatures | undefined;
    if (!features?.[feature]) {
      throw new ForbiddenError(`Feature "${feature}" is not enabled on your plan`);
    }
    next();
  };
}

export function getTenantFilter(req: TenantRequest): { companyId: string } | Record<string, never> {
  if (req.user?.role === 'super_admin' && !req.tenantId) return {};
  return { companyId: req.tenantId! };
}
