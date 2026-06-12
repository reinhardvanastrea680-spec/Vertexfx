import { Router, Request, Response } from 'express';
import { authenticate, AuthRequest } from '../../middleware/authenticate';
import { usersService } from './users.service';
import { notificationService } from '../notifications/notification.service';
import { ok, serverError } from '../../utils/response';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/me', async (req: AuthRequest, res: Response) => {
  try {
    const user = await usersService.getMe(req.user!.userId);
    ok(res, user);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.patch('/me', async (req: AuthRequest, res: Response) => {
  try {
    const user = await usersService.updateProfile(req.user!.userId, req.body);
    ok(res, user, 'Profile updated');
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.post('/me/kyc', async (req: AuthRequest, res: Response) => {
  try {
    const doc = await usersService.submitKyc(req.user!.userId, req.body);
    ok(res, doc, 'KYC documents submitted for review');
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
});

router.get('/me/kyc', async (req: AuthRequest, res: Response) => {
  try {
    const docs = await usersService.getKycDocuments(req.user!.userId);
    ok(res, docs);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.get('/me/accounts', async (req: AuthRequest, res: Response) => {
  try {
    const accounts = await usersService.getTradingAccounts(req.user!.userId);
    ok(res, accounts);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.get('/me/notifications', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await usersService.getNotifications(req.user!.userId, page);
    ok(res, result);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.patch('/me/notifications/:id/read', async (req: AuthRequest, res: Response) => {
  try {
    await notificationService.markRead(req.params.id, req.user!.userId);
    ok(res, null, 'Marked as read');
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.post('/me/notifications/read-all', async (req: AuthRequest, res: Response) => {
  try {
    await notificationService.markAllRead(req.user!.userId);
    ok(res, null, 'All notifications marked as read');
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

export default router;
