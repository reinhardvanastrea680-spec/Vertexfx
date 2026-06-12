import { prisma } from '../../config/database';
import { getPrice, setPrice, setCache, getCache } from '../../config/redis';

export const marketService = {
  async getInstruments(category?: string) {
    const cacheKey = `instruments:${category ?? 'all'}`;
    const cached = await getCache<unknown[]>(cacheKey);
    if (cached) return cached;

    const instruments = await prisma.instrument.findMany({
      where: {
        isActive: true,
        ...(category ? { category: category as never } : {}),
      },
      orderBy: [{ category: 'asc' }, { symbol: 'asc' }],
    });

    await setCache(cacheKey, instruments, 60);
    return instruments;
  },

  async getInstrument(symbol: string) {
    return prisma.instrument.findUnique({ where: { symbol } });
  },

  async getCurrentPrice(symbol: string) {
    const price = await getPrice(symbol);
    if (price) return price;

    // Simulate price if no real feed
    const instrument = await prisma.instrument.findUnique({ where: { symbol } });
    if (!instrument) return null;

    const base = symbol === 'EURUSD' ? 1.0847 : symbol === 'BTCUSD' ? 67420 : symbol === 'GOLD' ? 2384 : 1.0;
    const spread = Number(instrument.spread) / 2 || 0.0001;
    const bid = base - spread;
    const ask = base + spread;
    await setPrice(symbol, bid, ask);
    return { bid, ask, mid: (bid + ask) / 2, timestamp: Date.now() };
  },

  async getCandles(symbol: string, timeframe: string, from: Date, to: Date) {
    return prisma.ohlcvCandle.findMany({
      where: {
        symbol,
        timeframe: timeframe as never,
        candleTime: { gte: from, lte: to },
      },
      orderBy: { candleTime: 'asc' },
      take: 500,
    });
  },
};
