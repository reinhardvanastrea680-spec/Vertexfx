import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';

import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, redis } from './config/redis';
import { createSocketServer } from './config/socket';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import tradingRoutes from './modules/trading/trading.routes';
import walletRoutes from './modules/wallet/wallet.routes';
import marketRoutes from './modules/market/market.routes';
import adminRoutes from './modules/admin/admin.routes';
import webhookRoutes from './modules/webhooks/webhooks.routes';

// Background jobs
import { startPriceFeed, stopPriceFeed } from './jobs/priceFeed';
import { startPositionMonitor, stopPositionMonitor } from './jobs/positionMonitor';

const app = express();
const httpServer = http.createServer(app);

// ─── Socket.io ────────────────────────────────────────────────────────────────
export const io = createSocketServer(httpServer);

// ─── Security Middleware ─────────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: env.isProd ? undefined : false,
}));

app.use(cors({
  origin: env.isDev
    ? (origin, callback) => callback(null, true) // Allow all origins in development
    : [env.FRONTEND_URL, env.ADMIN_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// ─── Request Parsing ─────────────────────────────────────────────────────────
// Webhooks need raw body — mount before json parser
app.use('/api/webhooks', express.raw({ type: 'application/json' }), (req, _res, next) => {
  try { req.body = JSON.parse(req.body.toString()); } catch { /* ignore */ }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// ─── Logging ──────────────────────────────────────────────────────────────────
app.use(morgan(env.isProd ? 'combined' : 'dev', {
  stream: { write: (msg) => logger.info(msg.trim()) },
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
app.use('/api', generalLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  const dbOk = await checkDb();
  const redisOk = redis.status === 'ready';
  const status = dbOk && redisOk ? 'healthy' : 'degraded';
  res.status(status === 'healthy' ? 200 : 503).json({
    status,
    timestamp: new Date().toISOString(),
    services: {
      api: 'online',
      database: dbOk ? 'online' : 'offline',
      redis: redisOk ? 'online' : 'offline',
    },
    version: '1.0.0',
  });
});

async function checkDb(): Promise<boolean> {
  try {
    const { prisma } = await import('./config/database');
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch { return false; }
}

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trading', tradingRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);

// ─── API Documentation (dev only) ────────────────────────────────────────────
if (env.isDev) {
  app.get('/api', (_req, res) => {
    res.json({
      name: 'VertexFX API',
      version: '1.0.0',
      environment: env.NODE_ENV,
      endpoints: {
        auth: '/api/auth',
        users: '/api/users',
        trading: '/api/trading',
        wallet: '/api/wallet',
        market: '/api/market',
        admin: '/api/admin',
        webhooks: '/api/webhooks',
        health: '/health',
      },
    });
  });
}

// ─── Error Handling ───────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Server Startup ───────────────────────────────────────────────────────────
async function start(): Promise<void> {
  await connectDatabase();
  await connectRedis();

  httpServer.listen(env.PORT, () => {
    logger.info(`
╔══════════════════════════════════════════╗
║     VertexFX API Server Running          ║
║     Port:     ${env.PORT}                         ║
║     Env:      ${env.NODE_ENV.padEnd(16)}          ║
║     URL:      ${env.APP_URL.padEnd(25)} ║
╚══════════════════════════════════════════╝`);
  });

  startPriceFeed(io);
  startPositionMonitor(io);

  logger.info('Background jobs started');
}

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  stopPriceFeed();
  stopPositionMonitor();
  httpServer.close(async () => {
    await disconnectDatabase();
    await redis.quit();
    logger.info('Shutdown complete');
    process.exit(0);
  });
  setTimeout(() => { logger.error('Forced shutdown'); process.exit(1); }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (error) => { logger.error('Uncaught exception:', error); });
process.on('unhandledRejection', (reason) => { logger.error('Unhandled rejection:', reason); });

start().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});

export default app;
