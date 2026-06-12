import { prisma } from '../../config/database';
import { logger } from '../../utils/logger';

interface AmlRule {
  type: string;
  check: (amount: number, userId: string) => Promise<{ triggered: boolean; score: number; details: object }>;
}

export const amlService = {
  async screenTransaction(userId: string, transactionId: string, amount: number, direction: 'deposit' | 'withdrawal') {
    const alerts: Array<{ type: string; score: number; details: object }> = [];

    // Rule 1: Large single transaction
    if (amount >= 10000) {
      alerts.push({
        type: 'Large Cash Deposit',
        score: Math.min(30 + Math.floor(amount / 1000), 80),
        details: { amount, threshold: 10000, rule: 'single_large_transaction' },
      });
    }

    // Rule 2: Structuring — multiple small deposits summing > $5000 in 24h
    if (direction === 'deposit' && amount < 3000) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentDeposits = await prisma.transaction.aggregate({
        where: { userId, type: 'deposit', status: 'completed', createdAt: { gte: oneDayAgo } },
        _sum: { amount: true },
        _count: { id: true },
      });
      const totalToday = Number(recentDeposits._sum.amount ?? 0) + amount;
      if (totalToday > 5000 && (recentDeposits._count.id ?? 0) >= 3) {
        alerts.push({
          type: 'Structuring Suspected',
          score: 75,
          details: { totalInWindow: totalToday, transactionCount: recentDeposits._count.id, threshold: 5000 },
        });
      }
    }

    // Rule 3: Rapid deposit-withdrawal (deposit then withdraw within 24h)
    if (direction === 'withdrawal') {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentDeposit = await prisma.transaction.findFirst({
        where: { userId, type: 'deposit', status: 'completed', createdAt: { gte: oneDayAgo } },
      });
      if (recentDeposit) {
        alerts.push({
          type: 'Rapid Deposit-Withdrawal',
          score: 70,
          details: { depositId: recentDeposit.id, depositAmount: recentDeposit.amount },
        });
      }
    }

    // Create alert records
    for (const alert of alerts) {
      await prisma.amlAlert.create({
        data: {
          userId,
          transactionId,
          alertType: alert.type,
          amount,
          riskScore: alert.score,
          details: alert.details,
          status: 'open',
        },
      });
      logger.warn(`AML Alert: ${alert.type} for user ${userId} — score ${alert.score}`);
    }
  },
};
