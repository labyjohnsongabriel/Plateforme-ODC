import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { MessagerieService } from '../services/messagerie.service';
import { useSocket } from './useSocket';
import { useAuth } from '@/context/AuthContext';
import type { Message } from '../types/messagerie.types';

export function useMessages(conversationId?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ========================================================================
  // Charger
  // ========================================================================
  const load = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      setLoading(true);
      const response = await MessagerieService.getMessages(conversationId);
      setMessages(response.data || []);
      await MessagerieService.marquerLus(conversationId);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    load();
  }, [load]);

  // ========================================================================
  // Socket
  // ========================================================================
  useSocket('message:new', (message: Message) => {
    if (message.conversationId === conversationId) {
      setMessages((prev) => {
        // Éviter les doublons
        if (prev.find((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    }
  });

  // ========================================================================
  // Auto-scroll
  // ========================================================================
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    scrollToBottom('auto');
  }, [conversationId, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // ========================================================================
  // Envoyer
  // ========================================================================
  const sendMessage = async (contenu: string): Promise<boolean> => {
    if (!conversationId || !contenu.trim()) return false;

    try {
      // Envoyer via socket si disponible
      const socket = (window as any).__socket;
      if (socket?.connected) {
        socket.emit('message:send', { conversationId, contenu });
        return true;
      }

      // Fallback REST
      const newMsg = await MessagerieService.envoyer(conversationId, { contenu });
      setMessages((prev) => [...prev, newMsg]);
      return true;
    } catch {
      toast.error('Erreur d\'envoi');
      return false;
    }
  };

  return {
    messages,
    loading,
    currentUserId: user?.id || '',
    sendMessage,
    messagesEndRef,
    refetch: load,
  };
}