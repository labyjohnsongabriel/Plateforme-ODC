import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { tokenStorage } from '@/services/api';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

let globalSocket: Socket | null = null;

export function getSocket(): Socket | null {
    return globalSocket;
}

export function useSocket(event?: string, handler?: (data: any) => void) {
    const handlerRef = useRef(handler);
    handlerRef.current = handler;

    useEffect(() => {
        const token = tokenStorage.getAccessToken();
        if (!token) return;

        // Créer le socket une seule fois
        if (!globalSocket) {
            globalSocket = io(`${SOCKET_URL}/chat`, {
                auth: { token },
                transports: ['polling', 'websocket'],
                reconnection: true,
                reconnectionDelay: 1000,
            });

            globalSocket.on('connect', () => {
                console.log('✅ Socket connecté');
            });

            globalSocket.on('connect_error', (err) => {
                console.error('❌ Socket erreur :', err.message);
            });
        }

        // Enregistrer le handler si fourni
        if (event && handlerRef.current) {
            const wrappedHandler = (data: any) => handlerRef.current?.(data);
            globalSocket.on(event, wrappedHandler);

            return () => {
                globalSocket?.off(event, wrappedHandler);
            };
        }
    }, [event]);

    return globalSocket;
}

export function disconnectSocket(): void {
    if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
    }
}