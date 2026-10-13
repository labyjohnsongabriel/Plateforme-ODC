// backend/src/sockets/socket.server.ts
import { Server as HTTPServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { socketAuthMiddleware } from './socket.middleware';
import { registerChatHandlers } from './handlers/chat.handler';
import { registerNotificationHandlers } from './handlers/notification.handler';
import { registerPresenceHandlers } from './handlers/presence.handler';
import { logger } from '../config/logger';
import { env } from '../config/env';

/* ============================================================================
   INSTANCE SOCKET.IO
   ============================================================================ */

let io: SocketServer | null = null;

export function getIO(): SocketServer {
  if (!io) throw new Error('Socket.IO non initialisé');
  return io;
}

/* ============================================================================
   INITIALISATION
   ============================================================================ */

export function initializeSockets(httpServer: HTTPServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: {
      origin: [
        env.FRONTEND_URL,
        'http://localhost:3000',
        'http://localhost:5173',
      ].filter(Boolean),
      credentials: true,
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    pingTimeout: 60_000,
    pingInterval: 25_000,
  });

  /* -------------------- Middleware d'auth -------------------- */
  io.use(socketAuthMiddleware);

  /* -------------------- Connexion -------------------- */
  io.on('connection', (socket) => {
    const userId = (socket as any).userId as string;
    const userRole = (socket as any).userRole as string;

    logger.info(`🔌 Socket connecté : ${userId} (${userRole})`);

    // Rejoindre les rooms
    socket.join(`user:${userId}`);
    socket.join(`role:${userRole}`);

    /* -------------------- Enregistrer les handlers -------------------- */
    registerChatHandlers(io!, socket);
    registerNotificationHandlers(io!, socket);
    registerPresenceHandlers(io!, socket);

    /* -------------------- Déconnexion -------------------- */
    socket.on('disconnect', (reason) => {
      logger.info(`🔌 Socket déconnecté : ${userId} (${reason})`);
    });

    socket.on('error', (error) => {
      logger.error(`❌ Socket erreur :`, error);
    });
  });

  logger.info('✅ Socket.IO initialisé');
  return io;
}