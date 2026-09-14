import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { MessagerieService } from '../services/messagerie.service';
import { useSocket } from './useSocket';
import { useAuth } from '@/context/AuthContext';
import type { Conversation } from '../types/messagerie.types';

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = user?.id || '';

  // ========================================================================
  // Charger
  // ========================================================================
  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await MessagerieService.getConversations();
      setConversations(MessagerieService.sortByRecent(data));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ========================================================================
  // Socket — Nouveau message
  // ========================================================================
  useSocket('message:new', (message: any) => {
    setConversations((prev) => {
      const convIndex = prev.findIndex((c) => c.id === message.conversationId);

      if (convIndex === -1) {
        // Nouvelle conversation → recharger
        load();
        return prev;
      }

      const updated = [...prev];
      const conv = { ...updated[convIndex] };

      conv.dernierMessage = message;
      conv.dernierMessageAt = message.createdAt;

      if (message.expediteurId !== currentUserId) {
        conv.nonLus = (conv.nonLus || 0) + 1;
      }

      // Déplacer en haut
      updated.splice(convIndex, 1);
      return [conv, ...updated];
    });
  });

  // ========================================================================
  // Actions
  // ========================================================================
  const createPrivate = async (userId: string): Promise<Conversation | null> => {
    try {
      const conv = await MessagerieService.createPrivate({ userId });
      setConversations((prev) => {
        if (prev.find((c) => c.id === conv.id)) return prev;
        return [conv, ...prev];
      });
      return conv;
    } catch {
      toast.error('Erreur de création');
      return null;
    }
  };

  const createGroupe = async (titre: string, membreIds: string[]): Promise<Conversation | null> => {
    try {
      const conv = await MessagerieService.createGroupe({ titre, membreIds });
      setConversations((prev) => [conv, ...prev]);
      return conv;
    } catch {
      toast.error('Erreur de création');
      return null;
    }
  };

  const markAsRead = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, nonLus: 0 } : c))
    );
  };

  // Total non lus
  const totalNonLus = conversations.reduce((sum, c) => sum + (c.nonLus || 0), 0);

  return {
    conversations,
    loading,
    error,
    currentUserId,
    totalNonLus,
    refetch: load,
    createPrivate,
    createGroupe,
    markAsRead,
  };
}