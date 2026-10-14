// src/services/attestation.service.ts
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { attestationRepository } from '../repositories/attestation.repository';
import { Attestation } from '../entities/Attestation.entity';
import { AppDataSource } from '../config/database';
import { Inscription } from '../entities/Inscription.entity';
import { Presence } from '../entities/Presence.entity';
import { Note } from '../entities/Note.entity';
import { Session } from '../entities/Session.entity';
import { User } from '../entities/User.entity';
import {
  NotFoundError,
  BadRequestError,
  ConflictError,
} from '../errors/AppError';

/* ============================================================================
   TYPES
   ============================================================================ */

export interface EligibilityCriteria {
  presenceMin: number;
  noteMin: number;
  selectionValidee: boolean;
  inscriptionValidee: boolean;
}

const DEFAULT_CRITERIA: EligibilityCriteria = {
  presenceMin: 75,
  noteMin: 10,
  selectionValidee: true,
  inscriptionValidee: true,
};

/* ============================================================================
   SERVICE
   ============================================================================ */

export class AttestationService {
  /* ==========================================================================
     FIND ALL
     ========================================================================== */
  static async findAll(query: any) {
    return attestationRepository.search({
      page: query.page,
      limit: query.limit,
      sessionId: query.sessionId,
      participantId: query.participantId,
      formationId: query.formationId,
      valide: query.valide,
      search: query.search,
      dateDebut: query.dateDebut,
      dateFin: query.dateFin,
    });
  }

  /* ==========================================================================
     FIND ONE
     ========================================================================== */
  static async findOne(id: string): Promise<Attestation> {
    const attestation = await attestationRepository.findByIdWithRelations(id);
    if (!attestation) {
      throw new NotFoundError('Attestation introuvable');
    }
    return attestation;
  }

  /* ==========================================================================
     STATS
     ========================================================================== */
  static async getStats() {
    const [total, valides, invalides, ceMois] = await Promise.all([
      attestationRepository.count(),
      attestationRepository.countValid(),
      attestationRepository.countInvalid(),
      attestationRepository.countThisMonth(),
    ]);

    return { total, valides, invalides, ceMois };
  }

  /* ==========================================================================
     VÉRIFICATION PUBLIQUE (QR CODE)
     ========================================================================== */
  static async verifierAuthenticite(numero: string) {
    const attestation = await attestationRepository.findByNumero(numero);

    if (!attestation) {
      return { valide: false, attestation: null };
    }

    return {
      valide: attestation.valide,
      attestation: this.serialize(attestation),
    };
  }

  /* ==========================================================================
     MES ATTESTATIONS (participant connecté)
     ========================================================================== */
  static async mesAttestations(userId: string): Promise<Attestation[]> {
    return attestationRepository.findByParticipant(userId);
  }

  /* ==========================================================================
     ⭐ VÉRIFIER ÉLIGIBILITÉ
     ========================================================================== */
  static async verifierEligibilite(
    sessionId: string,
    participantId: string,
    criteria: EligibilityCriteria = DEFAULT_CRITERIA,
  ) {
    const raisons: string[] = [];

    /* -------------------- Session -------------------- */
    const session = await AppDataSource.getRepository(Session).findOne({
      where: { id: sessionId },
      relations: ['formation'],
    });
    if (!session) throw new NotFoundError('Session introuvable');

    /* -------------------- Inscription -------------------- */
    const inscription = await AppDataSource.getRepository(Inscription).findOne({
      where: { sessionId, participantId },
    });

    if (!inscription) {
      raisons.push('Aucune inscription trouvée');
    } else if (
      criteria.inscriptionValidee &&
      inscription.statut !== 'VALIDEE'
    ) {
      raisons.push(
        `Inscription non validée (statut : ${inscription.statut})`,
      );
    }

    /* -------------------- Sélection -------------------- */
    if (criteria.selectionValidee && inscription) {
      if (!(inscription as any).estSelectionne) {
        raisons.push('Participant non sélectionné');
      }
    }

    /* -------------------- Présences -------------------- */
    const presences = await AppDataSource.getRepository(Presence).find({
      where: { sessionId, participantId },
    });

    const totalPresences = presences.length;
    const presencesPresentes = presences.filter((p) => p.estPresent).length;
    const tauxPresence =
      totalPresences > 0
        ? Math.round((presencesPresentes / totalPresences) * 100)
        : 0;

    if (tauxPresence < criteria.presenceMin) {
      raisons.push(
        `Taux de présence insuffisant (${tauxPresence}% < ${criteria.presenceMin}%)`,
      );
    }

    /* -------------------- Notes -------------------- */
    const notes = await AppDataSource.getRepository(Note).find({
      where: { sessionId, participantId },
    });

    const noteFinale =
      notes.length > 0
        ? notes.reduce((sum, n) => sum + Number(n.note ?? 0), 0) / notes.length
        : 0;

    if (noteFinale < criteria.noteMin) {
      raisons.push(
        `Note insuffisante (${noteFinale.toFixed(1)}/20 < ${criteria.noteMin}/20)`,
      );
    }

    /* -------------------- Attestation existante -------------------- */
    const existing = await attestationRepository.findBySessionAndParticipant(
      sessionId,
      participantId,
    );

    /* -------------------- Résultat -------------------- */
    return {
      eligible: raisons.length === 0,
      raisons,
      tauxPresence,
      noteFinale: Number(noteFinale.toFixed(2)),
      dejaGeneree: !!existing,
      attestationId: existing?.id,
      session: this.serializeSession(session),
    };
  }

