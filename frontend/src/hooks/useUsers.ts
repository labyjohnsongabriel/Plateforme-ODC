// src/app/(admin)/admin/utilisateurs/hooks/useUsers.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

/* ============================================================================
   TYPES
   ============================================================================ */

export type RoleNom =
  | 'ADMINISTRATEUR'
  | 'STAFF_ODC'
  | 'FORMATEUR'
  | 'PARTICIPANT'
  | 'PARTENAIRE';

export const ROLE_NOMS: readonly RoleNom[] = [
  'ADMINISTRATEUR',
  'STAFF_ODC',
  'FORMATEUR',
  'PARTICIPANT',
  'PARTENAIRE',
] as const;

export const ROLE_LABELS: Record<RoleNom, string> = {
  ADMINISTRATEUR: 'Administrateur',
  STAFF_ODC: 'Staff ODC',
  FORMATEUR: 'Formateur',
  PARTICIPANT: 'Participant',
  PARTENAIRE: 'Partenaire',
};

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  photoUrl?: string;
  bio?: string;
  ville?: string;
  entreprise?: string;
  poste?: string;
  siteWeb?: string;
  linkedin?: string;
  actif: boolean;
  emailVerifie: boolean;
  role?: {
    id: string;
    nom: RoleNom;
    libelle: string;
    couleur?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UsersStats {
  total: number;
  actifs: number;
  inactifs: number;
  parRole: Array<{ role: RoleNom; count: number }>;
}

export interface UserFormValues {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  roleNom: RoleNom;
  bio?: string;
  ville?: string;
  entreprise?: string;
  poste?: string;
  siteWeb?: string;
  linkedin?: string;
  actif: boolean;
  emailVerifie: boolean;
  motDePasse?: string;
  confirmation?: string;
}

export interface UserFilters {
  q?: string;
  roleId?: string;
  actif?: 'all' | 'true' | 'false';
  page?: number;
  limit?: number;
}

/* ============================================================================
   HELPERS
   ============================================================================ */

function extractList<T>(response: any): T[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}

function extractItem<T>(response: any): T {
  if (response?.data?.data) return response.data.data;
  if (response?.data) return response.data;
  return response;
}

function extractPagination(response: any) {
  return (
    response?.pagination ??
    response?.data?.pagination ?? {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    }
  );
}

function normalizeUser(raw: any): User {
  return {
    id: String(raw?.id ?? raw?._id ?? ''),
    nom: raw?.nom ?? '',
    prenom: raw?.prenom ?? '',
    email: raw?.email ?? '',
    telephone: raw?.telephone ?? '',
    photoUrl: raw?.photoUrl ?? raw?.avatar ?? undefined,
    bio: raw?.bio ?? '',
    ville: raw?.ville ?? '',
    entreprise: raw?.entreprise ?? '',
    poste: raw?.poste ?? '',
    siteWeb: raw?.siteWeb ?? '',
    linkedin: raw?.linkedin ?? '',
    actif: raw?.actif ?? raw?.active ?? true,
    emailVerifie: raw?.emailVerifie ?? false,
    role: raw?.role
      ? {
          id: String(raw.role.id ?? ''),
          nom: raw.role.nom ?? 'PARTICIPANT',
          libelle: raw.role.libelle ?? '',
          couleur: raw.role.couleur ?? '#FF7900',
        }
      : undefined,
    createdAt: raw?.createdAt ?? new Date().toISOString(),
    updatedAt: raw?.updatedAt ?? new Date().toISOString(),
  };
}

function cleanFilters(filters?: UserFilters): Record<string, any> {
  if (!filters) return {};
  const cleaned: Record<string, any> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (
      value === 'all' ||
      value === '' ||
      value === undefined ||
      value === null
    ) {
      return;
    }
    cleaned[key] = value;
  });
  return cleaned;
}

/* ============================================================================
   CLÉS
   ============================================================================ */

