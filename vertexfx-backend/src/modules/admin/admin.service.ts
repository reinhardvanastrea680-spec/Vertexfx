import { prisma } from '../../config/database';
import { hashPassword, generateReferralCode } from '../../utils/crypto';
import { createAuditLog } from '../../utils/auditLog';
import { notificationService } from '../notifications/notification.service';
import { emailService } from '../notifications/email.service';
import { walletService } from '../wallet/wallet.service';

export const adminService = {
  // ─── Dashboard KPIs ───────────────────────────────────────────────────────
  async getDashboardStats() {
    const now = new Date();
    const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
    const yesterday = new Date(todayStart); yesterday.setDate(yesterday.getDate() - 1);

    const [
      totalActiveUsers, totalActiveUsersYesterday,
      openPositionsCount,
      pendingKyc,
      pendingWithdrawals,
      openAmlAlerts,
      todayDeposits, todayWithdrawals,
      totalAum,
    ] = await Promise.all([
      prisma.user.count({ where: { status: 'active', role: 'trader' } }),
      prisma.user.count({ where: { status: 'active', role: 'trader', createdAt: { lt: todayStart } } }),
      prisma.position.count(),
      prisma.kycDocument.count({ where: { status: 'pending' } }),
      prisma.transaction.count({ where: { type: 'withdrawal', status: 'pending' } }),
      prisma.amlAlert.count({ where: { status: 'open' } }),
      prisma.transaction.aggregate({ where: { type: 'deposit', status: 'completed', createdAt: { gte: todayStart } }, _sum: { amount: true }, _count: { id: true } }),
      prisma.transaction.aggregate({ where: { type: 'withdrawal', status: 'completed', createdAt: { gte: todayStart } }, _sum: { amount: true }, _count: { id: true } }),
      prisma.tradingAccount.aggregate({ where: { accountType: 'live', status: 'active' }, _sum: { balance: true } }),
    ]);

    return {
      totalActiveUsers,
      totalAum: Number(totalAum._sum.balance ?? 0),
      todayDeposits: { total: Number(todayDeposits._sum.amount ?? 0), count: todayDeposits._count.id },
      todayWithdrawals: { total: Number(todayWithdrawals._sum.amount ?? 0), count: todayWithdrawals._count.id },
      openPositions: openPositionsCount,
      pendingKyc,
      pendingWithdrawals,
      openAmlAlerts,
      deltaUsers: totalActiveUsers - totalActiveUsersYesterday,
    };
  },

  // ─── Transactions (All) ────────────────────────────────────────────────────
  async getTransactions(type?: string, status?: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (type && type !== 'all') where.type = type;
    if (status && status !== 'all') where.status = status;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      }),
      prisma.transaction.count({ where }),
    ]);
    return { transactions, total };
  },

  // ─── Trading Accounts (All) ───────────────────────────────────────────────
  async getTradingAccounts(page = 1, limit = 100) {
    const skip = (page - 1) * limit;
    const [accounts, total] = await Promise.all([
      prisma.tradingAccount.findMany({
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      }),
      prisma.tradingAccount.count(),
    ]);
    return { accounts, total };
  },

  // ─── Users ────────────────────────────────────────────────────────────────
  async getUsers(params: { page: number; limit: number; search?: string; status?: string; kyc?: string; country?: string }) {
    const { page, limit, search, status, kyc, country } = params;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { role: 'trader', deletedAt: null };
    if (status && status !== 'all') where.status = status;
    if (kyc && kyc !== 'all') where.kycStatus = kyc;
    if (country) where.country = country;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          wallet: { select: { balance: true } },
          tradingAccounts: { where: { accountType: 'live' }, select: { accountNumber: true }, take: 1 },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, totalPages: Math.ceil(total / limit) };
  },

  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        wallet: { include: { bankAccounts: true } },
        tradingAccounts: { include: { _count: { select: { positions: true } } } },
        kycDocuments: { orderBy: { createdAt: 'desc' } },
        sessions: { where: { isRevoked: false, expiresAt: { gt: new Date() } }, orderBy: { lastUsedAt: 'desc' }, take: 10 },
      },
    });
  },

  async updateUserStatus(targetUserId: string, status: string, actorId: string, ipAddress?: string) {
    const oldUser = await prisma.user.findUnique({ where: { id: targetUserId }, select: { status: true } });

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: { status: status as never },
    });

    await createAuditLog({
      actorId, targetUserId,
      action: `account.${status}`,
      entityType: 'user', entityId: targetUserId,
      oldValue: { status: oldUser?.status },
      newValue: { status },
      ipAddress,
      severity: status === 'banned' ? 'critical' : 'warning',
    });

    if (status === 'suspended') {
      await notificationService.create({
        userId: targetUserId, type: 'account_suspended',
        title: 'Account Suspended',
        body: 'Your account has been suspended. Please contact support.',
      });
    }

    return updated;
  },

  async getUserTrades(userId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [trades, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip, take: limit,
        include: { account: { select: { accountNumber: true } } },
      }),
      prisma.order.count({ where: { userId } }),
    ]);
    return { trades, total };
  },

  async getUserTransactions(userId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.transaction.count({ where: { userId } }),
    ]);
    return { transactions, total };
  },

  // ─── KYC ─────────────────────────────────────────────────────────────────
  async getKycQueue(status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (status && status !== 'all') where.status = status;

    const [docs, total] = await Promise.all([
      prisma.kycDocument.findMany({
        where,
        skip, take: limit,
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, country: true } } },
      }),
      prisma.kycDocument.count({ where }),
    ]);
    return { docs, total };
  },

  async approveKyc(docId: string, reviewerId: string, ipAddress?: string) {
    const doc = await prisma.kycDocument.findUnique({ where: { id: docId }, include: { user: true } });
    if (!doc) throw Object.assign(new Error('KYC document not found'), { statusCode: 404 });

    await prisma.$transaction(async (tx) => {
      await tx.kycDocument.update({
        where: { id: docId },
        data: { status: 'approved', reviewedById: reviewerId, reviewedAt: new Date() },
      });
      await tx.user.update({
        where: { id: doc.userId },
        data: { kycStatus: 'approved' },
      });
    });

    await createAuditLog({
      actorId: reviewerId, targetUserId: doc.userId,
      action: 'kyc.document.approve',
      entityType: 'kyc_document', entityId: docId,
      oldValue: { status: 'pending' }, newValue: { status: 'approved' },
      ipAddress, severity: 'info',
    });

    await notificationService.create({
      userId: doc.userId, type: 'kyc_approved',
      title: 'KYC Approved', body: 'Your identity verification has been approved.',
    });
    await emailService.sendKycApproved(doc.user.email, doc.user.firstName);

    return { message: 'KYC approved' };
  },

  async rejectKyc(docId: string, reviewerId: string, reason: string, ipAddress?: string) {
    const doc = await prisma.kycDocument.findUnique({ where: { id: docId }, include: { user: true } });
    if (!doc) throw Object.assign(new Error('KYC document not found'), { statusCode: 404 });

    await prisma.$transaction(async (tx) => {
      await tx.kycDocument.update({
        where: { id: docId },
        data: { status: 'rejected', rejectionReason: reason, reviewedById: reviewerId, reviewedAt: new Date() },
      });
      await tx.user.update({
        where: { id: doc.userId },
        data: { kycStatus: 'rejected' },
      });
    });

    await createAuditLog({
      actorId: reviewerId, targetUserId: doc.userId,
      action: 'kyc.document.reject',
      entityType: 'kyc_document', entityId: docId,
      oldValue: { status: 'pending' }, newValue: { status: 'rejected', reason },
      ipAddress, severity: 'warning',
    });

    await notificationService.create({
      userId: doc.userId, type: 'kyc_rejected',
      title: 'KYC Review Required', body: `Your documents need attention: ${reason}`,
    });
    await emailService.sendKycRejected(doc.user.email, doc.user.firstName, reason);

    return { message: 'KYC rejected' };
  },

  // ─── Withdrawals ─────────────────────────────────────────────────────────
  async getWithdrawalQueue(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [withdrawals, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { type: 'withdrawal', status: 'pending' },
        skip, take: limit,
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, kycStatus: true } } },
      }),
      prisma.transaction.count({ where: { type: 'withdrawal', status: 'pending' } }),
    ]);
    return { withdrawals, total };
  },

  async approveWithdrawal(txId: string, adminId: string, ipAddress?: string) {
    const tx = await prisma.transaction.findUnique({
      where: { id: txId },
      include: { user: { select: { email: true, firstName: true } }, wallet: true },
    });
    if (!tx || tx.type !== 'withdrawal' || tx.status !== 'pending') {
      throw Object.assign(new Error('Withdrawal not found or not pending'), { statusCode: 404 });
    }

    await prisma.$transaction(async (db) => {
      await db.transaction.update({
        where: { id: txId },
        data: { status: 'completed', processedById: adminId, processedAt: new Date() },
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

    await createAuditLog({
      actorId: adminId, targetUserId: tx.userId,
      action: 'withdrawal.approve', entityType: 'transaction', entityId: txId,
      oldValue: { status: 'pending' }, newValue: { status: 'completed' },
      ipAddress, severity: 'warning',
    });

    await notificationService.create({ userId: tx.userId, type: 'withdrawal_approved', title: 'Withdrawal Approved', body: `Your withdrawal of ${tx.currency} ${Number(tx.amount).toLocaleString()} has been approved.` });
    await emailService.sendWithdrawalApproved(tx.user.email, tx.user.firstName, Number(tx.amount), tx.currency);

    return { message: 'Withdrawal approved' };
  },

  async rejectWithdrawal(txId: string, adminId: string, reason: string, ipAddress?: string) {
    const tx = await prisma.transaction.findUnique({
      where: { id: txId },
      include: { user: { select: { email: true, firstName: true } }, wallet: true },
    });
    if (!tx || tx.type !== 'withdrawal' || tx.status !== 'pending') {
      throw Object.assign(new Error('Withdrawal not found or not pending'), { statusCode: 404 });
    }

    await prisma.$transaction(async (db) => {
      await db.transaction.update({
        where: { id: txId },
        data: { status: 'cancelled', description: `Rejected: ${reason}`, processedById: adminId, processedAt: new Date() },
      });
      await db.walletAccount.update({
        where: { id: tx.walletId },
        data: { lockedBalance: { decrement: Number(tx.amount) } },
      });
    });

    await createAuditLog({
      actorId: adminId, targetUserId: tx.userId,
      action: 'withdrawal.reject', entityType: 'transaction', entityId: txId,
      oldValue: { status: 'pending' }, newValue: { status: 'cancelled', reason },
      ipAddress, severity: 'warning',
    });

    await notificationService.create({ userId: tx.userId, type: 'withdrawal_rejected', title: 'Withdrawal Declined', body: `Your withdrawal was declined: ${reason}` });
    await emailService.sendWithdrawalRejected(tx.user.email, tx.user.firstName, Number(tx.amount), reason);

    return { message: 'Withdrawal rejected' };
  },

  // ─── Transactions (Admin view) ──────────────────────────────────────────────
  async getAllTransactions(page = 1, limit = 100, type?: string) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (type) where.type = type;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      }),
      prisma.transaction.count({ where }),
    ]);
    return { transactions, total };
  },

  // ─── Trading Accounts (Admin view) ──────────────────────────────────────────
  async getAllTradingAccounts(page = 1, limit = 100) {
    const skip = (page - 1) * limit;
    const [accounts, total] = await Promise.all([
      prisma.tradingAccount.findMany({
        where: { accountType: 'live' },
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      }),
      prisma.tradingAccount.count({ where: { accountType: 'live' } }),
    ]);
    return { accounts, total };
  },

  // ─── Positions (Admin view) ───────────────────────────────────────────────
  async getAllOpenPositions(page = 1, limit = 100) {
    const skip = (page - 1) * limit;
    const [positions, total] = await Promise.all([
      prisma.position.findMany({
        skip, take: limit,
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          account: { select: { accountNumber: true } },
          order: { select: { ticketNumber: true } },
        },
        orderBy: { floatingPnl: 'asc' },
      }),
      prisma.position.count(),
    ]);
    return { positions, total };
  },

  async forceClosePosition(positionId: string, adminId: string, reason: string, notes: string, ipAddress?: string) {
    const position = await prisma.position.findUnique({
      where: { id: positionId },
      include: { order: true, account: true, user: { select: { email: true, firstName: true } } },
    });
    if (!position) throw Object.assign(new Error('Position not found'), { statusCode: 404 });

    await createAuditLog({
      actorId: adminId, targetUserId: position.userId,
      action: 'trade.force_close',
      entityType: 'position', entityId: positionId,
      newValue: { reason, notes, symbol: position.symbol, volume: position.volume },
      ipAddress, severity: 'critical',
    });

    // Import and use trading service to close
    const { tradingService } = await import('../trading/trading.service');
    return tradingService.closePosition(positionId, position.userId);
  },

  // ─── Instruments ─────────────────────────────────────────────────────────
  async getInstruments(page = 1, limit = 50, category?: string) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (category && category !== 'all') where.category = category;

    const [instruments, total] = await Promise.all([
      prisma.instrument.findMany({ where, skip, take: limit, orderBy: { symbol: 'asc' } }),
      prisma.instrument.count({ where }),
    ]);
    return { instruments, total };
  },

  async createInstrument(data: Record<string, unknown>, adminId: string) {
    const instrument = await prisma.instrument.create({ data: data as never });
    await createAuditLog({ actorId: adminId, action: 'instrument.create', entityType: 'instrument', entityId: instrument.id, newValue: data, severity: 'info' });
    return instrument;
  },

  async updateInstrument(id: string, data: Record<string, unknown>, adminId: string) {
    const old = await prisma.instrument.findUnique({ where: { id } });
    const updated = await prisma.instrument.update({ where: { id }, data: data as never });
    await createAuditLog({ actorId: adminId, action: 'instrument.update', entityType: 'instrument', entityId: id, oldValue: old as object, newValue: data, severity: 'info' });
    return updated;
  },

  // ─── AML Alerts ───────────────────────────────────────────────────────────
  async getAmlAlerts(status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (status && status !== 'all') where.status = status;

    const [alerts, total] = await Promise.all([
      prisma.amlAlert.findMany({
        where,
        skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true, kycStatus: true } } } as any,
      }),
      prisma.amlAlert.count({ where }),
    ]);
    return { alerts, total };
  },

  async resolveAmlAlert(alertId: string, action: 'clear' | 'escalate' | 'freeze', adminId: string, resolution: string, ipAddress?: string) {
    const alert = await prisma.amlAlert.findUnique({ where: { id: alertId } });
    if (!alert) throw Object.assign(new Error('Alert not found'), { statusCode: 404 });

    const newStatus = action === 'clear' ? 'cleared' : action === 'escalate' ? 'escalated' : 'sar_filed';

    await prisma.amlAlert.update({
      where: { id: alertId },
      data: { status: newStatus, resolvedById: adminId, resolvedAt: new Date(), resolution },
    });

    if (action === 'freeze') {
      await prisma.user.update({ where: { id: alert.userId }, data: { status: 'suspended' } });
    }

    await createAuditLog({
      actorId: adminId, targetUserId: alert.userId,
      action: `aml.alert.${action}`, entityType: 'aml_alert', entityId: alertId,
      oldValue: { status: alert.status }, newValue: { status: newStatus, resolution },
      ipAddress, severity: action === 'freeze' ? 'critical' : 'warning',
    });

    return { message: `Alert ${action}d successfully` };
  },

  // ─── Reports ──────────────────────────────────────────────────────────────
  async getFinancialReport(from: Date, to: Date) {
    const [deposits, withdrawals, commissions] = await Promise.all([
      prisma.transaction.aggregate({
        where: { type: 'deposit', status: 'completed', createdAt: { gte: from, lte: to } },
        _sum: { amount: true, fee: true }, _count: { id: true },
      }),
      prisma.transaction.aggregate({
        where: { type: 'withdrawal', status: 'completed', createdAt: { gte: from, lte: to } },
        _sum: { amount: true, fee: true }, _count: { id: true },
      }),
      prisma.order.aggregate({
        where: { status: 'closed', createdAt: { gte: from, lte: to } },
        _sum: { commission: true, profitLoss: true },
      }),
    ]);

    return {
      deposits: { total: Number(deposits._sum.amount ?? 0), fees: Number(deposits._sum.fee ?? 0), count: deposits._count.id },
      withdrawals: { total: Number(withdrawals._sum.amount ?? 0), fees: Number(withdrawals._sum.fee ?? 0), count: withdrawals._count.id },
      netCashFlow: Number(deposits._sum.amount ?? 0) - Number(withdrawals._sum.amount ?? 0),
      tradingRevenue: { commission: Number(commissions._sum.commission ?? 0), clientPnl: Number(commissions._sum.profitLoss ?? 0) },
    };
  },

  async getTradingReport(from: Date, to: Date) {
    const [volumeBySymbol, totalStats] = await Promise.all([
      prisma.order.groupBy({
        by: ['symbol'],
        where: { status: 'closed', createdAt: { gte: from, lte: to } },
        _sum: { volume: true, commission: true, profitLoss: true },
        _count: { id: true },
        orderBy: { _sum: { volume: 'desc' } },
        take: 20,
      }),
      prisma.order.aggregate({
        where: { status: 'closed', createdAt: { gte: from, lte: to } },
        _sum: { volume: true, commission: true, profitLoss: true },
        _count: { id: true },
      }),
    ]);
    return { volumeBySymbol, totalStats };
  },

  async getClientReport(from: Date, to: Date) {
    const [newUsers, kycApproved, firstDeposits] = await Promise.all([
      prisma.user.count({ where: { role: 'trader', createdAt: { gte: from, lte: to } } }),
      prisma.user.count({ where: { kycStatus: 'approved', updatedAt: { gte: from, lte: to } } }),
      prisma.transaction.count({ where: { type: 'deposit', status: 'completed', createdAt: { gte: from, lte: to } } }),
    ]);
    return { newUsers, kycApproved, firstDeposits };
  },

  // ─── Audit Logs ───────────────────────────────────────────────────────────
  async getAuditLogs(params: { page: number; limit: number; actorId?: string; targetUserId?: string; severity?: string; from?: Date; to?: Date }) {
    const { page, limit, actorId, targetUserId, severity, from, to } = params;
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (actorId) where.actorId = actorId;
    if (targetUserId) where.targetUserId = targetUserId;
    if (severity && severity !== 'all') where.severity = severity;
    if (from || to) where.createdAt = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) };

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where, skip, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { actor: { select: { firstName: true, lastName: true, role: true } } },
      }),
      prisma.auditLog.count({ where }),
    ]);
    return { logs, total };
  },

  // ─── System Settings ──────────────────────────────────────────────────────
  async getSettings() {
    const settings = await prisma.systemSetting.findMany({ orderBy: { key: 'asc' } });
    return Object.fromEntries(settings.map(s => [s.key, s.value]));
  },

  async updateSetting(key: string, value: string, adminId: string) {
    const old = await prisma.systemSetting.findUnique({ where: { key } });
    const updated = await prisma.systemSetting.upsert({
      where: { key },
      update: { value, updatedById: adminId },
      create: { key, value, updatedById: adminId },
    });
    await createAuditLog({
      actorId: adminId, action: 'settings.update',
      entityType: 'system_setting', entityId: key,
      oldValue: { value: old?.value }, newValue: { value },
      severity: 'warning',
    });
    return updated;
  },

  // ─── Staff Management ─────────────────────────────────────────────────────
  async createStaffAccount(data: { email: string; firstName: string; lastName: string; role: string; tempPassword: string }, adminId: string) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw Object.assign(new Error('Email already exists'), { statusCode: 409 });

    const passwordHash = await hashPassword(data.tempPassword);
    const referralCode = generateReferralCode();

    const staff = await prisma.user.create({
      data: {
        email: data.email, firstName: data.firstName, lastName: data.lastName,
        passwordHash, role: data.role as never,
        status: 'active', emailVerified: true,
        referralCode,
      },
    });

    await createAuditLog({
      actorId: adminId, action: 'staff.create',
      entityType: 'user', entityId: staff.id,
      newValue: { email: data.email, role: data.role },
      severity: 'warning',
    });

    return staff;
  },

  async getStaffMembers(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { role: { not: 'trader' as never } };
    const [staff, total] = await Promise.all([
      prisma.user.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);
    return { staff, total };
  },

  // ─── Balance Adjustment ───────────────────────────────────────────────────
  async adjustBalance(userId: string, amount: number, direction: 'credit' | 'debit', reason: string, adminId: string, ipAddress?: string) {
    const wallet = await prisma.walletAccount.findUnique({ where: { userId } });
    if (!wallet) throw Object.assign(new Error('Wallet not found'), { statusCode: 404 });

    const balanceBefore = Number(wallet.balance);
    const netAmount = direction === 'credit' ? amount : -amount;
    const balanceAfter = balanceBefore + netAmount;

    if (balanceAfter < 0) throw Object.assign(new Error('Adjustment would result in negative balance'), { statusCode: 400 });

    await prisma.$transaction(async (tx) => {
      await tx.walletAccount.update({
        where: { userId },
        data: { balance: { increment: netAmount } },
      });
      await tx.transaction.create({
        data: {
          userId, walletId: wallet.id,
          type: 'adjustment', direction,
          amount, currency: wallet.currency,
          status: 'completed', paymentMethod: 'internal',
          fee: 0, netAmount: amount,
          balanceBefore, balanceAfter,
          description: reason,
          processedById: adminId, processedAt: new Date(),
        },
      });
    });

    await createAuditLog({
      actorId: adminId, targetUserId: userId,
      action: 'balance.adjust', entityType: 'wallet', entityId: wallet.id,
      oldValue: { balance: balanceBefore }, newValue: { balance: balanceAfter, reason },
      ipAddress, severity: 'critical',
    });

    return { balanceBefore, balanceAfter, adjustment: netAmount };
  },
};
