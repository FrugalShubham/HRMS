import { Response, NextFunction } from 'express';
import { AuditLog } from '../models';
import { TenantRequest } from './tenant';

export function auditLog(action: string, resource: string) {
  return async (req: TenantRequest, res: Response, next: NextFunction): Promise<void> => {
    const originalJson = res.json.bind(res);
    res.json = function (body: unknown) {
      if (res.statusCode < 400 && req.user) {
        AuditLog.create({
          companyId: req.tenantId,
          userId: req.user.id,
          action,
          resource,
          resourceId: (req.params as { id?: string }).id,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        }).catch(console.error);
      }
      return originalJson(body);
    };
    next();
  };
}
