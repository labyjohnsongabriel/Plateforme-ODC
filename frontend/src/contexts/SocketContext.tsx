'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { connectSocket, disconnectSocket, type AppSocket } from '@/lib/socket';
import { useAuthStore } from '@/store/auth.store';

/* ============================================================================
   CONTEXT
   ============================================================================ */
interface SocketContextValue {
  socket: AppSocket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue | null>(null);

/* ============================================================================
   PROVIDER
   ============================================================================ */
export function SocketProvider({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.accessToken);
  const [socket, setSocket] = useState<AppSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

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

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

/* ============================================================================
   HOOK
   ============================================================================ */
export function useSocketContext(): SocketContextValue {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error('useSocketContext doit être utilisé dans <SocketProvider>');
  }
  return ctx;
}