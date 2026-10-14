// src/app/(admin)/admin/audit-logs/hooks/useAuditLogs.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

/* ============================================================================
   TYPES
   ============================================================================ */

export type SeveriteAudit = 'INFO' | 'WARNING' | 'CRITICAL';

export interface AuditLog {
  id: string;
  action: string;
  entite?: string;
  entiteId?: string;
  userId?: string;
  user?: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
  };
  severite: SeveriteAudit;
  ipAddress?: string;
  userAgent?: string;
  methode?: string;
  url?: string;
  payload?: Record<string, any>;
  changes?: Record<string, any>;
  createdAt: string;
}

export interface AuditLogsStats {
  total: number;
  today: number;
  thisWeek: number;
  criticals: number;
  parAction: Array<{ action: string; count: number }>;
  parEntite: Array<{ entite: string; count: number }>;
}

export interface AuditLogFilters {
  action?: string;
  entite?: string;
  userId?: string;
  severite?: 'all' | SeveriteAudit;
  dateDebut?: string;
  dateFin?: string;
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
      limit: 20,
      total: 0,
      totalPages: 1,
    }
  );
}

/**
 * Détecte automatiquement la sévérité d'un log selon l'action.
 */
function detectSeverite(action: string): SeveriteAudit {
  const upper = action?.toUpperCase() ?? '';
  if (
    upper.includes('DELETE') ||
    upper.includes('REMOVE') ||
    upper.includes('REVOKE') ||
    upper.includes('BAN')
  ) {
    return 'CRITICAL';
  }
  if (
    upper.includes('UPDATE') ||
    upper.includes('EDIT') ||
    upper.includes('PATCH') ||
    upper.includes('SUSPEND')
  ) {
    return 'WARNING';
  }
  return 'INFO';
}

function normalizeLog(raw: any): AuditLog {
  return {
    id: String(raw?.id ?? raw?._id ?? ''),
    action: raw?.action ?? '',
    entite: raw?.entite ?? raw?.entity ?? undefined,
    entiteId: raw?.entiteId ?? raw?.entityId ?? undefined,
    userId: raw?.userId ?? undefined,
    user: raw?.user
      ? {
          id: String(raw.user.id ?? ''),
          nom: raw.user.nom ?? '',
          prenom: raw.user.prenom ?? '',
          email: raw.user.email ?? '',
        }
      : undefined,
    severite: raw?.severite ?? detectSeverite(raw?.action),
    ipAddress: raw?.ipAddress ?? raw?.ip ?? undefined,
    userAgent: raw?.userAgent ?? undefined,
    methode: raw?.methode ?? raw?.method ?? undefined,
    url: raw?.url ?? undefined,
    payload: raw?.payload ?? undefined,
    changes: raw?.changes ?? undefined,
    createdAt: raw?.createdAt ?? new Date().toISOString(),
  };
}

function cleanFilters(filters?: AuditLogFilters): Record<string, any> {
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

export const auditLogKeys = {
  all: ['admin', 'audit-logs'] as const,
  lists: () => [...auditLogKeys.all, 'list'] as const,
  list: (filters?: AuditLogFilters) =>
    [...auditLogKeys.lists(), filters] as const,
  detail: (id: string) => [...auditLogKeys.all, 'detail', id] as const,
  stats: () => [...auditLogKeys.all, 'stats'] as const,
};

/* ============================================================================
   QUERIES
   ============================================================================ */

export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: auditLogKeys.list(filters),
    queryFn: async () => {
      const params = cleanFilters(filters);
      const response = await api.get('/admin/audit-logs', { params });
      return {
        data: extractList<any>(response).map(normalizeLog),
        pagination: extractPagination(response),
      };
    },
    staleTime: 30_000,
    retry: 1,
  });
}

export function useAuditLog(id: string | undefined) {
  return useQuery({
    queryKey: auditLogKeys.detail(id ?? ''),
    queryFn: async (): Promise<AuditLog> => {
      const response = await api.get(`/admin/audit-logs/${id}`);
      return normalizeLog(extractItem<any>(response));
    },
    enabled: !!id,
  });
}

export function useAuditLogsStats() {
  return useQuery({
    queryKey: auditLogKeys.stats(),
    queryFn: async (): Promise<AuditLogsStats> => {
      try {
        const response = await api.get('/admin/audit-logs/stats');
        const raw = extractItem<any>(response) ?? {};
        return {
          total: Number(raw?.total ?? 0),
          today: Number(raw?.today ?? 0),
          thisWeek: Number(raw?.thisWeek ?? 0),
          criticals: Number(raw?.criticals ?? 0),
          parAction: Array.isArray(raw?.parAction) ? raw.parAction : [],
          parEntite: Array.isArray(raw?.parEntite) ? raw.parEntite : [],
        };
      } catch {
        // Fallback silencieux
        return {
          total: 0,
          today: 0,
          thisWeek: 0,
          criticals: 0,
          parAction: [],
          parEntite: [],
        };
      }
    },
    staleTime: 60_000,
    retry: 0,
  });
}