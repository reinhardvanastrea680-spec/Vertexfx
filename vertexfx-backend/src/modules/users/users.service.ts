import { prisma } from '../../config/database';
import { createAuditLog } from '../../utils/auditLog';

export const usersService = {
  async getMe(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, phone: true, firstName: true, lastName: true,
        dateOfBirth: true, country: true, nationality: true, addressLine1: true,
        addressLine2: true, city: true, state: true, postalCode: true,
        referralCode: true, role: true, status: true, emailVerified: true,
        phoneVerified: true, kycStatus: true, twoFaEnabled: true,
        lastLoginAt: true, createdAt: true,
      },
    });
  },

  async updateProfile(userId: string, data: Partial<{
    firstName: string; lastName: string; phone: string; dateOfBirth: Date;
    country: string; nationality: string; addressLine1: string;
    addressLine2: string; city: string; state: string; postalCode: string;
  }>) {
    return prisma.user.update({ where: { id: userId }, data });
  },

  async submitKyc(userId: string, data: {
    documentType: string;
    documentNumber?: string;
    countryOfIssue?: string;
    expiryDate?: Date;
    frontImageUrl: string;
    backImageUrl?: string;
    selfieImageUrl?: string;
  }) {
    // Check user exists and is active
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Object.assign(new Error('User not found'), { statusCode: 404 });

    // Check for pending submission
    const pending = await prisma.kycDocument.findFirst({
      where: { userId, status: 'pending' },
    });
    if (pending) throw Object.assign(new Error('You already have a pending KYC review'), { statusCode: 409 });

    const doc = await prisma.$transaction(async (tx) => {
      const d = await tx.kycDocument.create({
        data: {
          userId,
          documentType: data.documentType as never,
          documentNumber: data.documentNumber,
          countryOfIssue: data.countryOfIssue,
          expiryDate: data.expiryDate,
          frontImageUrl: data.frontImageUrl,
          backImageUrl: data.backImageUrl,
          selfieImageUrl: data.selfieImageUrl,
          status: 'pending',
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { kycStatus: 'pending' },
      });

      return d;
    });

    return doc;
  },

  async getKycDocuments(userId: string) {
    return prisma.kycDocument.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getTradingAccounts(userId: string) {
    return prisma.tradingAccount.findMany({
      where: { userId, status: { not: 'closed' } },
      include: {
        _count: { select: { positions: true } },
      },
    });
  },

  async getNotifications(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total, unread] = await Promise.all([
      prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.notification.count({ where: { userId } }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { items, total, unread };
  },
};
