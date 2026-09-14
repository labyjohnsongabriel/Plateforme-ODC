import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints.ts';
import type { PaginatedResponse } from '@/types/common.types';

// ============================================================================
//  TYPES
// ============================================================================

export interface Partenaire {
    id: string;
    nom: string;
    secteur?: string;
    description?: string;
    contactNom?: string;
    contactEmail?: string;
    contactTel?: string;
    siteWeb?: string;
    logoUrl?: string;
    adresse?: string;
    ville?: string;
    pays?: string;
    actif: boolean;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePartenairePayload {
    nom: string;
    secteur?: string;
    description?: string;
    contactNom?: string;
    contactEmail?: string;
    contactTel?: string;
    siteWeb?: string;
    logoUrl?: string;
    adresse?: string;
    ville?: string;
    pays?: string;
    notes?: string;
}

export interface UpdatePartenairePayload extends Partial<CreatePartenairePayload> {
    actif?: boolean;
}

export interface PartenaireFilters {
    search?: string;
    secteur?: string;
    ville?: string;
    actif?: boolean;
    page?: number;
    limit?: number;
}

// ============================================================================
//  PARTENAIRE SERVICE
// ============================================================================

export class PartenaireService {
    /**
     * Liste des partenaires
     */
    static async list(filters?: PartenaireFilters): Promise<PaginatedResponse<Partenaire>> {
        const { data } = await api.get(ENDPOINTS.PARTENAIRES.BASE, { params: filters });
        return data;
    }

    /**
     * Détail d'un partenaire
     */
    static async getById(id: string): Promise<Partenaire> {
        const { data } = await api.get(ENDPOINTS.PARTENAIRES.BY_ID(id));
        return data.data;
    }

    /**
     * Créer un partenaire
     */
    static async create(payload: CreatePartenairePayload): Promise<Partenaire> {
        const { data } = await api.post(ENDPOINTS.PARTENAIRES.BASE, payload);
        return data.data;
    }

    /**
     * Mettre à jour
     */
    static async update(id: string, payload: UpdatePartenairePayload): Promise<Partenaire> {
        const { data } = await api.put(ENDPOINTS.PARTENAIRES.BY_ID(id), payload);
        return data.data;
    }

    /**
     * Supprimer
     */
    static async delete(id: string): Promise<void> {
        await api.delete(ENDPOINTS.PARTENAIRES.BY_ID(id));
    }

    // ========================================================================
    // HELPERS
    // ========================================================================

    /**
     * Filtrer localement
     */
    static filter(
        partenaires: Partenaire[],
        search: string,
        secteur?: string
    ): Partenaire[] {
        let result = partenaires;

        if (search) {
            const q = search.toLowerCase();
            result = result.filter(
                (p) =>
                    p.nom.toLowerCase().includes(q) ||
                    p.description?.toLowerCase().includes(q) ||
                    p.secteur?.toLowerCase().includes(q)
            );
        }

        if (secteur) {
            result = result.filter((p) => p.secteur === secteur);
        }

        return result;
    }

    /**
     * Extraire les secteurs uniques
     */
    static extractSecteurs(partenaires: Partenaire[]): string[] {
        const secteurs = new Set<string>();
        partenaires.forEach((p) => p.secteur && secteurs.add(p.secteur));
        return Array.from(secteurs).sort();
    }

    /**
     * Obtenir les initiales
     */
    static getInitials(partenaire: Partenaire): string {
        return partenaire.nom
            .split(' ')
            .filter(Boolean)
            .map((w) => w[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }

    /**
     * Liste des secteurs prédéfinis
     */
    static getSecteursPredefinis(): Array<{ value: string; label: string }> {
        return [
            { value: 'Télécommunications', label: 'Télécommunications' },
            { value: 'Éducation', label: 'Éducation' },
            { value: 'Technologie', label: 'Technologie' },
            { value: 'Finance', label: 'Finance' },
            { value: 'Santé', label: 'Santé' },
            { value: 'ONG', label: 'ONG' },
            { value: 'Gouvernement', label: 'Gouvernement' },
            { value: 'Industrie', label: 'Industrie' },
            { value: 'Commerce', label: 'Commerce' },
            { value: 'Autre', label: 'Autre' },
        ];
    }
}