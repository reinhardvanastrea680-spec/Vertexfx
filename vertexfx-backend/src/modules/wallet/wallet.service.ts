import Decimal from 'decimal.js';
import { prisma } from '../../config/database';
import { notificationService } from '../notifications/notification.service';
import { emailService } from '../notifications/email.service';
import { amlService } from '../compliance/aml.service';

export const walletService = {
  async getWallet(userId: string) {
    const wallet = await prisma.walletAccount.findUnique({
      where: { userId },
      include: { bankAccounts: true },
    });
    if (!wallet) throw Object.assign(new Error('Wallet not found'), { statusCode: 404 });
    return wallet;
  },

  // ─── Initiate Deposit ─────────────────────────────────────────────────────
  async initiateDeposit(userId: string, data: {
    amount: number;
    currency: string;
    paymentMethod: 'card' | 'bank_transfer' | 'crypto' | 'flutterwave' | 'paystack';
    ipAddress?: string;
  }) {
    if (data.amount <= 0) throw Object.assign(new Error('Amount must be positive'), { statusCode: 400 });

    const wallet = await prisma.walletAccount.findUnique({ where: { userId } });
    if (!wallet) throw Object.assign(new Error('Wallet not found'), { statusCode: 404 });

    const fee = this._calculateDepositFee(data.paymentMethod, data.amount);
    const netAmount = data.amount - fee;

    const tx = await prisma.transaction.create({
      data: {
        userId,
        walletId: wallet.id,
        type: 'deposit',
        direction: 'credit',
        amount: data.amount,
        currency: data.currency,
        status: 'pending',
        paymentMethod: data.paymentMethod,
        fee,
        netAmount,
        balanceBefore: Number(wallet.balance),
        balanceAfter: Number(wallet.balance) + netAmount,
        ipAddress: data.ipAddress,
      },
    });

    return { transactionId: tx.id, amount: data.amount, fee, netAmount };
  },

  // ─── Confirm Deposit (called by webhook) ─────────────────────────────────
  async confirmDeposit(transactionId: string, gatewayReference: string, gatewayResponse: object) {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: { select: { id: true, email: true, firstName: true } }, wallet: true },
    });
    if (!tx) throw Object.assign(new Error('Transaction not found'), { statusCode: 404 });
    if (tx.status === 'completed') return { message: 'Already processed' }; // Idempotent

    const netAmount = Number(tx.netAmount);
    const newBalance = Number(tx.wallet.balance) + netAmount;

    await prisma.$transaction(async (db) => {
      await db.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'completed',
          paymentReference: gatewayReference,
          gatewayResponse: gatewayResponse,
          balanceAfter: newBalance,
          processedAt: new Date(),
        },
      });

      await db.walletAccount.update({
        where: { id: tx.walletId },
        data: {
          balance: { increment: netAmount },
          totalDeposited: { increment: netAmount },
        },
      });
    });

    // AML check
    await amlService.screenTransaction(tx.userId, transactionId, netAmount, 'deposit');

    // Notifications
    await notificationService.create({
      userId: tx.userId,
      type: 'deposit_received',
      title: 'Deposit Confirmed',
      body: `Your deposit of ${tx.currency} ${netAmount.toLocaleString()} has been credited to your wallet.`,
      metadata: { transactionId },
    });
    await emailService.sendDepositConfirmation(tx.user.email, tx.user.firstName, netAmount, tx.currency);

    // Check first deposit referral
    await this._handleFirstDeposit(tx.userId, netAmount);

    return { message: 'Deposit confirmed', balance: newBalance };
  },

  // ─── Request Withdrawal ───────────────────────────────────────────────────
  async requestWithdrawal(userId: string, data: {
    amount: number;
    currency: string;
    bankAccountId: string;
    paymentMethod: 'bank_transfer' | 'crypto' | 'usdt';
    ipAddress?: string;
  }) {
    const systemSettings = await this._getSettings();
    const minWithdrawal = Number(systemSettings.min_withdrawal ?? 50);
    const maxWithdrawalPerDay = Number(systemSettings.max_withdrawal_per_day ?? 10000);

    if (data.amount < minWithdrawal) {
      throw Object.assign(new Error(`Minimum withdrawal is $${minWithdrawal}`), { statusCode: 400 });
    }

    const wallet = await prisma.walletAccount.findUnique({ where: { userId } });
    if (!wallet) throw Object.assign(new Error('Wallet not found'), { statusCode: 404 });

    const availableBalance = Number(wallet.balance) - Number(wallet.lockedBalance);
    if (data.amount > availableBalance) {
      throw Object.assign(new Error('Insufficient available balance'), { statusCode: 400 });
    }

    // Check daily limit
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const todayWithdrawals = await prisma.transaction.aggregate({
      where: { userId, type: 'withdrawal', status: { in: ['pending', 'completed'] }, createdAt: { gte: todayStart } },
      _sum: { amount: true },
    });
    const todayTotal = Number(todayWithdrawals._sum.amount ?? 0);
    if (todayTotal + data.amount > maxWithdrawalPerDay) {
      throw Object.assign(new Error(`Daily withdrawal limit of $${maxWithdrawalPerDay} exceeded`), { statusCode: 400 });
    }

    // Verify bank account
    const bankAccount = await prisma.bankAccount.findFirst({
      where: { id: data.bankAccountId, userId },
    });
    if (!bankAccount) throw Object.assign(new Error('Bank account not found'), { statusCode: 404 });

    const fee = this._calculateWithdrawalFee(data.paymentMethod, data.amount);
    const netAmount = data.amount - fee;

    const tx = await prisma.$transaction(async (db) => {
      const t = await db.transaction.create({
        data: {
          userId,
          walletId: wallet.id,
          type: 'withdrawal',
          direction: 'debit',
          amount: data.amount,
          currency: data.currency,
          status: 'pending',
          paymentMethod: data.paymentMethod,
          fee,
          netAmount,
          balanceBefore: Number(wallet.balance),
          balanceAfter: Number(wallet.balance) - data.amount,
          ipAddress: data.ipAddress,
        },
      });
      await db.walletAccount.update({
        where: { id: wallet.id },
        data: { lockedBalance: { increment: data.amount } },
      });
      return t;
    });

    // AML screen
    await amlService.screenTransaction(userId, tx.id, data.amount, 'withdrawal');

    // Check auto-approval
    const autoThreshold = Number(systemSettings.withdrawal_auto_approval_threshold ?? 500);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (data.amount <= autoThreshold && user?.kycStatus === 'approved') {
      await this._processWithdrawalApproval(tx.id, 'system');
    }

    return { transactionId: tx.id, status: 'pending', message: 'Withdrawal request submitted. Pending review.' };
  },

  async _processWithdrawalApproval(transactionId: string, approvedById: string) {
    const tx = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { user: { select: { id: true, email: true, firstName: true } }, wallet: true },
    });
    if (!tx || tx.status !== 'pending') return;

    await prisma.$transaction(async (db) => {
      await db.transaction.update({
        where: { id: transactionId },
        data: { status: 'completed', processedById: approvedById, processedAt: new Date() },
      });
      await db.walletAccount.update({
        where: { id: tx.walletId },
        data: {
          balance: { decrement: Number(tx.amount) },
          lockedBalance: { decrement: Number(tx.amount) },
          totalWithdrawn: { increment: Number(tx.netAmount) },
        },
      });
    });

    await notificationService.create({
      userId: tx.userId, type: 'withdrawal_approved',
      title: 'Withdrawal Approved',
      body: `Your withdrawal of ${tx.currency} ${Number(tx.amount).toLocaleString()} has been approved.`,
    });
    await emailService.sendWithdrawalApproved(tx.user.email, tx.user.firstName, Number(tx.amount), tx.currency);
  },

  async getTransactions(userId: string, page = 1, limit = 20, type?: string) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { userId };
    if (type) where.type = type;
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.transaction.count({ where }),
    ]);
    return { transactions, total };
  },

  async addBankAccount(userId: string, walletId: string, data: {
    accountName: string; bankName: string; accountNumber: string;
    country: string; currency: string; routingNumber?: string;
    sortCode?: string; iban?: string; swiftBic?: string;
  }) {
    return prisma.bankAccount.create({
      data: { ...data, userId, walletId },
    });
  },

  async deleteBankAccount(id: string, userId: string) {
    const account = await prisma.bankAccount.findFirst({ where: { id, userId } });
    if (!account) throw Object.assign(new Error('Bank account not found'), { statusCode: 404 });
    return prisma.bankAccount.delete({ where: { id } });
  },

  _calculateDepositFee(method: string, amount: number): number {
    if (method === 'card') return 0;
    if (method === 'crypto') return 0;
    if (method === 'flutterwave') return amount * 0.015;
    if (method === 'paystack') return Math.min(amount * 0.015, 2000 / 100);
    return 0;
  },

  _calculateWithdrawalFee(method: string, amount: number): number {
    if (method === 'bank_transfer') return Math.max(25, amount * 0.01);
    if (method === 'crypto') return amount * 0.005;
    if (method === 'usdt') return 5;
    return 0;
  },

  async _getSettings(): Promise<Record<string, string>> {
    const settings = await prisma.systemSetting.findMany();
    return Object.fromEntries(settings.map(s => [s.key, s.value]));
  },

  async _handleFirstDeposit(userId: string, amount: number) {
    const depositCount = await prisma.transaction.count({
      where: { userId, type: 'deposit', status: 'completed' },
    });
    if (depositCount === 1) {
      const referral = await prisma.referral.findUnique({ where: { referredId: userId } });
      if (referral && referral.status === 'pending') {
        const commission = amount * 0.05; // 5% of first deposit
        await prisma.$transaction(async (db) => {
          await db.referral.update({
            where: { id: referral.id },
            data: { status: 'qualified', commissionEarned: commission, firstDepositDate: new Date() },
          });
          const referrerWallet = await db.walletAccount.findUnique({ where: { userId: referral.referrerId } });
          if (referrerWallet) {
            await db.walletAccount.update({
              where: { userId: referral.referrerId },
              data: { balance: { increment: commission } },
            });
          }
        });
      }
    }
  },
};