export const userKeys = {
  all: ['admin', 'users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, 'stats'] as const,
};

/* ============================================================================
   QUERIES
   ============================================================================ */

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: async () => {
      const params = cleanFilters(filters);
      const response = await api.get('/admin/users', { params });
      return {
        data: extractList<any>(response).map(normalizeUser),
        pagination: extractPagination(response),
      };
    },
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: userKeys.detail(id ?? ''),
    queryFn: async (): Promise<User> => {
      const response = await api.get(`/admin/users/${id}`);
      return normalizeUser(extractItem<any>(response));
    },
    enabled: !!id,
    retry: 1,
  });
}

export function useUsersStats() {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: async (): Promise<UsersStats> => {
      try {
        const response = await api.get('/admin/users/stats/roles');
        const raw = extractItem<any>(response) ?? {};

        // ⭐ Gérer les deux formats : avec total/actifs/inactifs OU directement parRole
        if (Array.isArray(raw?.parRole)) {
          return {
            total: Number(raw?.total ?? 0),
            actifs: Number(raw?.actifs ?? 0),
            inactifs: Number(raw?.inactifs ?? 0),
            parRole: raw.parRole,
          };
        }

        // Si l'API renvoie un tableau direct (ancien format)
        if (Array.isArray(raw)) {
          const total = raw.reduce(
            (sum: number, r: any) => sum + Number(r.count ?? 0),
            0,
          );
          return {
            total,
            actifs: total,
            inactifs: 0,
            parRole: raw.map((r: any) => ({
              role: r.role,
              count: Number(r.count),
            })),
          };
        }

        return { total: 0, actifs: 0, inactifs: 0, parRole: [] };
      } catch {
        // Fallback : dériver depuis la liste complète
        try {
          const response = await api.get('/admin/users', {
            params: { limit: 1000 },
          });
          const list = extractList<any>(response).map(normalizeUser);
          const roleMap: Record<string, number> = {};
          list.forEach((u) => {
            const r = u.role?.nom ?? 'PARTICIPANT';
            roleMap[r] = (roleMap[r] ?? 0) + 1;
          });
          return {
            total: list.length,
            actifs: list.filter((u) => u.actif).length,
            inactifs: list.filter((u) => !u.actif).length,
            parRole: Object.entries(roleMap).map(([role, count]) => ({
              role: role as RoleNom,
              count,
            })),
          };
        } catch {
          return { total: 0, actifs: 0, inactifs: 0, parRole: [] };
        }
      }
    },
    staleTime: 60_000,
    retry: 0,
    refetchOnWindowFocus: false,
  });
}

