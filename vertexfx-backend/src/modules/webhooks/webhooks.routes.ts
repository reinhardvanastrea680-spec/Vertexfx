import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { env } from '../../config/env';
import { walletService } from '../wallet/wallet.service';
import { logger } from '../../utils/logger';

const router = Router();

// ─── Stripe Webhook ───────────────────────────────────────────────────────────
router.post('/stripe', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  if (!sig || !env.STRIPE_WEBHOOK_SECRET) {
    res.status(400).json({ error: 'No signature' });
    return;
  }

  // In production, use: stripe.webhooks.constructEvent(req.rawBody, sig, env.STRIPE_WEBHOOK_SECRET)
  // Here we do manual HMAC verification
  const payload = JSON.stringify(req.body);
  const expectedSig = crypto
    .createHmac('sha256', env.STRIPE_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (!sig.includes(expectedSig) && env.isProd) {
    logger.warn('Stripe webhook: invalid signature');
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  // Acknowledge immediately
  res.status(200).json({ received: true });

  // Process asynchronously
  setImmediate(async () => {
    try {
      const event = req.body;
      if (event.type === 'payment_intent.succeeded') {
        const metadata = event.data.object.metadata;
        if (metadata?.transactionId) {
          await walletService.confirmDeposit(metadata.transactionId, event.data.object.id, event.data.object);
        }
      }
    } catch (error) {
      logger.error('Stripe webhook processing error:', error);
    }
  });
});

// ─── Flutterwave Webhook ──────────────────────────────────────────────────────
router.post('/flutterwave', async (req: Request, res: Response) => {
  const secretHash = req.headers['verif-hash'];
  if (secretHash !== env.FLUTTERWAVE_WEBHOOK_SECRET && env.isProd) {
    logger.warn('Flutterwave webhook: invalid hash');
    res.status(401).json({ error: 'Invalid hash' });
    return;
  }

  res.status(200).json({ status: 'success' });

  setImmediate(async () => {
    try {
      const { event, data } = req.body;
      if (event === 'charge.completed' && data.status === 'successful') {
        const meta = data.meta ?? {};
        if (meta.transactionId) {
          await walletService.confirmDeposit(meta.transactionId, data.flw_ref, data);
        }
      }
    } catch (error) {
      logger.error('Flutterwave webhook error:', error);
    }
  });
});

// ─── Paystack Webhook ─────────────────────────────────────────────────────────
router.post('/paystack', async (req: Request, res: Response) => {
  const hash = req.headers['x-paystack-signature'];
  const computedHash = crypto
    .createHmac('sha512', env.PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== computedHash && env.isProd) {
    logger.warn('Paystack webhook: invalid signature');
    res.status(401).json({ error: 'Invalid signature' });
    return;
  }

  res.status(200).json({ status: 'success' });

  setImmediate(async () => {
    try {
      const { event, data } = req.body;
      if (event === 'charge.success') {
        const meta = data.metadata ?? {};
        if (meta.transactionId) {
          await walletService.confirmDeposit(meta.transactionId, data.reference, data);
        }
      }
    } catch (error) {
      logger.error('Paystack webhook error:', error);
    }
  });
});

export default router;
