import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

import { useAuth } from '@/context/AuthContext';
import { tokenStorage } from '@/services/api';
import type { ReactNode } from 'react';

// ============================================================================
//  TYPES
// ============================================================================

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ??
  import.meta.env.VITE_API_URL?.replace('/api', '') ??
  'http://localhost:5000';

// ============================================================================
//  PROVIDER
// ============================================================================

interface SocketProviderProps {
  children: ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const { isAuthenticated } = useAuth();

  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const intentionalDisconnect = useRef(false);

  // ========================================================================
  //  DISCONNECT
  // ========================================================================

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      intentionalDisconnect.current = true;
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  // ========================================================================
  //  CONNECT
  // ========================================================================

  const connect = useCallback(() => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      console.warn('[Socket] Pas de token — connexion annulée');
      return;
    }

    // Éviter les connexions multiples
    if (socketRef.current?.connected) {
      console.log('[Socket] Déjà connecté');
      return;
    }

    // Nettoyer l'ancien socket s'il existe
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    console.log('[Socket] Connexion en cours...', SOCKET_URL);
    intentionalDisconnect.current = false;

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      autoConnect: true,
      withCredentials: true,
    });

    // ---------------------------------------------------------------------
    //  ÉVÉNEMENTS
    // ---------------------------------------------------------------------

    newSocket.on('connect', () => {
      console.log('[Socket] ✅ Connecté', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('[Socket] ⚠️ Déconnecté — raison :', reason);
      setIsConnected(false);

      // Reconnexion automatique (sauf si déconnexion volontaire)
      if (!intentionalDisconnect.current && reason !== 'io client disconnect') {
        setTimeout(() => {
          if (!intentionalDisconnect.current && !newSocket.connected) {
            newSocket.connect();
          }
        }, 1500);
      }
    });

    newSocket.on('connect_error', (err) => {
      // ⚠️ Silencieux en dev pour éviter de spammer la console
      if (import.meta.env.DEV) {
        console.warn('[Socket] Erreur de connexion :', err.message);
      }
      setIsConnected(false);
    });

    newSocket.on('error', (err) => {
      console.error('[Socket] Erreur :', err);
    });

    // Événement custom (si ton backend en envoie)
    newSocket.on('notification', (data) => {
      console.log('[Socket] Notification reçue:', data);
      // Optionnel : toast.info(data.message);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  }, []);

  // ========================================================================
  //  EFFET — Connexion selon l'auth
  // ========================================================================

  useEffect(() => {
    // Reconnexion auto quand on revient sur l'onglet
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (isAuthenticated && !socketRef.current?.connected) {
          console.log('[Socket] Retour sur l\'onglet — reconnexion');
          connect();
        }
      }
    };

    const handleOnline = () => {
      if (isAuthenticated && !socketRef.current?.connected) {
        console.log('[Socket] Réseau restauré — reconnexion');
        connect();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
    };
  }, [isAuthenticated, connect]);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      // Nettoyer UNIQUEMENT à la destruction du provider
      // (pas à chaque re-render)
    };
  }, [isAuthenticated, connect, disconnect]);

  // Nettoyage à la destruction du composant
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        intentionalDisconnect.current = true;
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // ========================================================================
  //  CONTEXT
  // ========================================================================

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connect,
        disconnect,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

// ============================================================================
//  HOOK
// ============================================================================

export function useSocket(): SocketContextValue {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return ctx;
}

export default SocketContext;