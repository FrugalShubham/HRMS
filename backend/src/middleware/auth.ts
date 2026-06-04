import { Request, Response, NextFunction } from 'express';
import { User } from '../models';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { Permission, roleHasPermission } from '../config/permissions';
import { JwtPayload } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { id: string };
}

export async function authenticate(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Missing or invalid token');
  }

  const token = header.slice(7);
  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select('+passwordHash');
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User inactive or not found');
    }
    req.user = { ...payload, id: payload.sub };
    next();
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}

export function authorize(...permissions: Permission[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) throw new UnauthorizedError();
    const hasAny = permissions.some((p) => roleHasPermission(req.user!.role, p));
    if (!hasAny) throw new ForbiddenError('Insufficient permissions');
    next();
  };
}

export function requireSuperAdmin(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void {
  if (req.user?.role !== 'super_admin') {
    throw new ForbiddenError('Super admin access required');
  }
  next();
}
