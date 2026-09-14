import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { UserService } from '../services/user.service';
import type { User, CreateUserPayload, UpdateUserPayload } from '../types/user.types';

export function useUserForm(userId?: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!userId);

  // ========================================================================
  // Charger si édition
  // ========================================================================
  useEffect(() => {
    if (!userId) return;

    const load = async () => {
      try {
        setFetching(true);
        const data = await UserService.getById(userId);
        setUser(data);
      } catch {
        toast.error('Utilisateur introuvable');
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [userId]);

  // ========================================================================
  // Créer
  // ========================================================================
  const create = async (payload: CreateUserPayload): Promise<User | null> => {
    setLoading(true);
    try {
      const created = await UserService.create(payload);
      toast.success('Utilisateur créé avec succès');
      return created;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // Mettre à jour
  // ========================================================================
  const update = async (payload: UpdateUserPayload): Promise<User | null> => {
    if (!userId) return null;
    setLoading(true);
    try {
      const updated = await UserService.update(userId, payload);
      toast.success('Utilisateur mis à jour');
      return updated;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // Upload avatar
  // ========================================================================
  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!userId) return null;
    try {
      const result = await UserService.uploadAvatar(userId, file);
      setUser((prev) => (prev ? { ...prev, photoUrl: result.url } : null));
      toast.success('Avatar mis à jour');
      return result.url;
    } catch {
      toast.error('Erreur d\'upload');
      return null;
    }
  };

  return {
    user,
    loading,
    fetching,
    create,
    update,
    uploadAvatar,
    isEdit: !!userId,
  };
}