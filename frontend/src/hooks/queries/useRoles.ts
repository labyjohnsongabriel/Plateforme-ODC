// src/hooks/queries/useRoles.ts
'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';
import { getErrorMessage } from '@/lib/error-handler';
import type {
  Role,
  RoleName,
  Permission,
} from '@/types/role.types';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface RoleFilters {
  search?: string;
  actif?: boolean;
  estSysteme?: boolean;
  page?: number;
  limit?: number;
}

export interface RoleCreateInput {
  nom: RoleName | string;
  libelle: string;
  description?: string;
  niveauHierarchie?: number;
  couleur?: string;
  icone?: string;
  actif?: boolean;
  permissionIds?: string[];
}

export interface RoleUpdateInput extends Partial<RoleCreateInput> {
  id?: string;
}

export interface PaginatedRoles {
  data: Role[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/* ============================================================================
   QUERIES — LECTURE
   ============================================================================ */

/**
 * Liste complète des rôles (sans pagination).
 */
export function useRoles(
  options?: Omit<UseQueryOptions<Role[]>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: queryKeys.roles.list,
    queryFn: async () => {
      const { data } = await api.get<{ data: Role[] }>('/roles');
      return data.data;
    },
    staleTime: 10 * 60_000,
    ...options,
  });
}

/**
 * Liste paginée avec filtres (back-office).
 */
export function useRolesPaginated(filters?: RoleFilters) {
  return useQuery({
    queryKey: queryKeys.roles.paginated(filters),
    queryFn: async () => {
      const { data } = await api.get<{ data: PaginatedRoles }>(
        '/roles',
        { params: filters },
      );
      return data.data;
    },
    staleTime: 5 * 60_000,
  });
}

/**
 * Détail d'un rôle par son ID.
 */
export function useRole(
  id: string,
  options?: Omit<UseQueryOptions<Role>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey: queryKeys.roles.detail(id),
    queryFn: async () => {
      const { data } = await api.get<{ data: Role }>(`/roles/${id}`);
      return data.data;
    },
    enabled: !!id,
    staleTime: 5 * 60_000,
    ...options,
  });
}

/**
 * Détail d'un rôle par son nom (ADMINISTRATEUR, etc.).
 */
export function useRoleByName(nom: RoleName | string) {
  return useQuery({
    queryKey: queryKeys.roles.byName(nom),
    queryFn: async () => {
      const { data } = await api.get<{ data: Role }>(`/roles/name/${nom}`);
      return data.data;
    },
    enabled: !!nom,
    staleTime: 10 * 60_000,
  });
}

/**
 * Liste des permissions disponibles (pour l'édition d'un rôle).
 */
export function usePermissions() {
  return useQuery({
    queryKey: queryKeys.permissions.list,
    queryFn: async () => {
      const { data } = await api.get<{ data: Permission[] }>('/permissions');
      return data.data;
    },
    staleTime: 15 * 60_000,
  });
}

/**
 * Permissions groupées par catégorie.
 */
export function usePermissionsByCategory() {
  return useQuery({
    queryKey: queryKeys.permissions.byCategory,
    queryFn: async () => {
      const { data } = await api.get<{
        data: Record<string, Permission[]>;
      }>('/permissions/by-category');
      return data.data;
    },
    staleTime: 15 * 60_000,
  });
}

/**
 * Statistiques par rôle (nb users, nb permissions).
 */
export function useRolesStats() {
  return useQuery({
    queryKey: queryKeys.roles.stats,
    queryFn: async () => {
      const { data } = await api.get('/roles/stats');
      return data.data as Array<{
        nom: RoleName;
        libelle: string;
        nbUtilisateurs: number;
        nbPermissions: number;
      }>;
    },
    staleTime: 5 * 60_000,
  });
}

/* ============================================================================
   MUTATIONS — ÉCRITURE
   ============================================================================ */

/**
 * Créer un nouveau rôle.
 */
