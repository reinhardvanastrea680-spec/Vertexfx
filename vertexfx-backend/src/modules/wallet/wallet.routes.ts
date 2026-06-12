import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../../middleware/authenticate';
import { walletService } from './wallet.service';
import { withdrawalLimiter } from '../../middleware/rateLimiter';
import { ok, created, serverError } from '../../utils/response';

const router = Router();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try { ok(res, await walletService.getWallet(req.user!.userId)); }
  catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.post('/deposit', async (req: AuthRequest, res: Response) => {
  try {
    const result = await walletService.initiateDeposit(req.user!.userId, {
      ...req.body, ipAddress: req.socket.remoteAddress,
    });
    created(res, result, 'Deposit initiated');
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
});

router.post('/withdraw', withdrawalLimiter, async (req: AuthRequest, res: Response) => {
  try {
    const result = await walletService.requestWithdrawal(req.user!.userId, {
      ...req.body, ipAddress: req.socket.remoteAddress,
    });
    created(res, result, result.message);
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
});

router.get('/transactions', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await walletService.getTransactions(req.user!.userId, page, 20, req.query.type as string);
    ok(res, result);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.get('/bank-accounts', async (req: AuthRequest, res: Response) => {
  try {
    const wallet = await walletService.getWallet(req.user!.userId);
    ok(res, wallet.bankAccounts);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.post('/bank-accounts', async (req: AuthRequest, res: Response) => {
  try {
    const wallet = await walletService.getWallet(req.user!.userId);
    const result = await walletService.addBankAccount(req.user!.userId, wallet.id, req.body);
    created(res, result, 'Bank account added');
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.delete('/bank-accounts/:id', async (req: AuthRequest, res: Response) => {
  try {
    await walletService.deleteBankAccount(req.params.id, req.user!.userId);
    ok(res, null, 'Bank account removed');
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
});

export default router;
