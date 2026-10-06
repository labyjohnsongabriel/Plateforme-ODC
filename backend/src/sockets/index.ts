import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { verifyAccessToken } from '../utils/jwt.util';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';

import { setupMessagerieSocket } from './messagerie.socket';
import { setupNotificationSocket } from './notification.socket';
import { setupPresenceSocket, getOnlineUsers } from './presence.socket';

let io: Server | null = null;

/**
 * Middleware d'authentification Socket.io
 */
async function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Token manquant'));
    }

    const payload = verifyAccessToken(token);

    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: payload.userId },
      relations: ['role'],
    });

    if (!user || !user.actif) {
      return next(new Error('Utilisateur invalide ou désactivé'));
    }

    // Attacher à socket.data
    socket.data.userId = user.id;
    socket.data.userRole = user.role?.nom;
    socket.data.userEmail = user.email;
    socket.data.userName = `${user.prenom} ${user.nom}`;

    next();
  } catch (err: any) {
    logger.warn(`❌ Socket auth échouée : ${err.message}`);
    next(new Error('Token invalide'));
  }
}

/**
 * Initialise le serveur Socket.io
 */
export function initializeSockets(httpServer: HttpServer): Server {
  if (io) return io;

  io = new Server(httpServer, {
    cors: {
      origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
  });

  // ========== MIDDLEWARE AUTH GLOBAL ==========
  io.use(socketAuthMiddleware);

  // ========== NAMESPACES ==========
  // /chat — messagerie temps réel
  const chatNs = io.of('/chat');
  chatNs.use(socketAuthMiddleware);
  setupMessagerieSocket(chatNs);

  // /notifications — push de notifications
  const notifNs = io.of('/notifications');
  notifNs.use(socketAuthMiddleware);
  setupNotificationSocket(notifNs);

  // /presence — statut en ligne/hors ligne
  const presenceNs = io.of('/presence');
  presenceNs.use(socketAuthMiddleware);
  setupPresenceSocket(presenceNs);

  // ========== LOG GLOBAL ==========
  io.on('connection', (socket) => {
    logger.info(
      `🔌 Socket connecté [${socket.id}] user=${socket.data.userId} role=${socket.data.userRole}`
    );

    // Rejoindre room personnel (pour notifications multi-namespaces)
    socket.join(`user:${socket.data.userId}`);

    socket.on('disconnect', (reason) => {
      logger.info(`❌ Socket déconnecté [${socket.id}] raison=${reason}`);
    });

    socket.on('error', (err) => {
      logger.error(`⚠️  Socket erreur [${socket.id}] :`, err);
    });
  });

  logger.info('✅ Socket.io initialisé (namespaces: /chat, /notifications, /presence)');

  return io;
}

/**
 * Récupère l'instance io (singleton)
 */
export function getIo(): Server {
  if (!io) throw new Error('Socket.io non initialisé. Appelez initializeSockets() d\'abord.');
  return io;
}

/**
 * Vérifie si io est initialisé
 */
export function isSocketInitialized(): boolean {
  return io !== null;
}

/**
 * Ferme le serveur Socket.io
 */
export async function closeSockets(): Promise<void> {
  if (io) {
    await io.close();
    io = null;
    logger.info('🔒 Socket.io fermé');
  }
}

/**
 * Émet un événement à un utilisateur spécifique (tous namespaces)
 */
export function emitToUser(userId: string, event: string, data: any): void {
  if (!io) return;
  io.of('/chat').to(`user:${userId}`).emit(event, data);
  io.of('/notifications').to(`user:${userId}`).emit(event, data);
}

/**
 * Émet un événement à une conversation
 */
export function emitToConversation(
  conversationId: string,
  event: string,
  data: any
): void {
  if (!io) return;
  io.of('/chat').to(`conv:${conversationId}`).emit(event, data);
}

/**
 * Émet un événement à tous les utilisateurs d'un rôle
 */
export function emitToRole(role: string, event: string, data: any): void {
  if (!io) return;
  io.of('/chat').to(`role:${role}`).emit(event, data);
}

/**
 * Émet à tous
 */
export function emitToAll(event: string, data: any): void {
  if (!io) return;
  io.of('/chat').emit(event, data);
}

/**
 * Récupère les utilisateurs en ligne
 */
export function getOnlineUserIds(): string[] {
  return getOnlineUsers();
}

// Exports
export { getOnlineUsers };