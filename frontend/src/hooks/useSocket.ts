// src/hooks/useSocket.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  connectSocket,
  disconnectSocket,
  getSocket,
  type AppSocket,
} from '@/lib/socket';
import { useAuthStore } from '@/store/auth.store';

export interface UseSocketReturn {
  socket: AppSocket | null;
  isConnected: boolean;
  emit: <T = any>(event: string, payload?: T) => void;
  on: (event: string, handler: (...args: any[]) => void) => () => void;
  off: (event: string, handler?: (...args: any[]) => void) => void;
}

export function useSocket(): UseSocketReturn {
  const token = useAuthStore((s) => s.accessToken);
  const [socket, setSocket] = useState<AppSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  /* -------------------- Connexion automatique -------------------- */
  useEffect(() => {
    if (!token) {
      disconnectSocket();
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const s = connectSocket(token);
    setSocket(s);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);

    if (s.connected) setIsConnected(true);

    return () => {
      s.off('connect', onConnect);
      s.off('disconnect', onDisconnect);
    };
  }, [token]);

  /* -------------------- Helpers -------------------- */
  const emit = useCallback(
    (event: string, payload?: any) => {
      if (socket?.connected) socket.emit(event, payload);
    },
    [socket],
  );

  const on = useCallback(
    (event: string, handler: (...args: any[]) => void) => {
      if (!socket) return () => {};
      socket.on(event, handler);
      return () => {
        socket.off(event, handler);
      };
    },
    [socket],
  );

  const off = useCallback(
    (event: string, handler?: (...args: any[]) => void) => {
      if (!socket) return;
      if (handler) socket.off(event, handler);
      else socket.removeAllListeners(event);
    },
    [socket],
  );

  return { socket, isConnected, emit, on, off };
}