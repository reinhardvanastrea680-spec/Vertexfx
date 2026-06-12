import { prisma } from '../config/database';
import { getPrice } from '../config/redis';
import { emailService } from '../modules/notifications/email.service';
import { notificationService } from '../modules/notifications/notification.service';
import { logger } from '../utils/logger';

let monitorInterval: NodeJS.Timeout | null = null;

export function startPositionMonitor(io?: import('socket.io').Server): void {
  if (monitorInterval) return;

  monitorInterval = setInterval(async () => {
    try {
      await runMonitorCycle(io);
    } catch (error) {
      logger.error('Position monitor error:', error);
    }
  }, 2000); // Every 2 seconds

  logger.info('Position monitor started');
}

export function stopPositionMonitor(): void {
  if (monitorInterval) {
    clearInterval(monitorInterval);
    monitorInterval = null;
  }
}

async function runMonitorCycle(io?: import('socket.io').Server): Promise<void> {
  const positions = await prisma.position.findMany({
    include: {
      account: { select: { leverage: true, balance: true, margin: true, userId: true, accountNumber: true } },
      user: { select: { email: true, firstName: true } },
    },
  });

  if (!positions.length) return;

  const positionsByAccount = positions.reduce((acc, p) => {
    if (!acc[p.accountId]) acc[p.accountId] = [];
    acc[p.accountId].push(p);
    return acc;
  }, {} as Record<string, typeof positions>);

  for (const [accountId, accountPositions] of Object.entries(positionsByAccount)) {
    let totalFloatingPnl = 0;
    const updates: Array<{ id: string; floatingPnl: number; currentPrice: number }> = [];

    for (const position of accountPositions) {
      const priceData = await getPrice(position.symbol);
      if (!priceData) continue;

      const currentPrice = position.direction === 'buy' ? priceData.bid : priceData.ask;
      const instrument = await prisma.instrument.findUnique({ where: { symbol: position.symbol }, select: { contractSize: true } });
      const contractSize = Number(instrument?.contractSize ?? 100000);

      let floatingPnl: number;
      if (position.direction === 'buy') {
        floatingPnl = (currentPrice - Number(position.openPrice)) * Number(position.volume) * contractSize;
      } else {
        floatingPnl = (Number(position.openPrice) - currentPrice) * Number(position.volume) * contractSize;
      }

      totalFloatingPnl += floatingPnl;
      updates.push({ id: position.id, floatingPnl, currentPrice });

      // Check SL/TP
      await checkSlTp(position, currentPrice);
    }

    // Update all positions in batch
    await Promise.all(updates.map(u =>
      prisma.position.update({
        where: { id: u.id },
        data: { floatingPnl: u.floatingPnl, currentPrice: u.currentPrice },
      })
    ));

    // Update account equity and margin level
    const account = accountPositions[0].account;
    const equity = Number(account.balance) + totalFloatingPnl;
    const marginLevel = Number(account.margin) > 0 ? (equity / Number(account.margin)) * 100 : 0;

    await prisma.tradingAccount.update({
      where: { id: accountId },
      data: { equity, marginLevel },
    });

    // Broadcast to connected clients
    io?.to(`user:${account.userId}`).emit('account:update', { accountId, equity, marginLevel, floatingPnl: totalFloatingPnl });

    // Margin call check (100%)
    if (marginLevel > 0 && marginLevel <= 100 && marginLevel > 50) {
      const user = accountPositions[0].user;
      await handleMarginCall(account.userId, accountPositions[0].accountId, account.accountNumber, marginLevel, user);
    }

    // Stop-out (50%) — auto-close largest losing position
    if (marginLevel > 0 && marginLevel <= 50) {
      await executeStopOut(accountId, accountPositions, io);
    }
  }
}

async function checkSlTp(position: { id: string; userId: string; direction: string; stopLoss: unknown; takeProfit: unknown; currentPrice: unknown; openPrice: unknown }, currentPrice: number): Promise<void> {
  const sl = position.stopLoss ? Number(position.stopLoss) : null;
  const tp = position.takeProfit ? Number(position.takeProfit) : null;

  let shouldClose = false;

  if (position.direction === 'buy') {
    if (sl && currentPrice <= sl) shouldClose = true;
    if (tp && currentPrice >= tp) shouldClose = true;
  } else {
    if (sl && currentPrice >= sl) shouldClose = true;
    if (tp && currentPrice <= tp) shouldClose = true;
  }

  if (shouldClose) {
    const { tradingService } = await import('../modules/trading/trading.service');
    await tradingService.closePosition(position.id, position.userId, currentPrice);
  }
}

const marginCallNotified = new Set<string>();

async function handleMarginCall(
  userId: string,
  accountId: string,
  accountNumber: string,
  marginLevel: number,
  user: { email: string; firstName: string }
): Promise<void> {
  const notifyKey = `${accountId}:margin_call`;
  if (marginCallNotified.has(notifyKey)) return;

  marginCallNotified.add(notifyKey);
  setTimeout(() => marginCallNotified.delete(notifyKey), 60 * 60 * 1000); // Re-notify after 1 hour

  await notificationService.create({
    userId, type: 'margin_call',
    title: '⚠ Margin Call Warning',
    body: `Account ${accountNumber} has reached margin call level (${marginLevel.toFixed(0)}%). Deposit funds or close positions.`,
    metadata: { accountId, marginLevel },
  });

  await emailService.sendMarginCallWarning(user.email, user.firstName, accountNumber, marginLevel);
  logger.warn(`Margin call: user ${userId}, account ${accountNumber}, margin ${marginLevel.toFixed(0)}%`);
}

async function executeStopOut(
  accountId: string,
  positions: Array<{ id: string; userId: string; floatingPnl: unknown }>,
  io?: import('socket.io').Server
): Promise<void> {
  const sorted = [...positions].sort((a, b) => Number(a.floatingPnl) - Number(b.floatingPnl));
  const worstPosition = sorted[0];
  if (!worstPosition) return;

  logger.warn(`Stop-out triggered: account ${accountId}, closing position ${worstPosition.id}`);
  const { tradingService } = await import('../modules/trading/trading.service');
  await tradingService.closePosition(worstPosition.id, worstPosition.userId);

  await notificationService.create({
    userId: worstPosition.userId, type: 'stop_out',
    title: '🚨 Stop-Out Executed',
    body: 'A position was automatically closed due to insufficient margin.',
  });
}
