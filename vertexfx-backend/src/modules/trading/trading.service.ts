import Decimal from 'decimal.js';
import { prisma } from '../../config/database';
import { getPrice } from '../../config/redis';
import { notificationService } from '../notifications/notification.service';
import { emailService } from '../notifications/email.service';
import { createAuditLog } from '../../utils/auditLog';

function generateTicket(): string {
  return `VFX-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export const tradingService = {
  // ─── Place Order ──────────────────────────────────────────────────────────
  async placeOrder(userId: string, data: {
    accountId: string;
    symbol: string;
    direction: 'buy' | 'sell';
    volume: number;
    orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
    stopLoss?: number;
    takeProfit?: number;
    requestedPrice?: number;
    ipAddress?: string;
    platform?: string;
  }) {
    // 1. Load account
    const account = await prisma.tradingAccount.findFirst({
      where: { id: data.accountId, userId, status: 'active' },
    });
    if (!account) throw Object.assign(new Error('Account not found or inactive'), { statusCode: 404 });

    // 2. Load instrument
    const instrument = await prisma.instrument.findUnique({ where: { symbol: data.symbol } });
    if (!instrument) throw Object.assign(new Error('Instrument not found'), { statusCode: 404 });
    if (!instrument.isActive) throw Object.assign(new Error('Instrument is not available for trading'), { statusCode: 400 });

    // 3. Validate volume
    const vol = new Decimal(data.volume);
    if (vol.lt(instrument.minLot.toString()) || vol.gt(instrument.maxLot.toString())) {
      throw Object.assign(new Error(`Volume must be between ${instrument.minLot} and ${instrument.maxLot} lots`), { statusCode: 400 });
    }

    // 4. Get current price
    const priceData = await getPrice(data.symbol);
    const currentPrice = priceData
      ? (data.direction === 'buy' ? priceData.ask : priceData.bid)
      : (data.requestedPrice ?? 1.0);
    const executionPrice = data.orderType === 'market' ? currentPrice : (data.requestedPrice ?? currentPrice);

    // 5. Margin check
    const contractSize = new Decimal(instrument.contractSize.toString());
    const leverage = new Decimal(account.leverage);
    const requiredMargin = vol.mul(contractSize).mul(executionPrice).div(leverage);

    if (requiredMargin.gt(account.freeMargin.toString())) {
      throw Object.assign(new Error('Insufficient free margin'), { statusCode: 400 });
    }

    // 6. Execute in transaction
    const order = await prisma.$transaction(async (tx) => {
      const o = await tx.order.create({
        data: {
          accountId: data.accountId,
          userId,
          instrumentId: instrument.id,
          symbol: data.symbol,
          orderType: data.orderType,
          direction: data.direction,
          volume: vol.toNumber(),
          openPrice: executionPrice,
          requestedPrice: data.requestedPrice ?? executionPrice,
          stopLoss: data.stopLoss,
          takeProfit: data.takeProfit,
          status: data.orderType === 'market' ? 'open' : 'pending',
          openTime: data.orderType === 'market' ? new Date() : null,
          ticketNumber: generateTicket(),
          ipAddress: data.ipAddress,
          platform: (data.platform ?? 'webtrader') as 'mt4' | 'mt5' | 'webtrader' | 'api',
        },
      });

      if (data.orderType === 'market') {
        await tx.position.create({
          data: {
            orderId: o.id,
            accountId: data.accountId,
            userId,
            symbol: data.symbol,
            direction: data.direction,
            volume: vol.toNumber(),
            openPrice: executionPrice,
            currentPrice: executionPrice,
            stopLoss: data.stopLoss,
            takeProfit: data.takeProfit,
            floatingPnl: 0,
            marginUsed: requiredMargin.toNumber(),
            openTime: new Date(),
          },
        });

        // Deduct margin
        await tx.tradingAccount.update({
          where: { id: data.accountId },
          data: {
            margin: { increment: requiredMargin.toNumber() },
            freeMargin: { decrement: requiredMargin.toNumber() },
          },
        });
      }

      return o;
    });

    await notificationService.create({
      userId,
      type: 'trade_opened',
      title: 'Trade Opened',
      body: `${data.direction.toUpperCase()} ${data.volume} lots ${data.symbol} at ${executionPrice.toFixed(5)}`,
      metadata: { ticketNumber: order.ticketNumber, symbol: data.symbol },
    });

    return order;
  },

  // ─── Close Position ───────────────────────────────────────────────────────
  async closePosition(positionId: string, userId: string, closePrice?: number) {
    const position = await prisma.position.findFirst({
      where: { id: positionId, userId },
      include: { order: true, account: true },
    });
    if (!position) throw Object.assign(new Error('Position not found'), { statusCode: 404 });

    const priceData = await getPrice(position.symbol);
    const executionPrice = closePrice
      ?? (priceData ? (position.direction === 'buy' ? priceData.bid : priceData.ask) : Number(position.currentPrice));

    const instrument = await prisma.instrument.findUnique({ where: { symbol: position.symbol } });
    const contractSize = instrument ? Number(instrument.contractSize) : 100000;

    let pnl: number;
    if (position.direction === 'buy') {
      pnl = (executionPrice - Number(position.openPrice)) * Number(position.volume) * contractSize;
    } else {
      pnl = (Number(position.openPrice) - executionPrice) * Number(position.volume) * contractSize;
    }

    const commission = Number(position.volume) * Number(instrument?.commissionPerLot ?? 0);
    const swap = Number(position.swapAccumulated);
    const netPnl = pnl - commission - swap;

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: position.orderId },
        data: {
          status: 'closed',
          closeTime: new Date(),
          closePrice: executionPrice,
          profitLoss: netPnl,
          commission,
          swap,
        },
      });

      await tx.position.delete({ where: { id: positionId } });

      await tx.tradingAccount.update({
        where: { id: position.accountId },
        data: {
          balance: { increment: netPnl },
          margin: { decrement: Number(position.marginUsed) },
          freeMargin: { increment: Number(position.marginUsed) },
        },
      });
    });

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, firstName: true } });
    if (user) {
      await notificationService.create({
        userId,
        type: 'trade_closed',
        title: 'Trade Closed',
        body: `${position.symbol} ${position.direction.toUpperCase()} closed. P&L: ${netPnl >= 0 ? '+' : ''}$${netPnl.toFixed(2)}`,
        metadata: { pnl: netPnl },
      });
    }

    return { message: 'Position closed', pnl: netPnl, commission, swap };
  },

  // ─── Modify Position SL/TP ────────────────────────────────────────────────
  async modifyPosition(positionId: string, userId: string, stopLoss?: number, takeProfit?: number) {
    const position = await prisma.position.findFirst({ where: { id: positionId, userId } });
    if (!position) throw Object.assign(new Error('Position not found'), { statusCode: 404 });

    await prisma.$transaction([
      prisma.position.update({ where: { id: positionId }, data: { stopLoss, takeProfit } }),
      prisma.order.update({ where: { id: position.orderId }, data: { stopLoss, takeProfit } }),
    ]);

    return { message: 'Position modified' };
  },

  // ─── Get open positions ───────────────────────────────────────────────────
  async getOpenPositions(accountId: string, userId: string) {
    return prisma.position.findMany({
      where: { accountId, userId },
      include: { order: { select: { ticketNumber: true, orderType: true, platform: true } } },
    });
  },

  // ─── Get order history ────────────────────────────────────────────────────
  async getOrderHistory(accountId: string, userId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { accountId, userId, status: { in: ['closed', 'cancelled', 'rejected'] } },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
      }),
      prisma.order.count({ where: { accountId, userId, status: { in: ['closed', 'cancelled', 'rejected'] } } }),
    ]);
    return { orders, total };
  },

  // ─── Cancel pending order ─────────────────────────────────────────────────
  async cancelOrder(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId, status: 'pending' } });
    if (!order) throw Object.assign(new Error('Pending order not found'), { statusCode: 404 });
    return prisma.order.update({ where: { id: orderId }, data: { status: 'cancelled' } });
  },
};
