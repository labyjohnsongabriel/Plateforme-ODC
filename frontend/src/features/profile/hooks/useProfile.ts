import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '@/services/api';
import { authApi } from '@/services/auth.api';
import { useAuth } from '@/context/AuthContext';
import type { User } from '@/types/user.types';

// ============================================================================
//  HOOK PRINCIPAL
// ============================================================================

export function useProfile() {
  const { user: authUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ========================================================================
  // Charger le profil
  // ========================================================================
  const load = useCallback(async () => {
    if (!authUser?.id) return;

    try {
      setLoading(true);
      const { data } = await api.get(`/users/${authUser.id}`);
      setProfile(data.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => {
    load();
  }, [load]);

  // ========================================================================
  // Mettre à jour le profil
  // ========================================================================
  const update = async (payload: Partial<User>): Promise<boolean> => {
    if (!authUser?.id) return false;

    setSaving(true);
    try {
      const { data } = await api.put(`/users/${authUser.id}`, payload);
      setProfile(data.data);
      toast.success('Profil mis à jour avec succès');
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  };

  // ========================================================================
  // Upload avatar
  // ========================================================================
  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!authUser?.id) return null;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post(`/users/${authUser.id}/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const url = data.data.url;
      setProfile((prev) => (prev ? { ...prev, photoUrl: url } : null));
      toast.success('Avatar mis à jour');
      return url;
    } catch {
      return null;
    } finally {
      setUploading(false);
    }
  };

  // ========================================================================
  // Changer mot de passe
  // ========================================================================
  const changePassword = async (
    ancienMotDePasse: string,
    nouveauMotDePasse: string
  ): Promise<boolean> => {
    setSaving(true);
    try {
      await authApi.changePassword({
        ancienMotDePasse,
        nouveauMotDePasse,
      });
      toast.success('Mot de passe modifié avec succès');
      return true;
    } catch {
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    profile,
    loading,
    saving,
    uploading,
    update,
    uploadAvatar,
    changePassword,
    refetch: load,
  };
}