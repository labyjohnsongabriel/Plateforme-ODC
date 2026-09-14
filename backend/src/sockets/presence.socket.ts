import { Namespace, Socket } from 'socket.io';
import { logger } from '../config/logger';

/**
 * Map des utilisateurs en ligne : Map<userId, Set<socketId>>
 * Un utilisateur peut avoir plusieurs sockets (multi-onglets)
 */
const onlineUsers = new Map<string, Set<string>>();

/**
 * Map inverse : Map<socketId, userId>
 */
const socketToUser = new Map<string, string>();

/**
 * Statut personnalisé des utilisateurs
 */
export interface UserStatus {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: Date;
  customMessage?: string;
}

const userStatuses = new Map<string, UserStatus>();

/**
 * Setup du namespace /presence
 */
export function setupPresenceSocket(presenceNs: Namespace): void {
  presenceNs.on('connection', async (socket: Socket) => {
    const userId: string = socket.data.userId;
    const userName: string = socket.data.userName;

    logger.info(`🟢 [PRESENCE] user=${userId} connecté (${userName})`);

    // ==================================================
    // ENREGISTRER L'UTILISATEUR
    // ==================================================
    registerOnline(userId, socket.id);

    // Rejoindre la room personnelle
    socket.join(`user:${userId}`);

    // Statut par défaut
    setStatus(userId, 'online');

    // ==================================================
    // DIFFUSER LA CONNEXION À TOUS
    // ==================================================
    presenceNs.emit('user:online', {
      userId,
      userName,
      status: 'online',
      timestamp: new Date().toISOString(),
    });

    // Envoyer la liste actuelle des utilisateurs en ligne
    socket.emit('presence:list', {
      onlineIds: getOnlineUsers(),
      total: onlineUsers.size,
    });

    // ==================================================
    // DEMANDER LA LISTE DES UTILISATEURS EN LIGNE
    // ==================================================
    socket.on('presence:getOnline', () => {
      socket.emit('presence:list', {
        onlineIds: getOnlineUsers(),
        total: onlineUsers.size,
      });
    });

    // ==================================================
    // VÉRIFIER SI UN UTILISATEUR EST EN LIGNE
    // ==================================================
    socket.on('presence:check', (targetUserId: string, callback?: Function) => {
      const isOnline = onlineUsers.has(targetUserId);
      const status = userStatuses.get(targetUserId);

      const result = {
        userId: targetUserId,
        online: isOnline,
        status: status?.status || 'offline',
        lastSeen: status?.lastSeen,
      };

      if (callback) callback(result);
      else socket.emit('presence:check:result', result);
    });

    // ==================================================
    // VÉRIFIER PLUSIEURS UTILISATEURS EN UNE FOIS
    // ==================================================
    socket.on('presence:checkMultiple', (userIds: string[], callback?: Function) => {
      const results = userIds.map((uid) => ({
        userId: uid,
        online: onlineUsers.has(uid),
        status: userStatuses.get(uid)?.status || 'offline',
        lastSeen: userStatuses.get(uid)?.lastSeen,
      }));

      if (callback) callback(results);
      else socket.emit('presence:check:multiple', results);
    });

    // ==================================================
    // CHANGER DE STATUT
    // ==================================================
    socket.on(
      'presence:setStatus',
      (data: { status: 'online' | 'away' | 'busy'; customMessage?: string }) => {
        setStatus(userId, data.status, data.customMessage);

        presenceNs.emit('user:statusChanged', {
          userId,
          status: data.status,
          customMessage: data.customMessage,
          timestamp: new Date().toISOString(),
        });

        logger.debug(`🔄 [PRESENCE] user=${userId} → ${data.status}`);
      }
    );

    // ==================================================
    // HEARTBEAT (garde la connexion active)
    // ==================================================
    socket.on('presence:ping', () => {
      socket.emit('presence:pong', { timestamp: Date.now() });
    });

    // ==================================================
    // DÉCONNEXION
    // ==================================================
    socket.on('disconnect', () => {
      const removed = unregisterOnline(userId, socket.id);

      if (removed) {
        // L'utilisateur n'a plus de sockets connectés
        const lastSeen = new Date();
        setStatus(userId, 'offline', undefined, lastSeen);

        presenceNs.emit('user:offline', {
          userId,
          userName,
          lastSeen: lastSeen.toISOString(),
        });

        logger.info(`🔴 [PRESENCE] user=${userId} déconnecté`);
      } else {
        logger.debug(
          `🔌 [PRESENCE] Socket ${socket.id} fermé (user=${userId} encore en ligne)`
        );
      }
    });
  });
}

// ==================================================
// GESTION DE LA PRÉSENCE
// ==================================================

/**
 * Enregistre un socket comme en ligne
 */
function registerOnline(userId: string, socketId: string): void {
  if (!onlineUsers.has(userId)) {
    onlineUsers.set(userId, new Set());
  }
  onlineUsers.get(userId)!.add(socketId);
  socketToUser.set(socketId, userId);
}

/**
 * Retire un socket. Retourne true si l'utilisateur n'a plus de sockets.
 */
function unregisterOnline(userId: string, socketId: string): boolean {
  const sockets = onlineUsers.get(userId);
  if (!sockets) return false;

  sockets.delete(socketId);
  socketToUser.delete(socketId);

  if (sockets.size === 0) {
    onlineUsers.delete(userId);
    return true;
  }
  return false;
}

/**
 * Définit le statut d'un utilisateur
 */
function setStatus(
  userId: string,
  status: UserStatus['status'],
  customMessage?: string,
  lastSeen?: Date
): void {
  const existing = userStatuses.get(userId);

  userStatuses.set(userId, {
    userId,
    status,
    customMessage: customMessage ?? existing?.customMessage,
    lastSeen: status === 'offline' ? lastSeen || new Date() : existing?.lastSeen,
  });
}

// ==================================================
// HELPERS PUBLICS
// ==================================================

/**
 * Liste des IDs des utilisateurs en ligne
 */
export function getOnlineUsers(): string[] {
  return Array.from(onlineUsers.keys());
}

/**
 * Nombre d'utilisateurs en ligne
 */
export function getOnlineCount(): number {
  return onlineUsers.size;
}

/**
 * Vérifie si un utilisateur est en ligne
 */
export function isUserOnline(userId: string): boolean {
  return onlineUsers.has(userId);
}

/**
 * Récupère le statut d'un utilisateur
 */
export function getUserStatus(userId: string): UserStatus {
  return (
    userStatuses.get(userId) || {
      userId,
      status: 'offline',
    }
  );
}

/**
 * Récupère les sockets d'un utilisateur
 */
export function getUserSockets(userId: string): string[] {
  return Array.from(onlineUsers.get(userId) || []);
}

/**
 * Force la déconnexion d'un utilisateur
 */
export function forceDisconnectUser(
  presenceNs: Namespace,
  userId: string
): void {
  const sockets = getUserSockets(userId);
  for (const sid of sockets) {
    const socket = presenceNs.sockets.get(sid);
    if (socket) socket.disconnect(true);
  }
}

/**
 * Statistiques de présence
 */
export function getPresenceStats() {
  const stats = {
    totalOnline: onlineUsers.size,
    totalSockets: 0,
    byStatus: {
      online: 0,
      away: 0,
      busy: 0,
      offline: 0,
    },
  };

  for (const sockets of onlineUsers.values()) {
    stats.totalSockets += sockets.size;
  }

  for (const status of userStatuses.values()) {
    if (stats.byStatus[status.status] !== undefined) {
      stats.byStatus[status.status]++;
    }
  }

  return stats;
}