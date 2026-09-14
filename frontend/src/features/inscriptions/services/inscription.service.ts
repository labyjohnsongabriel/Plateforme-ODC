import { inscriptionApi } from '@/services/inscription.api';
import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints.ts';
import type {
    Inscription,
    InscriptionFilters,
    CreateInscriptionPayload,
    SelectionnerPayload,
    SelectionMassePayload,
    SelectionStats,
    StatutInscription,
} from '../types/inscription.types';
import type { PaginatedResponse } from '@/types/common.types';

export class InscriptionService {
    static async list(filters?: InscriptionFilters): Promise<PaginatedResponse<Inscription>> {
        return inscriptionApi.list(filters);
    }

    static async getById(id: string): Promise<Inscription> {
        return inscriptionApi.getById(id);
    }

    static async create(payload: CreateInscriptionPayload): Promise<Inscription> {
        return inscriptionApi.create(payload);
    }

    static async annuler(id: string): Promise<void> {
        return inscriptionApi.annuler(id);
    }

    static async selectionner(
        id: string,
        payload: SelectionnerPayload
    ): Promise<Inscription> {
        return inscriptionApi.selectionner(id, payload);
    }

    /**
     * Sélection en masse
     */
    static async selectionnerMasse(
        sessionId: string,
        payload: SelectionMassePayload
    ): Promise<any> {
        const { data } = await api.post(
            ENDPOINTS.SELECTIONS.SELECTIONNER(sessionId),
            payload
        );
        return data.data;
    }

    /**
     * Statistiques de sélection
     */
    static async getStats(sessionId: string): Promise<SelectionStats> {
        const { data } = await api.get(ENDPOINTS.SELECTIONS.STATS(sessionId));
        return data.data;
    }

    /**
     * Sélection automatique
     */
    static async selectionAutomatique(sessionId: string): Promise<any> {
        const { data } = await api.post(ENDPOINTS.SELECTIONS.SELECTION_AUTO(sessionId));
        return data.data;
    }

    /**
     * Reset sélections
     */
    static async resetSelections(sessionId: string): Promise<any> {
        const { data } = await api.delete(ENDPOINTS.SELECTIONS.RESET(sessionId));
        return data.data;
    }

    /**
     * Label du statut
     */
    static getStatutLabel(statut: StatutInscription): string {
        const labels: Record<StatutInscription, string> = {
            EN_ATTENTE: 'En attente',
            ACCEPTEE: 'Acceptée',
            REFUSEE: 'Refusée',
            LISTE_ATTENTE: "Liste d'attente",
            ANNULEE: 'Annulée',
        };
        return labels[statut];
    }

    /**
     * Variant du badge
     */
    static getStatutVariant(statut: StatutInscription): 'warning' | 'success' | 'error' | 'info' | 'neutral' {
        const map: Record<StatutInscription, 'warning' | 'success' | 'error' | 'info' | 'neutral'> = {
            EN_ATTENTE: 'warning',
            ACCEPTEE: 'success',
            REFUSEE: 'error',
            LISTE_ATTENTE: 'info',
            ANNULEE: 'neutral',
        };
        return map[statut] || 'neutral';
    }

    /**
     * Export CSV
     */
    static exportToCsv(inscriptions: Inscription[], filename = 'inscriptions'): void {
        const headers = ['Nom', 'Prénom', 'Email', 'Formation', 'Date', 'Statut', 'Motivation'];
        const rows = inscriptions.map((i) => [
            i.participant?.nom || '',
            i.participant?.prenom || '',
            i.participant?.email || '',
            i.session?.formation?.titre || '',
            new Date(i.dateInscription).toLocaleDateString('fr-FR'),
            this.getStatutLabel(i.statut),
            i.motivation || '',
        ]);

        const csv = [headers, ...rows].map((r) => r.join(';')).join('\n');
        const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}-${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
    }
}