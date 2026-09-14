import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints.ts';
import type {
    Presence,
    PresenceStats,
    GenerateQrPayload,
    GeneratedQrCode,
    ScanQrPayload,
    MarquerManuelPayload,
    TauxPresence,
    PresenceFilters,
    ParticipantAttendance,
} from '../types/presence.types';
import type { PaginatedResponse } from '@/types/common.types';

// ============================================================================
//  PRESENCE SERVICE — Logique métier
// ============================================================================

export class PresenceService {
    /**
     * Liste des présences par session
     */
    static async listBySession(
        sessionId: string,
        filters?: PresenceFilters
    ): Promise<PaginatedResponse<Presence>> {
        const { data } = await api.get(ENDPOINTS.PRESENCES.BY_SESSION(sessionId), {
            params: filters,
        });
        return data;
    }

    /**
     * Scanner un QR Code (participant)
     */
    static async scannerQr(payload: ScanQrPayload): Promise<Presence> {
        const { data } = await api.post(ENDPOINTS.PRESENCES.SCAN, payload);
        return data.data;
    }

    /**
     * Marquer une présence manuellement (formateur/admin)
     */
    static async marquerManuel(payload: MarquerManuelPayload): Promise<Presence> {
        const { data } = await api.post(ENDPOINTS.PRESENCES.MANUEL, payload);
        return data.data;
    }

    /**
     * Calculer le taux de présence d'un participant
     */
    static async calculerTaux(sessionId: string, participantId: string): Promise<TauxPresence> {
        const { data } = await api.get(ENDPOINTS.PRESENCES.TAUX(sessionId, participantId));
        return data.data;
    }

    /**
     * Statistiques de présence d'une session
     */
    static async getStats(sessionId: string): Promise<PresenceStats> {
        const { data } = await api.get(ENDPOINTS.PRESENCES.STATS(sessionId));
        return data.data;
    }

    /**
     * Générer un QR Code pour une session
     */
    static async generateQr(payload: GenerateQrPayload): Promise<GeneratedQrCode> {
        const { data } = await api.post('/presences/qr/generate', payload);
        return data.data;
    }

    /**
     * Liste des participants avec leur taux de présence
     */
    static async getParticipantAttendances(
        sessionId: string
    ): Promise<ParticipantAttendance[]> {
        const response = await this.listBySession(sessionId, { limit: 500 });

        // Grouper par participant
        const grouped = response.data.reduce((acc: any, presence) => {
            const key = presence.participantId;
            if (!acc[key]) {
                acc[key] = {
                    participantId: presence.participantId,
                    participantName: `${presence.participant?.prenom} ${presence.participant?.nom}`,
                    email: presence.participant?.email || '',
                    photoUrl: presence.participant?.photoUrl,
                    totalSessions: 0,
                    presences: 0,
                    absences: 0,
                    tauxPresence: 0,
                };
            }
            acc[key].totalSessions += 1;
            if (presence.present) acc[key].presences += 1;
            else acc[key].absences += 1;
            return acc;
        }, {});

        // Calculer les taux
        return Object.values(grouped).map((p: any) => ({
            ...p,
            tauxPresence:
                p.totalSessions > 0 ? Math.round((p.presences / p.totalSessions) * 100) : 0,
        }));
    }

    /**
     * Exporter les présences en CSV
     */
    static exportToCsv(presences: Presence[], filename = 'presences'): void {
        const headers = ['Date', 'Heure', 'Participant', 'Email', 'Statut', 'Commentaire'];
        const rows = presences.map((p) => [
            new Date(p.datePresence).toLocaleDateString('fr-FR'),
            p.heureScan || '-',
            `${p.participant?.prenom} ${p.participant?.nom}`,
            p.participant?.email || '-',
            p.present ? 'Présent' : 'Absent',
            p.commentaire || '-',
        ]);

        const csv = [headers, ...rows].map((row) => row.join(';')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}-${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    }

    /**
     * Formater la date d'une présence
     */
    static formatPresenceDate(date: string): string {
        return new Date(date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }

    /**
     * Obtenir la couleur d'un statut
     */
    static getStatutColor(present: boolean): string {
        return present ? 'text-odc-success' : 'text-odc-error';
    }
}