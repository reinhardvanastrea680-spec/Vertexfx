import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../../middleware/authenticate';
import { adminOnly, superAdminOnly, complianceAndAbove, financeAndAbove } from '../../middleware/authorize';
import { adminService } from './admin.service';
import { ok, created, serverError } from '../../utils/response';

const router = Router();

// All admin routes require authentication + admin role minimum
router.use(authenticate);
router.use(adminOnly);

function ip(req: AuthRequest): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ?? req.socket.remoteAddress ?? 'unknown';
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard/stats', async (_req, res: Response) => {
  try { ok(res, await adminService.getDashboardStats()); }
  catch (e: unknown) { serverError(res, (e as Error).message); }
});

// ─── Users ────────────────────────────────────────────────────────────────────
router.get('/users', async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.getUsers({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 25,
      search: req.query.search as string,
      status: req.query.status as string,
      kyc: req.query.kyc as string,
      country: req.query.country as string,
    });
    ok(res, result);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.get('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await adminService.getUserById(req.params.id);
    if (!user) { res.status(404).json({ success: false, message: 'User not found' }); return; }
    ok(res, user);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.patch('/users/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.updateUserStatus(req.params.id, req.body.status, req.user!.userId, ip(req));
    ok(res, result, 'User status updated');
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.get('/users/:id/trades', async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.getUserTrades(req.params.id, parseInt(req.query.page as string) || 1);
    ok(res, result);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.get('/users/:id/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.getUserTransactions(req.params.id, parseInt(req.query.page as string) || 1);
    ok(res, result);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

// ─── KYC ─────────────────────────────────────────────────────────────────────
router.get('/kyc', complianceAndAbove, async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.getKycQueue(req.query.status as string, parseInt(req.query.page as string) || 1);
    ok(res, result);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.post('/kyc/:id/approve', complianceAndAbove, async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.approveKyc(req.params.id, req.user!.userId, ip(req));
    ok(res, null, result.message);
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
});

router.post('/kyc/:id/reject', complianceAndAbove, async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.rejectKyc(req.params.id, req.user!.userId, req.body.reason, ip(req));
    ok(res, null, result.message);
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
});

// ─── Withdrawals ──────────────────────────────────────────────────────────────
router.get('/withdrawals/pending', financeAndAbove, async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.getWithdrawalQueue(parseInt(req.query.page as string) || 1);
    ok(res, result);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.post('/withdrawals/:id/approve', financeAndAbove, async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.approveWithdrawal(req.params.id, req.user!.userId, ip(req));
    ok(res, null, result.message);
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
});

router.post('/withdrawals/:id/reject', financeAndAbove, async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.rejectWithdrawal(req.params.id, req.user!.userId, req.body.reason, ip(req));
    ok(res, null, result.message);
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
});

// ─── Transactions (Deposits/Withdrawals) ──────────────────────────────────────
router.get('/transactions', financeAndAbove, async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.getAllTransactions(
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.limit as string) || 100,
      req.query.type as string
    );
    ok(res, result);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

// ─── Trading Accounts ────────────────────────────────────────────────────────
router.get('/trading-accounts', async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.getAllTradingAccounts(
      parseInt(req.query.page as string) || 1,
      parseInt(req.query.limit as string) || 100
    );
    ok(res, result);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

// ─── Trading ──────────────────────────────────────────────────────────────────
router.get('/trades', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await adminService.getUserTrades(req.query.userId as string || '', page);
    ok(res, result);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.get('/positions/open', async (_req, res: Response) => {
  try { ok(res, await adminService.getAllOpenPositions()); }
  catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.post('/positions/:id/close', async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.forceClosePosition(req.params.id, req.user!.userId, req.body.reason, req.body.notes, ip(req));
    ok(res, result, 'Position force-closed');
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
});

// ─── Instruments ──────────────────────────────────────────────────────────────
router.get('/instruments', async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.getInstruments(parseInt(req.query.page as string) || 1, 50, req.query.category as string);
    ok(res, result);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.post('/instruments', async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.createInstrument(req.body, req.user!.userId);
    created(res, result, 'Instrument created');
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.patch('/instruments/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.updateInstrument(req.params.id, req.body, req.user!.userId);
    ok(res, result, 'Instrument updated');
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

// ─── AML ─────────────────────────────────────────────────────────────────────
router.get('/aml-alerts', complianceAndAbove, async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.getAmlAlerts(req.query.status as string, parseInt(req.query.page as string) || 1);
    ok(res, result);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.post('/aml-alerts/:id/resolve', complianceAndAbove, async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.resolveAmlAlert(req.params.id, req.body.action, req.user!.userId, req.body.resolution, ip(req));
    ok(res, null, result.message);
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
});

// ─── Reports ──────────────────────────────────────────────────────────────────
router.get('/reports/financial', complianceAndAbove, async (req: AuthRequest, res: Response) => {
  try {
    const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 86400000);
    const to = req.query.to ? new Date(req.query.to as string) : new Date();
    ok(res, await adminService.getFinancialReport(from, to));
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.get('/reports/trading', async (req: AuthRequest, res: Response) => {
  try {
    const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 86400000);
    const to = req.query.to ? new Date(req.query.to as string) : new Date();
    ok(res, await adminService.getTradingReport(from, to));
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.get('/reports/clients', async (req: AuthRequest, res: Response) => {
  try {
    const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 30 * 86400000);
    const to = req.query.to ? new Date(req.query.to as string) : new Date();
    ok(res, await adminService.getClientReport(from, to));
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

// ─── Audit Logs ───────────────────────────────────────────────────────────────
router.get('/audit-logs', complianceAndAbove, async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.getAuditLogs({
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
      actorId: req.query.actorId as string,
      targetUserId: req.query.targetUserId as string,
      severity: req.query.severity as string,
      from: req.query.from ? new Date(req.query.from as string) : undefined,
      to: req.query.to ? new Date(req.query.to as string) : undefined,
    });
    ok(res, result);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

// ─── Announcements ────────────────────────────────────────────────────────────
router.post('/announcements', async (req: AuthRequest, res: Response) => {
  try {
    ok(res, { id: `ann_${Date.now()}`, ...req.body, createdAt: new Date() }, 'Announcement created');
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

// ─── System Settings ──────────────────────────────────────────────────────────
router.get('/settings', async (_req, res: Response) => {
  try { ok(res, await adminService.getSettings()); }
  catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.patch('/settings/:key', superAdminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.updateSetting(req.params.key, req.body.value, req.user!.userId);
    ok(res, result, 'Setting updated');
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

// ─── Staff ────────────────────────────────────────────────────────────────────
router.get('/staff', superAdminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.getStaffMembers(parseInt(req.query.page as string) || 1);
    ok(res, result);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.post('/staff', superAdminOnly, async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.createStaffAccount(req.body, req.user!.userId);
    created(res, result, 'Staff account created');
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
});

// ─── Balance Adjustment ───────────────────────────────────────────────────────
router.post('/users/:id/adjust-balance', async (req: AuthRequest, res: Response) => {
  try {
    const result = await adminService.adjustBalance(
      req.params.id, req.body.amount, req.body.direction, req.body.reason, req.user!.userId, ip(req)
    );
    ok(res, result, 'Balance adjusted');
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
});

export default router;
