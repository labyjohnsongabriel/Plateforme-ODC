import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { PresenceService } from '../services/presence.service';
import type {
  Presence,
  PresenceStats,
  ParticipantAttendance,
  MarquerManuelPayload,
} from '../types/presence.types';

// ============================================================================
//  HOOK PRINCIPAL
// ============================================================================

export function usePresences(sessionId?: string) {
  const [presences, setPresences] = useState<Presence[]>([]);
  const [stats, setStats] = useState<PresenceStats | null>(null);
  const [attendances, setAttendances] = useState<ParticipantAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========================================================================
  // Charger les données
  // ========================================================================
  const load = useCallback(async () => {
    if (!sessionId) {
      setPresences([]);
      setStats(null);
      setAttendances([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [listResponse, statsData, attendanceData] = await Promise.all([
        PresenceService.listBySession(sessionId, { limit: 500 }),
        PresenceService.getStats(sessionId).catch(() => null),
        PresenceService.getParticipantAttendances(sessionId).catch(() => []),
      ]);

      setPresences(listResponse.data);
      setStats(statsData);
      setAttendances(attendanceData);
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur de chargement';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    load();
  }, [load]);

  // ========================================================================
  // Marquer manuellement
  // ========================================================================
  const marquerManuel = async (payload: MarquerManuelPayload): Promise<boolean> => {
    try {
      await PresenceService.marquerManuel(payload);
      toast.success(payload.present ? 'Présence validée ✓' : 'Absence marquée');
      load();
      return true;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Erreur';
      toast.error(message);
      return false;
    }
  };

  // ========================================================================
  // Statistiques recalculées localement
  // ========================================================================
  const localStats: PresenceStats = {
    total: presences.length,
    presents: presences.filter((p) => p.present).length,
    absents: presences.filter((p) => !p.present).length,
    retards: 0,
    excuses: presences.filter((p) => p.justifiee).length,
    tauxPresence:
      presences.length > 0
        ? Math.round((presences.filter((p) => p.present).length / presences.length) * 100)
        : 0,
    tauxAbsence:
      presences.length > 0
        ? Math.round((presences.filter((p) => !p.present).length / presences.length) * 100)
        : 0,
  };

  // ========================================================================
  // Filtrer par participant
  // ========================================================================
  const getByParticipant = (participantId: string): Presence[] => {
    return presences.filter((p) => p.participantId === participantId);
  };

  return {
    presences,
    stats: stats || localStats,
    attendances,
    loading,
    error,
    refetch: load,
    marquerManuel,
    getByParticipant,
  };
}