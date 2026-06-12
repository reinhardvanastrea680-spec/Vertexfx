import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';

// Use SendGrid SMTP or fallback to Ethereal (dev)
function createTransport() {
  if (env.SENDGRID_API_KEY && env.SENDGRID_API_KEY.startsWith('SG.')) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 465,
      secure: true,
      auth: { user: 'apikey', pass: env.SENDGRID_API_KEY },
    });
  }
  // Dev fallback — logs to console
  return nodemailer.createTransport({ jsonTransport: true });
}

const transporter = createTransport();

async function send(to: string, subject: string, html: string): Promise<void> {
  try {
    const info = await transporter.sendMail({
      from: `"${env.SENDGRID_FROM_NAME}" <${env.SENDGRID_FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    if (env.isDev) logger.info(`Email (dev): ${subject} → ${to}`, info);
  } catch (error) {
    logger.error('Email send failed:', error);
  }
}

function baseTemplate(title: string, body: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>${title}</title>
<style>
  body{font-family:'Helvetica Neue',Arial,sans-serif;background:#0B0F1A;color:#E8EDF5;margin:0;padding:0}
  .wrapper{max-width:560px;margin:40px auto;background:#111827;border-radius:12px;overflow:hidden;border:1px solid #1F2D45}
  .header{background:linear-gradient(135deg,#D4A843,#A07728);padding:28px 32px;text-align:center}
  .header h1{margin:0;color:#000;font-size:22px;font-weight:700;letter-spacing:1px}
  .body{padding:32px}
  .body p{line-height:1.7;color:#8B97B5;font-size:14px}
  .btn{display:inline-block;background:linear-gradient(135deg,#D4A843,#A07728);color:#000;padding:13px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;margin:16px 0}
  .footer{padding:20px 32px;border-top:1px solid #1F2D45;font-size:12px;color:#4E5E7A;text-align:center}
</style></head>
<body>
<div class="wrapper">
  <div class="header"><h1>VERTEX<span style="color:#000">FX</span></h1></div>
  <div class="body">${body}</div>
  <div class="footer">© ${new Date().getFullYear()} VertexFX. All rights reserved.<br>This email was sent to you because you have an account with VertexFX.</div>
</div>
</body>
</html>`;
}

export const emailService = {
  async sendVerificationEmail(to: string, firstName: string, token: string) {
    const link = `${env.FRONTEND_URL}/verify-email/${token}`;
    const html = baseTemplate('Verify Your Email', `
      <p>Hi ${firstName},</p>
      <p>Welcome to VertexFX! Please verify your email address to activate your account.</p>
      <a href="${link}" class="btn">Verify Email Address</a>
      <p>This link expires in 24 hours. If you didn't register, you can safely ignore this email.</p>
    `);
    await send(to, 'Verify your VertexFX account', html);
  },

  async sendWelcomeEmail(to: string, firstName: string) {
    const html = baseTemplate('Welcome to VertexFX', `
      <p>Hi ${firstName},</p>
      <p>Your account is now active. You can now log in and start trading on VertexFX.</p>
      <a href="${env.FRONTEND_URL}/login" class="btn">Log In to VertexFX</a>
    `);
    await send(to, 'Welcome to VertexFX!', html);
  },

  async sendPasswordResetEmail(to: string, firstName: string, token: string) {
    const link = `${env.FRONTEND_URL}/reset-password/${token}`;
    const html = baseTemplate('Reset Your Password', `
      <p>Hi ${firstName},</p>
      <p>You requested a password reset. Click the button below to create a new password. This link expires in 1 hour.</p>
      <a href="${link}" class="btn">Reset Password</a>
      <p>If you didn't request this, please ignore this email. Your password won't change.</p>
    `);
    await send(to, 'Reset your VertexFX password', html);
  },

  async sendDepositConfirmation(to: string, firstName: string, amount: number, currency: string) {
    const html = baseTemplate('Deposit Confirmed', `
      <p>Hi ${firstName},</p>
      <p>Your deposit has been successfully processed.</p>
      <p style="font-size:28px;font-weight:700;color:#22C55E;font-family:monospace">${currency} ${amount.toLocaleString()}</p>
      <p>The funds are now available in your wallet.</p>
      <a href="${env.FRONTEND_URL}/wallet" class="btn">View Wallet</a>
    `);
    await send(to, `Deposit of ${currency} ${amount.toLocaleString()} confirmed`, html);
  },

  async sendWithdrawalApproved(to: string, firstName: string, amount: number, currency: string) {
    const html = baseTemplate('Withdrawal Approved', `
      <p>Hi ${firstName},</p>
      <p>Your withdrawal request has been approved and is being processed.</p>
      <p style="font-size:28px;font-weight:700;color:#D4A843;font-family:monospace">${currency} ${amount.toLocaleString()}</p>
      <p>Funds will arrive in your bank account within 1–3 business days.</p>
    `);
    await send(to, `Withdrawal of ${currency} ${amount.toLocaleString()} approved`, html);
  },

  async sendWithdrawalRejected(to: string, firstName: string, amount: number, reason: string) {
    const html = baseTemplate('Withdrawal Request Declined', `
      <p>Hi ${firstName},</p>
      <p>Unfortunately your withdrawal request for <strong>$${amount.toLocaleString()}</strong> was declined.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>The funds have been returned to your VertexFX wallet. If you believe this is an error, please contact support.</p>
      <a href="${env.FRONTEND_URL}/support" class="btn">Contact Support</a>
    `);
    await send(to, 'Your withdrawal request was declined', html);
  },

  async sendKycApproved(to: string, firstName: string) {
    const html = baseTemplate('KYC Verification Approved', `
      <p>Hi ${firstName},</p>
      <p>Great news — your identity verification (KYC) has been approved!</p>
      <p>You now have full access to all VertexFX features including higher deposit and withdrawal limits.</p>
      <a href="${env.FRONTEND_URL}/dashboard" class="btn">Go to Dashboard</a>
    `);
    await send(to, 'KYC verification approved', html);
  },

  async sendKycRejected(to: string, firstName: string, reason: string) {
    const html = baseTemplate('KYC Verification Requires Attention', `
      <p>Hi ${firstName},</p>
      <p>Your identity verification documents could not be approved for the following reason:</p>
      <p style="background:#1A2235;padding:12px 16px;border-radius:8px;color:#F59E0B">${reason}</p>
      <p>Please resubmit your documents with the issue corrected.</p>
      <a href="${env.FRONTEND_URL}/kyc" class="btn">Resubmit Documents</a>
    `);
    await send(to, 'Action required: KYC verification', html);
  },

  async sendMarginCallWarning(to: string, firstName: string, accountNumber: string, marginLevel: number) {
    const html = baseTemplate('⚠ Margin Call Warning', `
      <p>Hi ${firstName},</p>
      <p>Your trading account <strong>${accountNumber}</strong> has reached a margin call level.</p>
      <p style="font-size:24px;font-weight:700;color:#F59E0B;font-family:monospace">Margin Level: ${marginLevel.toFixed(0)}%</p>
      <p>Please deposit funds or close some positions to avoid a stop-out.</p>
      <a href="${env.FRONTEND_URL}/trading" class="btn">Manage Positions</a>
    `);
    await send(to, `⚠ Margin Call — Account ${accountNumber}`, html);
  },

  async sendLoginNotification(to: string, firstName: string, ip: string, device: string) {
    const html = baseTemplate('New Login Detected', `
      <p>Hi ${firstName},</p>
      <p>A new login to your VertexFX account was detected.</p>
      <p><strong>IP Address:</strong> ${ip}<br><strong>Device:</strong> ${device}</p>
      <p>If this was you, no action is needed. If this wasn't you, please change your password immediately.</p>
      <a href="${env.FRONTEND_URL}/settings/security" class="btn">Secure My Account</a>
    `);
    await send(to, 'New login to your VertexFX account', html);
  },
};
