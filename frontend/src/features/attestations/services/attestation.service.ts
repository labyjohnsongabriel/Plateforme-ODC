import api from '@/services/api';
import { ENDPOINTS } from '@/services/endpoints';
import type {
  Attestation,
  AttestationVerification,
  EligibleVerification,
  GenerateAttestationPayload,
  GenerateBatchResult,
  AttestationFilters,
  AttestationStats,
} from '../types/attestation.types';
import type { PaginatedResponse } from '@/types/common.types';

// ============================================================================
//  ATTESTATION SERVICE
// ============================================================================

export class AttestationService {
  /**
   * Mes attestations (participant connecté)
   */
  static async mesAttestations(): Promise<Attestation[]> {
    const { data } = await api.get(ENDPOINTS.ATTESTATIONS.MES_ATTESTATIONS);
    return data.data;
  }

  /**
   * Liste des attestations (admin/staff)
   */
  static async list(filters?: AttestationFilters): Promise<PaginatedResponse<Attestation>> {
    const { data } = await api.get(ENDPOINTS.ATTESTATIONS.BASE, { params: filters });
    return data;
  }

  /**
   * Détail d'une attestation
   */
  static async getById(id: string): Promise<Attestation> {
    const { data } = await api.get(`/attestations/${id}`);
    return data.data;
  }

  /**
   * Générer une attestation
   */
  static async generer(payload: GenerateAttestationPayload): Promise<Attestation> {
    const { data } = await api.post(ENDPOINTS.ATTESTATIONS.GENERER, payload);
    return data.data;
  }

  /**
   * Générer toutes les attestations d'une session
   */
  static async genererParSession(sessionId: string): Promise<GenerateBatchResult> {
    const { data } = await api.post(ENDPOINTS.ATTESTATIONS.GENERER_SESSION(sessionId));
    return data.data;
  }

  /**
   * Vérifier l'authenticité d'une attestation (public)
   */
  static async verify(numero: string): Promise<AttestationVerification> {
    const { data } = await api.get(ENDPOINTS.ATTESTATIONS.VERIFY(numero));
    return data.data;
  }

  /**
   * Vérifier l'éligibilité d'un participant
   */
  static async eligibilite(
    sessionId: string,
    participantId: string
  ): Promise<EligibleVerification> {
    const { data } = await api.get(
      ENDPOINTS.ATTESTATIONS.ELIGIBILITE(sessionId, participantId)
    );
    return data.data;
  }

  /**
   * Statistiques globales
   */
  static async stats(): Promise<AttestationStats> {
    const { data } = await api.get(ENDPOINTS.ATTESTATIONS.STATS);
    return data.data;
  }

  /**
   * Télécharger le PDF
   */
  static async downloadPdf(attestationId: string, numero: string): Promise<void> {
    const response = await api.get(`/attestations/${attestationId}/pdf`, {
      responseType: 'blob',
    });

    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Attestation-${numero}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Vérifier l'authenticité via QR code (scan)
   */
  static extractNumeroFromQr(qrData: string): string | null {
    // Format possible : URL (https://odc.mg/verify/ODC-2026-WEB-A1B2C3) ou numéro direct
    try {
      // Si c'est une URL
      if (qrData.startsWith('http')) {
        const url = new URL(qrData);
        const path = url.pathname;
        const numero = path.split('/').pop();
        return numero || null;
      }

      // Sinon, c'est peut-être directement le numéro
      if (/^ODC-\d{4}-[A-Z]{3}-[A-F0-9]{6}$/.test(qrData)) {
        return qrData;
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Formater la date d'émission
   */
  static formatEmissionDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  /**
   * Vérifier si une attestation est expirée
   */
  static isExpired(attestation: Attestation): boolean {
    // Les attestations ODC n'expirent pas, toujours valides si valide=true
    return !attestation.valide;
  }

  /**
   * Générer un lien de partage
   */
  static getShareUrl(numero: string): string {
    return `${window.location.origin}/verify/${numero}`;
  }

  /**
   * Copier le lien de vérification
   */
  static async copyShareUrl(numero: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(this.getShareUrl(numero));
      return true;
    } catch {
      return false;
    }
  }
}