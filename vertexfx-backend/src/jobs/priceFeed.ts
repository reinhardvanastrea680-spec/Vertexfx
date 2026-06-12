import { prisma } from '../config/database';
import { setPrice } from '../config/redis';
import { logger } from '../utils/logger';

// Simulated price feed — replace with MT5 bridge / FIX API in production
const BASE_PRICES: Record<string, number> = {
  EURUSD: 1.0847, GBPUSD: 1.2734, USDJPY: 157.42, USDCHF: 0.8972,
  AUDUSD: 0.6542, NZDUSD: 0.5987, USDCAD: 1.3621,
  BTCUSD: 67420, ETHUSD: 3521, XRPUSD: 0.5234,
  GOLD: 2384, SILVER: 29.45, OILUSD: 78.34,
  NAS100: 18432, SP500: 5248, DOW30: 39480,
};

const prices: Record<string, number> = { ...BASE_PRICES };
let feedInterval: NodeJS.Timeout | null = null;

export function startPriceFeed(io?: import('socket.io').Server): void {
  if (feedInterval) return;

  feedInterval = setInterval(async () => {
    try {
      const updates: Array<{ symbol: string; bid: number; ask: number }> = [];

      for (const [symbol, basePrice] of Object.entries(prices)) {
        // Simulate realistic price movement
        const volatility = getVolatility(symbol);
        const change = (Math.random() - 0.499) * volatility;
        prices[symbol] = Math.max(prices[symbol] + change, basePrice * 0.5);

        const spreadPips = getSpreadPips(symbol);
        const mid = prices[symbol];
        const bid = mid - spreadPips / 2;
        const ask = mid + spreadPips / 2;

        await setPrice(symbol, bid, ask);
        updates.push({ symbol, bid, ask });
      }

      // Broadcast to subscribed clients
      if (io) {
        for (const update of updates) {
          io.to(`price:${update.symbol}`).emit('price:tick', {
            symbol: update.symbol,
            bid: update.bid.toFixed(5),
            ask: update.ask.toFixed(5),
            timestamp: Date.now(),
          });
        }
      }
    } catch (error) {
      logger.error('Price feed error:', error);
    }
  }, 500); // 500ms ticks

  logger.info('Price feed started (simulated)');
}

export function stopPriceFeed(): void {
  if (feedInterval) {
    clearInterval(feedInterval);
    feedInterval = null;
  }
}

function getVolatility(symbol: string): number {
  if (symbol.includes('BTC')) return 50;
  if (symbol.includes('ETH')) return 20;
  if (symbol.includes('XRP')) return 0.002;
  if (symbol.includes('GOLD')) return 0.5;
  if (symbol.includes('OIL')) return 0.1;
  if (symbol.includes('NAS') || symbol.includes('SP5') || symbol.includes('DOW')) return 5;
  return 0.0003; // Forex
}

function getSpreadPips(symbol: string): number {
  if (symbol.includes('BTC')) return 20;
  if (symbol.includes('ETH')) return 3;
  if (symbol.includes('XRP')) return 0.0002;
  if (symbol.includes('GOLD')) return 0.3;
  if (symbol.includes('OIL')) return 0.04;
  if (symbol.includes('NAS') || symbol.includes('SP5')) return 1;
  return 0.0001; // Forex
}
