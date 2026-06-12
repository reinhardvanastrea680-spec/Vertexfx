import speakeasy from "speakeasy";
import qrcode from "qrcode";
import { prisma } from "../../config/database";
import { redis } from "../../config/redis";
import {
  hashPassword,
  comparePassword,
  encrypt,
  decrypt,
  hashToken,
  generateReferralCode,
} from "../../utils/crypto";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  signEmailToken,
  verifyEmailToken,
} from "../../utils/jwt";
import { emailService } from "../notifications/email.service";
import { createAuditLog } from "../../utils/auditLog";
import { RegisterDto, LoginDto, ResetPasswordDto } from "./auth.schemas";

export const authService = {
  // ─── Register ──────────────────────────────────────────────────────────────
  async register(dto: RegisterDto, ipAddress: string) {
    const existing = await prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing)
      throw Object.assign(new Error("Email already registered"), {
        statusCode: 409,
      });

    const passwordHash = await hashPassword(dto.password);
    const referralCode = generateReferralCode();

    // Handle referral
    let referredById: string | undefined;
    if (dto.referralCode) {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: dto.referralCode },
      });
      if (referrer) referredById = referrer.id;
    }

    const user = await prisma.$transaction(async (tx) => {
      const u = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          dateOfBirth: new Date(dto.dateOfBirth),
          nationality: dto.nationality,
          addressLine1: dto.address,
          city: dto.city,
          state: dto.state,
          postalCode: dto.postalCode,
          country: dto.country,
          phone: dto.phone,
          referralCode,
          referredById,
          status: process.env.NODE_ENV === "development" ? "active" : "pending",
          emailVerified: process.env.NODE_ENV === "development",
        },
      });

      // Auto-create wallet
      await tx.walletAccount.create({ data: { userId: u.id } });

      // Create referral record
      if (referredById) {
        await tx.referral.create({
          data: { referrerId: referredById, referredId: u.id },
        });
      }

      return u;
    });

    // Skip email verification in development
    if (process.env.NODE_ENV === "development") {
      return { message: "Registration successful! You can now log in." };
    }

    // Send verification email in production
    const token = signEmailToken(
      { userId: user.id, purpose: "email_verify" },
      "24h",
    );
    await emailService.sendVerificationEmail(user.email, user.firstName, token);

    return {
      message:
        "Registration successful. Please check your email to verify your account.",
    };
  },

  // ─── Verify Email ──────────────────────────────────────────────────────────
  async verifyEmail(token: string) {
    let payload: Record<string, unknown>;
    try {
      payload = verifyEmailToken(token);
    } catch {
      throw Object.assign(new Error("Invalid or expired verification link"), {
        statusCode: 400,
      });
    }

    if (payload.purpose !== "email_verify") {
      throw Object.assign(new Error("Invalid token purpose"), {
        statusCode: 400,
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
    });
    if (!user)
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    if (user.emailVerified) return { message: "Email already verified" };

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, status: "active" },
    });

    await emailService.sendWelcomeEmail(user.email, user.firstName);
    return { message: "Email verified successfully. Welcome to VertexFX!" };
  },

  // ─── Login ─────────────────────────────────────────────────────────────────
  async login(dto: LoginDto, ipAddress: string, userAgent: string) {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user)
      throw Object.assign(new Error("Invalid credentials"), {
        statusCode: 401,
      });

    const passwordMatch = await comparePassword(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatch)
      throw Object.assign(new Error("Invalid credentials"), {
        statusCode: 401,
      });

    // Skip email verification check in development
    if (process.env.NODE_ENV !== "development" && !user.emailVerified) {
      throw Object.assign(
        new Error("Please verify your email address before logging in"),
        { statusCode: 403 },
      );
    }

    if (user.status === "suspended")
      throw Object.assign(new Error("Account suspended. Contact support."), {
        statusCode: 403,
      });
    if (user.status === "banned")
      throw Object.assign(new Error("Account banned"), { statusCode: 403 });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ipAddress },
    });

    // If 2FA enabled — return temp token
    if (user.twoFaEnabled) {
      const tempToken = signEmailToken(
        { userId: user.id, purpose: "2fa_login" },
        "5m",
      );
      await redis.setex(`2fa_temp:${user.id}`, 300, tempToken);
      return { requiresTwoFA: true, tempToken };
    }

    return this._createSession(user, ipAddress, userAgent);
  },

  // ─── Verify 2FA ────────────────────────────────────────────────────────────
  async verifyTwoFA(
    tempToken: string,
    code: string,
    ipAddress: string,
    userAgent: string,
  ) {
    let payload: Record<string, unknown>;
    try {
      payload = verifyEmailToken(tempToken);
    } catch {
      throw Object.assign(new Error("Temp token invalid or expired"), {
        statusCode: 401,
      });
    }

    if (payload.purpose !== "2fa_login")
      throw Object.assign(new Error("Invalid token"), { statusCode: 401 });

    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
    });
    if (!user?.twoFaSecret)
      throw Object.assign(new Error("User not found"), { statusCode: 404 });

    const secret = decrypt(user.twoFaSecret);
    const valid = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: code,
      window: 2,
    });
    if (!valid)
      throw Object.assign(new Error("Invalid 2FA code"), { statusCode: 401 });

    await redis.del(`2fa_temp:${user.id}`);
    return this._createSession(user, ipAddress, userAgent);
  },

  // ─── Create Session (shared) ───────────────────────────────────────────────
  async _createSession(
    user: { id: string; role: string; email: string },
    ipAddress: string,
    userAgent: string,
  ) {
    const accessToken = signAccessToken({
      userId: user.id,
      role: user.role,
      email: user.email,
    });
    const refreshToken = signRefreshToken({ userId: user.id, sessionId: "" });

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash: hashToken(refreshToken),
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Embed session ID
    const finalRefreshToken = signRefreshToken({
      userId: user.id,
      sessionId: session.id,
    });
    await prisma.session.update({
      where: { id: session.id },
      data: { refreshTokenHash: hashToken(finalRefreshToken) },
    });

    return {
      accessToken,
      refreshToken: finalRefreshToken,
      user: { id: user.id, role: user.role, email: user.email },
    };
  },

  // ─── Refresh Token ─────────────────────────────────────────────────────────
  async refresh(refreshToken: string) {
    let payload: { userId: string; sessionId: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw Object.assign(new Error("Invalid refresh token"), {
        statusCode: 401,
      });
    }

    const session = await prisma.session.findFirst({
      where: {
        id: payload.sessionId,
        userId: payload.userId,
        refreshTokenHash: hashToken(refreshToken),
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: { select: { id: true, role: true, email: true, status: true } },
      },
    });

    if (!session)
      throw Object.assign(new Error("Session invalid or expired"), {
        statusCode: 401,
      });
    if (session.user.status !== "active")
      throw Object.assign(new Error("Account inactive"), { statusCode: 401 });

    const newRefreshToken = signRefreshToken({
      userId: payload.userId,
      sessionId: session.id,
    });
    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: hashToken(newRefreshToken),
        lastUsedAt: new Date(),
      },
    });

    const accessToken = signAccessToken({
      userId: session.user.id,
      role: session.user.role,
      email: session.user.email,
    });
    return { accessToken, refreshToken: newRefreshToken };
  },

  // ─── Logout ────────────────────────────────────────────────────────────────
  async logout(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      await prisma.session.updateMany({
        where: { id: payload.sessionId, userId: payload.userId },
        data: { isRevoked: true },
      });
    } catch {
      // Ignore — logout should always succeed
    }
    return { message: "Logged out successfully" };
  },

  // ─── Forgot Password ───────────────────────────────────────────────────────
  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always return same response (don't reveal if email exists)
    if (!user)
      return { message: "If that email exists, a reset link has been sent." };

    const token = signEmailToken(
      { userId: user.id, purpose: "password_reset" },
      "1h",
    );
    await emailService.sendPasswordResetEmail(
      user.email,
      user.firstName,
      token,
    );

    return { message: "If that email exists, a reset link has been sent." };
  },

  // ─── Reset Password ────────────────────────────────────────────────────────
  async resetPassword(dto: ResetPasswordDto) {
    let payload: Record<string, unknown>;
    try {
      payload = verifyEmailToken(dto.token);
    } catch {
      throw Object.assign(new Error("Invalid or expired reset link"), {
        statusCode: 400,
      });
    }

    if (payload.purpose !== "password_reset")
      throw Object.assign(new Error("Invalid token"), { statusCode: 400 });

    const passwordHash = await hashPassword(dto.newPassword);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: payload.userId as string },
        data: { passwordHash },
      });
      // Revoke all sessions
      await tx.session.updateMany({
        where: { userId: payload.userId as string },
        data: { isRevoked: true },
      });
    });

    return {
      message:
        "Password reset successfully. Please log in with your new password.",
    };
  },

  // ─── Setup 2FA ─────────────────────────────────────────────────────────────
  async setup2FA(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      throw Object.assign(new Error("User not found"), { statusCode: 404 });
    if (user.twoFaEnabled)
      throw Object.assign(new Error("2FA already enabled"), {
        statusCode: 409,
      });

    const secret = speakeasy.generateSecret({
      name: `VertexFX (${user.email})`,
      length: 32,
    });
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

    // Store temp secret in Redis until confirmed
    await redis.setex(`2fa_setup:${userId}`, 600, secret.base32);

    return { qrCode: qrCodeUrl, secret: secret.base32 };
  },

  // ─── Confirm 2FA ──────────────────────────────────────────────────────────
  async confirm2FA(userId: string, code: string) {
    const tempSecret = await redis.get(`2fa_setup:${userId}`);
    if (!tempSecret)
      throw Object.assign(
        new Error("2FA setup session expired. Start again."),
        { statusCode: 400 },
      );

    const valid = speakeasy.totp.verify({
      secret: tempSecret,
      encoding: "base32",
      token: code,
      window: 2,
    });
    if (!valid)
      throw Object.assign(new Error("Invalid verification code"), {
        statusCode: 400,
      });

    const encryptedSecret = encrypt(tempSecret);
    await prisma.user.update({
      where: { id: userId },
      data: { twoFaEnabled: true, twoFaSecret: encryptedSecret },
    });
    await redis.del(`2fa_setup:${userId}`);

    return { message: "2FA enabled successfully" };
  },

  // ─── Disable 2FA ──────────────────────────────────────────────────────────
  async disable2FA(userId: string, code: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.twoFaSecret)
      throw Object.assign(new Error("2FA not enabled"), { statusCode: 400 });

    const secret = decrypt(user.twoFaSecret);
    const valid = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: code,
      window: 2,
    });
    if (!valid)
      throw Object.assign(new Error("Invalid verification code"), {
        statusCode: 401,
      });

    await prisma.user.update({
      where: { id: userId },
      data: { twoFaEnabled: false, twoFaSecret: null },
    });
    return { message: "2FA disabled successfully" };
  },
};