export function useCreateRole(
  options?: UseMutationOptions<Role, Error, RoleCreateInput>,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: RoleCreateInput) => {
      const { data } = await api.post<{ data: Role }>('/roles', input);
      return data.data;
    },
    onSuccess: (role) => {
      toast.success(`Rôle "${role.libelle}" créé`);
      qc.invalidateQueries({ queryKey: queryKeys.roles.all });
      qc.setQueryData(queryKeys.roles.detail(role.id), role);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
    ...options,
  });
}

/**
 * Mettre à jour un rôle.
 */
export function useUpdateRole(
  options?: UseMutationOptions<
    Role,
    Error,
    { id: string; input: RoleUpdateInput }
  >,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input }) => {
      const { data } = await api.put<{ data: Role }>(`/roles/${id}`, input);
      return data.data;
    },
    onSuccess: (role) => {
      toast.success(`Rôle "${role.libelle}" mis à jour`);
      qc.invalidateQueries({ queryKey: queryKeys.roles.all });
      qc.setQueryData(queryKeys.roles.detail(role.id), role);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
    ...options,
  });
}

/**
 * Supprimer un rôle.
 */
export function useDeleteRole(
  options?: UseMutationOptions<void, Error, string>,
) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/roles/${id}`);
    },
    onSuccess: () => {
      toast.success('Rôle supprimé');
      qc.invalidateQueries({ queryKey: queryKeys.roles.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
    ...options,
  });
}

/**
 * Activer / désactiver un rôle.
 */
export function useToggleRoleActif() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, actif }: { id: string; actif: boolean }) => {
      const { data } = await api.put(`/roles/${id}/actif`, { actif });
      return data.data;
    },
    onSuccess: (_, { actif }) => {
      toast.success(actif ? 'Rôle activé' : 'Rôle désactivé');
      qc.invalidateQueries({ queryKey: queryKeys.roles.all });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/**
 * Assigner des permissions à un rôle.
 */
export function useAssignPermissions() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      permissionIds,
    }: {
      roleId: string;
      permissionIds: string[];
    }) => {
      const { data } = await api.put(`/roles/${roleId}/permissions`, {
        permissionIds,
      });
      return data.data;
    },
    onSuccess: (_, { roleId }) => {
      toast.success('Permissions mises à jour');
      qc.invalidateQueries({ queryKey: queryKeys.roles.all });
      qc.invalidateQueries({ queryKey: queryKeys.roles.detail(roleId) });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/**
 * Ajouter une permission à un rôle.
 */
export function useAddPermissionToRole() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      permissionId,
    }: {
      roleId: string;
      permissionId: string;
    }) => {
      const { data } = await api.post(`/roles/${roleId}/permissions`, {
        permissionId,
      });
      return data.data;
    },
    onSuccess: (_, { roleId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.roles.detail(roleId) });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/**
 * Retirer une permission d'un rôle.
 */
export function useRemovePermissionFromRole() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      roleId,
      permissionId,
    }: {
      roleId: string;
      permissionId: string;
    }) => {
      await api.delete(`/roles/${roleId}/permissions/${permissionId}`);
    },
    onSuccess: (_, { roleId }) => {
      qc.invalidateQueries({ queryKey: queryKeys.roles.detail(roleId) });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

/* ============================================================================
   HELPERS
   ============================================================================ */

/**
 * Récupère un rôle par son nom depuis le cache (sans appel réseau).
 */
export function useCachedRole(nom: RoleName | string): Role | undefined {
  const { data } = useRoles();
  return data?.find((r) => r.nom === nom);
}

/**
 * Liste simple `{ value, label }` pour les selects.
 */
export function useRoleOptions() {
  const { data, isLoading } = useRoles();

  return {
    isLoading,
    options:
      data?.map((role) => ({
        value: role.id,
        label: role.libelle,
        nom: role.nom,
        couleur: role.couleur ?? undefined,
      })) ?? [],
  };
}