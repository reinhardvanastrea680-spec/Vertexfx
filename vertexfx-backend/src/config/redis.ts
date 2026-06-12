import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../utils/logger';

export const redis = new Redis(env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  retryStrategy(times) {
    if (times > 5) {
      logger.error('Redis: max retries reached, giving up');
      return null;
    }
    return Math.min(times * 200, 2000);
  },
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error('Redis error:', err));
redis.on('ready', () => logger.info('Redis ready'));

export async function connectRedis(): Promise<void> {
  try {
    await redis.connect();
  } catch (error) {
    logger.warn('Redis connection failed — running without cache:', error);
  }
}

// ─── Typed Redis helpers ───────────────────────────────────────────────────────

export async function setPrice(symbol: string, bid: number, ask: number): Promise<void> {
  const data = JSON.stringify({ bid, ask, mid: (bid + ask) / 2, timestamp: Date.now() });
  await redis.setex(`price:${symbol}`, 5, data);
}

export async function getPrice(symbol: string): Promise<{ bid: number; ask: number; mid: number; timestamp: number } | null> {
  const raw = await redis.get(`price:${symbol}`);
  return raw ? JSON.parse(raw) : null;
}

export async function setCache(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
}

export async function getCache<T>(key: string): Promise<T | null> {
  const raw = await redis.get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function deleteCache(key: string): Promise<void> {
  await redis.del(key);
}