  /* ==========================================================================
     ⭐ APERÇU D'UNE SESSION (avant génération)
     ========================================================================== */
  static async previewSession(
    sessionId: string,
    criteria: EligibilityCriteria = DEFAULT_CRITERIA,
  ) {
    const session = await AppDataSource.getRepository(Session).findOne({
      where: { id: sessionId },
      relations: ['formation'],
    });

    if (!session) throw new NotFoundError('Session introuvable');

    /* -------------------- Inscriptions -------------------- */
    const inscriptions = await AppDataSource.getRepository(Inscription).find({
      where: { sessionId },
      relations: ['participant'],
    });

    /* -------------------- Vérifier chaque participant -------------------- */
    const participants = await Promise.all(
      inscriptions.map(async (inscription) => {
        const result = await this.verifierEligibilite(
          sessionId,
          inscription.participantId,
          criteria,
        );

        return {
          participantId: inscription.participantId,
          participant: {
            id: inscription.participant.id,
            nom: inscription.participant.nom,
            prenom: inscription.participant.prenom,
            email: inscription.participant.email,
            photoUrl: inscription.participant.photoUrl,
          },
          tauxPresence: result.tauxPresence,
          noteFinale: result.noteFinale,
          eligible: result.eligible,
          raisons: result.raisons,
          dejaGeneree: result.dejaGeneree,
          attestationId: result.attestationId,
        };
      }),
    );

    /* -------------------- Statistiques -------------------- */
    const stats = {
      total: participants.length,
      eligibles: participants.filter((p) => p.eligible).length,
      ineligibles: participants.filter((p) => !p.eligible).length,
      dejaGenerees: participants.filter((p) => p.dejaGeneree).length,
    };

    return {
      session: this.serializeSession(session),
      criteres: criteria,
      participants,
      stats,
    };
  }

  /* ==========================================================================
     ⭐ GÉNÉRER UNE ATTESTATION
     ========================================================================== */
  static async generer(
    sessionId: string,
    participantId: string,
  ): Promise<Attestation> {
    /* -------------------- Vérifier éligibilité -------------------- */
    const eligibility = await this.verifierEligibilite(
      sessionId,
      participantId,
    );

    if (!eligibility.eligible) {
      throw new BadRequestError(
        `Participant non éligible : ${eligibility.raisons.join(', ')}`,
      );
    }

    if (eligibility.dejaGeneree) {
      throw new ConflictError('Une attestation existe déjà pour ce participant');
    }

    /* -------------------- Créer l'attestation -------------------- */
    const numero = await this.generateNumero();
    const hash = this.generateHash(numero, participantId, sessionId);

    const attestation = await attestationRepository.create({
      numero,
      hash,
      sessionId,
      participantId,
      noteFinale: eligibility.noteFinale,
      tauxPresence: eligibility.tauxPresence,
      dateEmission: new Date(),
      valide: true,
      telechargee: false,
    });

    /* -------------------- Générer le PDF -------------------- */
    try {
      const pdfUrl = await this.generatePdf(attestation);
      await attestationRepository.update(attestation.id, {
        fichierUrl: pdfUrl,
      } as any);
      attestation.fichierUrl = pdfUrl;
    } catch (pdfError) {
      console.error('[AttestationService.generer] Erreur PDF:', pdfError);
      // On ne bloque pas la création si le PDF échoue
    }

    return attestation;
  }

  /* ==========================================================================
     ⭐ GÉNÉRER PAR SESSION (batch)
     ========================================================================== */
  static async genererParSession(
    sessionId: string,
    criteria: EligibilityCriteria = DEFAULT_CRITERIA,
  ) {
    const preview = await this.previewSession(sessionId, criteria);

    let generes = 0;
    let ignores = 0;
    let erreurs = 0;
    const attestations: Array<{
      id: string;
      numero: string;
      participantId: string;
      participantNom: string;
    }> = [];

    for (const p of preview.participants) {
      if (!p.eligible || p.dejaGeneree) {
        ignores++;
        continue;
      }

      try {
        const attestation = await this.generer(
          sessionId,
          p.participantId,
        );
        generes++;
        attestations.push({
          id: attestation.id,
          numero: attestation.numero,
          participantId: p.participantId,
          participantNom: `${p.participant.prenom} ${p.participant.nom}`,
        });
      } catch (error) {
        erreurs++;
        console.error(
          `[genererParSession] Erreur pour ${p.participantId}:`,
          error,
        );
      }
    }

    return { generes, ignores, erreurs, attestations };
  }