/* ============================================================================
   MUTATIONS
   ============================================================================ */

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UserFormValues) => {
      const response = await api.post('/admin/users', payload);
      return normalizeUser(extractItem<any>(response));
    },
    onSuccess: () => {
      toast.success('Utilisateur créé avec succès');
      qc.invalidateQueries({ queryKey: userKeys.lists() });
      qc.invalidateQueries({ queryKey: userKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/**
 * ⭐⭐ Mise à jour des infos générales UNIQUEMENT
 * Le rôle N'EST PAS modifié ici → utiliser `useChangeUserRole`
 */
export function useUpdateUser(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<UserFormValues>) => {
      // ⭐⭐⭐ Retirer roleNom, email, motDePasse de la mise à jour
      const {
        roleNom,        // ← géré par useChangeUserRole
        email,          // ← email immuable
        motDePasse,     // ← géré par resetPassword
        confirmation,   // ← inutile
        ...rest
      } = payload;

      const response = await api.put(`/admin/users/${id}`, rest);
      return normalizeUser(extractItem<any>(response));
    },
    onSuccess: (data) => {
      toast.success('Utilisateur mis à jour');
      // ⭐ Mise à jour optimiste du cache détail
      qc.setQueryData(userKeys.detail(id), data);
      qc.invalidateQueries({ queryKey: userKeys.lists() });
      qc.invalidateQueries({ queryKey: userKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/**
 * ⭐⭐ Changement de rôle via l'endpoint DÉDIÉ
 * PUT /admin/users/:id/role
 */
export function useChangeUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      roleNom,
    }: {
      userId: string;
      roleNom: RoleNom;
    }) => {
      const response = await api.put(`/admin/users/${userId}/role`, {
        roleNom,
      });
      return normalizeUser(extractItem<any>(response));
    },
    onSuccess: (data, vars) => {
      toast.success(`Rôle changé avec succès`);
      // ⭐ Mise à jour IMMÉDIATE du cache détail
      qc.setQueryData(userKeys.detail(vars.userId), data);
      // ⭐ Invalider toutes les listes (avec refetch)
      qc.invalidateQueries({
        queryKey: userKeys.lists(),
        refetchType: 'active',
      });
      qc.invalidateQueries({ queryKey: userKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useToggleUserActif() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      actif,
    }: {
      id: string;
      actif: boolean;
    }) => {
      const response = await api.put(`/admin/users/${id}/actif`, { actif });
      return normalizeUser(extractItem<any>(response));
    },
    onSuccess: (data, vars) => {
      toast.success(
        vars.actif ? 'Utilisateur activé' : 'Utilisateur désactivé',
      );
      // ⭐ Mise à jour immédiate du cache détail
      qc.setQueryData(userKeys.detail(vars.id), data);
      qc.invalidateQueries({ queryKey: userKeys.lists() });
      qc.invalidateQueries({ queryKey: userKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/users/${id}`);
    },
    onSuccess: (_, id) => {
      toast.success('Utilisateur supprimé');
      // ⭐ Retirer du cache détail
      qc.removeQueries({ queryKey: userKeys.detail(id) });
      qc.invalidateQueries({ queryKey: userKeys.lists() });
      qc.invalidateQueries({ queryKey: userKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useBulkDeleteUsers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      // ⭐ Essayer l'endpoint bulk, sinon faire des appels individuels
      try {
        await api.post('/admin/users/bulk-delete', { ids });
      } catch {
        // Fallback : appels individuels
        await Promise.all(ids.map((id) => api.delete(`/admin/users/${id}`)));
      }
    },
    onSuccess: (_, ids) => {
      toast.success(`${ids.length} utilisateur(s) supprimé(s)`);
      ids.forEach((id) => qc.removeQueries({ queryKey: userKeys.detail(id) }));
      qc.invalidateQueries({ queryKey: userKeys.lists() });
      qc.invalidateQueries({ queryKey: userKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUploadUserAvatar(userId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('photo', file);
      const response = await api.post(`/admin/users/${userId}/avatar`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return (
        response.data?.data?.photoUrl ?? response.data?.photoUrl
      ) as string;
    },
    onSuccess: () => {
      toast.success('Photo mise à jour');
      qc.invalidateQueries({ queryKey: userKeys.detail(userId) });
      qc.invalidateQueries({ queryKey: userKeys.lists() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/**
 * ⭐ NOUVEAU : Reset mot de passe (admin)
 * POST /admin/users/:id/reset-password
 */
export function useResetUserPassword(userId: string) {
  return useMutation({
    mutationFn: async (nouveauMotDePasse: string) => {
      const response = await api.post(
        `/admin/users/${userId}/reset-password`,
        { nouveauMotDePasse },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success('Mot de passe réinitialisé');
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/**
 * ⭐ Hook composé : actions fréquentes sur un utilisateur
 */
export function useUserActions(userId?: string) {
  const changeRole = useChangeUserRole();
  const toggleActif = useToggleUserActif();
  const deleteUser = useDeleteUser();
  const updateUser = useUpdateUser(userId ?? '');

  return {
    changeRole,
    toggleActif,
    deleteUser,
    updateUser,
    isLoading:
      changeRole.isPending ||
      toggleActif.isPending ||
      deleteUser.isPending ||
      updateUser.isPending,
  };
}