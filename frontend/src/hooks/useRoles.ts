// src/app/(admin)/admin/roles/hooks/useRoles.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface Permission {
  id: string;
  code: string;
  libelle: string;
  categorie?: string;
  description?: string;
}

export interface Role {
  id: string;
  nom: string;
  libelle: string;
  description?: string;
  niveauHierarchie: number;
  couleur: string;
  estSysteme: boolean;
  permissions: Permission[];
  usersCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface RolesStats {
  total: number;
  systemes: number;
  personnalises: number;
  totalUtilisateurs: number;
  totalPermissions: number;
}

export interface RoleFormValues {
  nom: string;
  libelle: string;
  description?: string;
  niveauHierarchie: number;
  couleur: string;
  permissionCodes: string[];
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

function normalizeRole(raw: any): Role {
  return {
    id: String(raw?.id ?? raw?._id ?? ''),
    nom: raw?.nom ?? '',
    libelle: raw?.libelle ?? raw?.label ?? '',
    description: raw?.description ?? '',
    niveauHierarchie: Number(raw?.niveauHierarchie ?? raw?.niveau ?? 0),
    couleur: raw?.couleur ?? raw?.color ?? '#FF7900',
    estSysteme: raw?.estSysteme ?? raw?.isSystem ?? false,
    permissions: Array.isArray(raw?.permissions)
      ? raw.permissions.map((p: any) => ({
          id: String(p.id ?? p._id ?? ''),
          code: p.code ?? '',
          libelle: p.libelle ?? p.label ?? '',
          categorie: p.categorie ?? undefined,
          description: p.description ?? '',
        }))
      : [],
    usersCount: Number(
      raw?.usersCount ?? raw?.users?.length ?? raw?._count?.users ?? 0,
    ),
    createdAt: raw?.createdAt ?? new Date().toISOString(),
    updatedAt: raw?.updatedAt ?? new Date().toISOString(),
  };
}

/* ============================================================================
   CLÉS
   ============================================================================ */

export const roleKeys = {
  all: ['admin', 'roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
  stats: () => [...roleKeys.all, 'stats'] as const,
  permissions: () => [...roleKeys.all, 'permissions'] as const,
};

/* ============================================================================
   QUERIES
   ============================================================================ */

export function useRoles() {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: async (): Promise<Role[]> => {
      const response = await api.get('/admin/roles');
      return extractList<any>(response).map(normalizeRole);
    },
    staleTime: 30_000,
    retry: 1,
  });
}

export function useRole(id: string | undefined) {
  return useQuery({
    queryKey: roleKeys.detail(id ?? ''),
    queryFn: async (): Promise<Role> => {
      const response = await api.get(`/admin/roles/${id}`);
      return normalizeRole(extractItem<any>(response));
    },
    enabled: !!id,
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: roleKeys.permissions(),
    queryFn: async (): Promise<Permission[]> => {
      try {
        const response = await api.get('/admin/roles/permissions');
        return extractList<any>(response);
      } catch {
        return [];
      }
    },
    staleTime: 10 * 60_000,
    retry: 0,
  });
}

export function useRolesStats() {
  return useQuery({
    queryKey: roleKeys.stats(),
    queryFn: async (): Promise<RolesStats> => {
      try {
        const response = await api.get('/admin/roles/stats');
        const raw = extractItem<any>(response) ?? {};
        return {
          total: Number(raw?.total ?? 0),
          systemes: Number(raw?.systemes ?? 0),
          personnalises: Number(raw?.personnalises ?? 0),
          totalUtilisateurs: Number(raw?.totalUtilisateurs ?? 0),
          totalPermissions: Number(raw?.totalPermissions ?? 0),
        };
      } catch {
        // Fallback silencieux
        try {
          const response = await api.get('/admin/roles');
          const list = extractList<any>(response).map(normalizeRole);
          return {
            total: list.length,
            systemes: list.filter((r) => r.estSysteme).length,
            personnalises: list.filter((r) => !r.estSysteme).length,
            totalUtilisateurs: list.reduce((s, r) => s + r.usersCount, 0),
            totalPermissions: list.reduce((s, r) => s + r.permissions.length, 0),
          };
        } catch {
          return {
            total: 0,
            systemes: 0,
            personnalises: 0,
            totalUtilisateurs: 0,
            totalPermissions: 0,
          };
        }
      }
    },
    staleTime: 60_000,
    retry: 0,
  });
}

/* ============================================================================
   MUTATIONS
   ============================================================================ */

export function useCreateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: RoleFormValues) => {
      const response = await api.post('/admin/roles', payload);
      return normalizeRole(extractItem<any>(response));
    },
    onSuccess: () => {
      toast.success('Rôle créé avec succès');
      qc.invalidateQueries({ queryKey: roleKeys.lists() });
      qc.invalidateQueries({ queryKey: roleKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateRole(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<RoleFormValues>) => {
      const response = await api.put(`/admin/roles/${id}`, payload);
      return normalizeRole(extractItem<any>(response));
    },
    onSuccess: () => {
      toast.success('Rôle mis à jour');
      qc.invalidateQueries({ queryKey: roleKeys.lists() });
      qc.invalidateQueries({ queryKey: roleKeys.detail(id) });
      qc.invalidateQueries({ queryKey: roleKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/roles/${id}`);
    },
    onSuccess: () => {
      toast.success('Rôle supprimé');
      qc.invalidateQueries({ queryKey: roleKeys.lists() });
      qc.invalidateQueries({ queryKey: roleKeys.stats() });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}