  /* ==========================================================================
     INVALIDER
     ========================================================================== */
  static async invalider(
    id: string,
    motif: string,
  ): Promise<Attestation> {
    const attestation = await attestationRepository.findByIdWithRelations(id);
    if (!attestation) throw new NotFoundError('Attestation introuvable');

    const updated = await attestationRepository.updateValidity(id, false, motif);
    return updated!;
  }

  /* ==========================================================================
     RÉACTIVER
     ========================================================================== */
  static async reactiver(id: string): Promise<Attestation> {
    const attestation = await attestationRepository.findByIdWithRelations(id);
    if (!attestation) throw new NotFoundError('Attestation introuvable');

    const updated = await attestationRepository.updateValidity(id, true);
    return updated!;
  }

  /* ==========================================================================
     TÉLÉCHARGER PDF
     ========================================================================== */
  static async telecharger(id: string, userId: string) {
    const attestation = await attestationRepository.findByIdWithRelations(id);
    if (!attestation) throw new NotFoundError('Attestation introuvable');

    // ⭐ Sécurité : participant ne peut télécharger que SES attestations
    // (sauf admin/staff)
    if (
      attestation.participantId !== userId &&
      !(await this.isAdminOrStaff(userId))
    ) {
      throw new BadRequestError('Non autorisé à télécharger cette attestation');
    }

    if (!attestation.fichierUrl) {
      throw new NotFoundError('PDF non encore généré');
    }

    const filePath = path.join(
      process.cwd(),
      'uploads',
      'attestations',
      path.basename(attestation.fichierUrl),
    );

    // Marquer comme téléchargée
    await attestationRepository.markAsDownloaded(id);

    return {
      path: filePath,
      nom: `attestation-${attestation.numero}.pdf`,
    };
  }

  /* ==========================================================================
     HELPERS PRIVÉS
     ========================================================================== */

  private static async generateNumero(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await attestationRepository.count();
    const sequence = String(count + 1).padStart(6, '0');
    return `ATT-${year}-${sequence}`;
  }

  private static generateHash(
    numero: string,
    participantId: string,
    sessionId: string,
  ): string {
    return crypto
      .createHash('sha256')
      .update(`${numero}:${participantId}:${sessionId}:${Date.now()}`)
      .digest('hex')
      .slice(0, 64);
  }

  private static async generatePdf(attestation: Attestation): Promise<string> {
    // ⚠️ À implémenter avec Puppeteer ou PDFKit
    // Pour l'instant, retourne un chemin fictif
    const fileName = `attestation-${attestation.numero}.pdf`;
    const dir = path.join(process.cwd(), 'uploads', 'attestations');

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // TODO : générer le vrai PDF ici
    return fileName;
  }

  private static async isAdminOrStaff(userId: string): Promise<boolean> {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: userId },
      relations: ['role'],
    });

    return (
      user?.role?.nom === 'ADMINISTRATEUR' ||
      user?.role?.nom === 'STAFF_ODC'
    );
  }

  /* ==========================================================================
     SERIALIZE
     ========================================================================== */
  private static serialize(attestation: Attestation): any {
    return {
      id: attestation.id,
      numero: attestation.numero,
      hash: attestation.hash,
      participantId: attestation.participantId,
      participant: attestation.participant
        ? {
            id: attestation.participant.id,
            nom: attestation.participant.nom,
            prenom: attestation.participant.prenom,
            email: attestation.participant.email,
            photoUrl: attestation.participant.photoUrl,
          }
        : undefined,
      sessionId: attestation.sessionId,
      session: attestation.session
        ? this.serializeSession(attestation.session)
        : undefined,
      noteFinale:
        attestation.noteFinale !== null
          ? Number(attestation.noteFinale)
          : undefined,
      tauxPresence:
        attestation.tauxPresence !== null
          ? Number(attestation.tauxPresence)
          : undefined,
      dateEmission: attestation.dateEmission,
      fichierUrl: attestation.fichierUrl,
      qrCodeUrl: attestation.qrCodeUrl,
      valide: attestation.valide,
      motifInvalidation: attestation.motifInvalidation,
      telechargee: attestation.telechargee,
      dateTelechargement: attestation.dateTelechargement,
    };
  }

  private static serializeSession(session: Session): any {
    return {
      id: session.id,
      codeSession: session.codeSession,
      dateDebut: session.dateDebut,
      dateFin: session.dateFin,
      statut: session.statut,
      formation: session.formation
        ? {
            id: session.formation.id,
            titre: session.formation.titre,
            dureeHeures: session.formation.dureeHeures,
          }
        : undefined,
    };
  }
}