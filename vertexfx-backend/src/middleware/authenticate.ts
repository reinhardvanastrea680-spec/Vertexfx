import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { unauthorized } from '../utils/response';
import { prisma } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    email: string;
  };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      unauthorized(res, 'No token provided');
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, status: true, role: true, email: true },
    });

    if (!user || user.status === 'banned' || user.status === 'closed') {
      unauthorized(res, 'Account is inactive');
      return;
    }

    if (user.status === 'suspended') {
      unauthorized(res, 'Account is suspended');
      return;
    }

    req.user = { userId: payload.userId, role: user.role, email: user.email };
    next();
  } catch {
    unauthorized(res, 'Invalid or expired token');
  }
}
