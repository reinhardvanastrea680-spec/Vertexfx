import dotenv from 'dotenv';
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

function optional(key: string, fallback = ''): string {
  return process.env[key] ?? fallback;
}

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '3001'), 10),
  APP_URL: optional('APP_URL', 'http://localhost:3001'),
  FRONTEND_URL: optional('FRONTEND_URL', 'http://localhost:5173'),
  ADMIN_URL: optional('ADMIN_URL', 'http://localhost:5174'),

  DATABASE_URL: optional('DATABASE_URL', ''),

  REDIS_URL: optional('REDIS_URL', 'redis://localhost:6379'),

  JWT_ACCESS_SECRET: optional('JWT_ACCESS_SECRET', 'dev_access_secret_change_in_production'),
  JWT_REFRESH_SECRET: optional('JWT_REFRESH_SECRET', 'dev_refresh_secret_change_in_production'),
  JWT_ACCESS_EXPIRES: optional('JWT_ACCESS_EXPIRES', '15m'),
  JWT_REFRESH_EXPIRES: optional('JWT_REFRESH_EXPIRES', '7d'),

  AWS_ACCESS_KEY_ID: optional('AWS_ACCESS_KEY_ID'),
  AWS_SECRET_ACCESS_KEY: optional('AWS_SECRET_ACCESS_KEY'),
  AWS_S3_BUCKET: optional('AWS_S3_BUCKET', 'vertexfx-kyc-documents'),
  AWS_S3_REGION: optional('AWS_S3_REGION', 'us-east-1'),

  SENDGRID_API_KEY: optional('SENDGRID_API_KEY'),
  SENDGRID_FROM_EMAIL: optional('SENDGRID_FROM_EMAIL', 'noreply@vertexfx.com'),
  SENDGRID_FROM_NAME: optional('SENDGRID_FROM_NAME', 'VertexFX'),

  TWILIO_ACCOUNT_SID: optional('TWILIO_ACCOUNT_SID'),
  TWILIO_AUTH_TOKEN: optional('TWILIO_AUTH_TOKEN'),
  TWILIO_PHONE_NUMBER: optional('TWILIO_PHONE_NUMBER'),

  STRIPE_SECRET_KEY: optional('STRIPE_SECRET_KEY'),
  STRIPE_WEBHOOK_SECRET: optional('STRIPE_WEBHOOK_SECRET'),

  FLUTTERWAVE_SECRET_KEY: optional('FLUTTERWAVE_SECRET_KEY'),
  FLUTTERWAVE_WEBHOOK_SECRET: optional('FLUTTERWAVE_WEBHOOK_SECRET'),

  PAYSTACK_SECRET_KEY: optional('PAYSTACK_SECRET_KEY'),
  PAYSTACK_WEBHOOK_SECRET: optional('PAYSTACK_WEBHOOK_SECRET'),

  ENCRYPTION_KEY: optional('ENCRYPTION_KEY', 'dev_32char_encryption_key_change!'),

  RATE_LIMIT_WINDOW_MS: parseInt(optional('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX: parseInt(optional('RATE_LIMIT_MAX', '100'), 10),
  AUTH_RATE_LIMIT_MAX: parseInt(optional('AUTH_RATE_LIMIT_MAX', '5'), 10),

  isProd: process.env.NODE_ENV === 'production',
  isDev: process.env.NODE_ENV !== 'production',
};
