import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../../middleware/authenticate';
import { tradingService } from './trading.service';
import { ok, created, serverError } from '../../utils/response';

const router = Router();
router.use(authenticate);

// Orders
router.post('/orders', async (req: AuthRequest, res: Response) => {
  try {
    const order = await tradingService.placeOrder(req.user!.userId, {
      ...req.body,
      ipAddress: req.socket.remoteAddress,
    });
    created(res, order, 'Order placed successfully');
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
});

router.get('/orders', async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await tradingService.getOrderHistory(req.query.accountId as string, req.user!.userId, page);
    ok(res, result);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.delete('/orders/:id', async (req: AuthRequest, res: Response) => {
  try {
    const result = await tradingService.cancelOrder(req.params.id, req.user!.userId);
    ok(res, result, 'Order cancelled');
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
});

// Positions
router.get('/positions', async (req: AuthRequest, res: Response) => {
  try {
    const positions = await tradingService.getOpenPositions(req.query.accountId as string, req.user!.userId);
    ok(res, positions);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.post('/positions/:id/close', async (req: AuthRequest, res: Response) => {
  try {
    const result = await tradingService.closePosition(req.params.id, req.user!.userId, req.body.closePrice);
    ok(res, result, 'Position closed');
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
});

router.post('/positions/:id/modify', async (req: AuthRequest, res: Response) => {
  try {
    const result = await tradingService.modifyPosition(req.params.id, req.user!.userId, req.body.stopLoss, req.body.takeProfit);
    ok(res, result, 'Position modified');
  } catch (e: unknown) {
    const err = e as Error & { statusCode?: number };
    res.status(err.statusCode ?? 500).json({ success: false, message: err.message });
  }
});

export default router;
