import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';
import { env } from './env';
import { logger } from '../utils/logger';

export function createSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: [env.FRONTEND_URL, env.ADMIN_URL],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  // Authentication middleware for sockets
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token ?? socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        // Allow unauthenticated connections for public price feeds
        socket.data.authenticated = false;
        return next();
      }
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.userId;
      socket.data.role = payload.role;
      socket.data.authenticated = true;
      next();
    } catch {
      socket.data.authenticated = false;
      next(); // Still allow — unauthenticated can only subscribe to public channels
    }
  });

  io.on('connection', (socket: Socket) => {
    logger.debug(`Socket connected: ${socket.id} (user: ${socket.data.userId ?? 'guest'})`);

    // Join user-specific room for personal updates
    if (socket.data.userId) {
      socket.join(`user:${socket.data.userId}`);
    }

    // Admin joins admin room
    if (['admin', 'super_admin', 'compliance', 'finance', 'risk_manager', 'support'].includes(socket.data.role)) {
      socket.join('admin');
    }

    // Subscribe to price feed for a symbol
    socket.on('subscribe:price', ({ symbol }: { symbol: string }) => {
      if (typeof symbol === 'string' && symbol.length <= 20) {
        socket.join(`price:${symbol}`);
      }
    });

    socket.on('unsubscribe:price', ({ symbol }: { symbol: string }) => {
      socket.leave(`price:${symbol}`);
    });

    socket.on('disconnect', (reason) => {
      logger.debug(`Socket disconnected: ${socket.id} — ${reason}`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error ${socket.id}:`, error);
    });
  });

  return io;
}
