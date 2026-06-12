import { Request, Response } from 'express';
import { authService } from './auth.service';
import { AuthRequest } from '../../middleware/authenticate';
import { ok, created, badRequest, serverError } from '../../utils/response';

function getIp(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? req.socket.remoteAddress ?? 'unknown';
}

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const result = await authService.register(req.body, getIp(req));
      created(res, result, result.message);
    } catch (err: unknown) {
      const e = err as Error & { statusCode?: number };
      res.status(e.statusCode ?? 500).json({ success: false, message: e.message });
    }
  },

  async verifyEmail(req: Request, res: Response) {
    try {
      const result = await authService.verifyEmail(req.params.token);
      ok(res, result, result.message);
    } catch (err: unknown) {
      const e = err as Error & { statusCode?: number };
      res.status(e.statusCode ?? 500).json({ success: false, message: e.message });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const result = await authService.login(req.body, getIp(req), req.headers['user-agent'] ?? '');
      if ('requiresTwoFA' in result && result.requiresTwoFA) {
        ok(res, { requiresTwoFA: true, tempToken: result.tempToken });
        return;
      }
      const { accessToken, refreshToken, user } = result as { accessToken: string; refreshToken: string; user: object };
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth/refresh',
      });
      ok(res, { accessToken, user });
    } catch (err: unknown) {
      const e = err as Error & { statusCode?: number };
      res.status(e.statusCode ?? 500).json({ success: false, message: e.message });
    }
  },

  async verifyTwoFA(req: Request, res: Response) {
    try {
      const { tempToken, code } = req.body;
      const result = await authService.verifyTwoFA(tempToken, code, getIp(req), req.headers['user-agent'] ?? '');
      const { accessToken, refreshToken, user } = result;
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth/refresh',
      });
      ok(res, { accessToken, user });
    } catch (err: unknown) {
      const e = err as Error & { statusCode?: number };
      res.status(e.statusCode ?? 500).json({ success: false, message: e.message });
    }
  },

  async refresh(req: Request, res: Response) {
    try {
      const token = req.cookies?.refreshToken;
      if (!token) { res.status(401).json({ success: false, message: 'No refresh token' }); return; }
      const result = await authService.refresh(token);
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/api/auth/refresh',
      });
      ok(res, { accessToken: result.accessToken });
    } catch (err: unknown) {
      const e = err as Error & { statusCode?: number };
      res.status(e.statusCode ?? 401).json({ success: false, message: e.message });
    }
  },

  async logout(req: Request, res: Response) {
    try {
      const token = req.cookies?.refreshToken ?? '';
      await authService.logout(token);
      res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
      ok(res, null, 'Logged out successfully');
    } catch {
      ok(res, null, 'Logged out');
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const result = await authService.forgotPassword(req.body.email);
      ok(res, null, result.message);
    } catch (err: unknown) {
      const e = err as Error & { statusCode?: number };
      res.status(e.statusCode ?? 500).json({ success: false, message: e.message });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const result = await authService.resetPassword(req.body);
      ok(res, null, result.message);
    } catch (err: unknown) {
      const e = err as Error & { statusCode?: number };
      res.status(e.statusCode ?? 500).json({ success: false, message: e.message });
    }
  },

  async setup2FA(req: AuthRequest, res: Response) {
    try {
      const result = await authService.setup2FA(req.user!.userId);
      ok(res, result);
    } catch (err: unknown) {
      const e = err as Error & { statusCode?: number };
      res.status(e.statusCode ?? 500).json({ success: false, message: e.message });
    }
  },

  async confirm2FA(req: AuthRequest, res: Response) {
    try {
      const result = await authService.confirm2FA(req.user!.userId, req.body.code);
      ok(res, null, result.message);
    } catch (err: unknown) {
      const e = err as Error & { statusCode?: number };
      res.status(e.statusCode ?? 500).json({ success: false, message: e.message });
    }
  },

  async disable2FA(req: AuthRequest, res: Response) {
    try {
      const result = await authService.disable2FA(req.user!.userId, req.body.code);
      ok(res, null, result.message);
    } catch (err: unknown) {
      const e = err as Error & { statusCode?: number };
      res.status(e.statusCode ?? 500).json({ success: false, message: e.message });
    }
  },
};
