import { Response, NextFunction } from 'express';
import { AuthRequest } from './authenticate';
import { forbidden } from '../utils/response';

export function authorize(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      forbidden(res, 'Not authenticated');
      return;
    }
    if (roles.length && !roles.includes(req.user.role)) {
      forbidden(res, 'Insufficient permissions');
      return;
    }
    next();
  };
}

// Convenience wrappers
export const adminOnly = authorize('admin', 'super_admin');
export const superAdminOnly = authorize('super_admin');
export const complianceAndAbove = authorize('compliance', 'admin', 'super_admin');
export const financeAndAbove = authorize('finance', 'admin', 'super_admin');
export const riskAndAbove = authorize('risk_manager', 'admin', 'super_admin');
export const supportAndAbove = authorize('support', 'compliance', 'finance', 'risk_manager', 'admin', 'super_admin');
