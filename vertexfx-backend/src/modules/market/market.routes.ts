import { Router, Request, Response } from 'express';
import { marketService } from './market.service';
import { ok, serverError, notFound } from '../../utils/response';

const router = Router();

router.get('/instruments', async (req: Request, res: Response) => {
  try {
    const instruments = await marketService.getInstruments(req.query.category as string);
    ok(res, instruments);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.get('/instruments/:symbol', async (req: Request, res: Response) => {
  try {
    const instrument = await marketService.getInstrument(req.params.symbol);
    if (!instrument) { notFound(res, 'Instrument not found'); return; }
    ok(res, instrument);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.get('/instruments/:symbol/price', async (req: Request, res: Response) => {
  try {
    const price = await marketService.getCurrentPrice(req.params.symbol);
    if (!price) { notFound(res, 'Price not available'); return; }
    ok(res, price);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

router.get('/instruments/:symbol/candles', async (req: Request, res: Response) => {
  try {
    const from = req.query.from ? new Date(req.query.from as string) : new Date(Date.now() - 7 * 86400000);
    const to = req.query.to ? new Date(req.query.to as string) : new Date();
    const candles = await marketService.getCandles(req.params.symbol, (req.query.timeframe as string) ?? 'H1', from, to);
    ok(res, candles);
  } catch (e: unknown) { serverError(res, (e as Error).message); }
});

export default router;
