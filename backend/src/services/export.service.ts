// src/services/export.service.ts
import { userRepository }        from '../repositories/user.repository';
import { formationRepository }   from '../repositories/formation.repository';
import { sessionRepository }     from '../repositories/session.repository';
import { inscriptionRepository } from '../repositories/inscription.repository';
import { attestationRepository } from '../repositories/attestation.repository';
import { PdfService }            from './pdf.service';
import { logger }                from '../config/logger';
import { NotFoundError }         from '../errors/AppError';
import { Formation }             from '../entities/Formation.entity';

// =============================================================================
// TYPES
// =============================================================================

export interface CsvColumn {
  key: string;
  label: string;
}

export interface PdfListeParams {
  titre: string;
  colonnes: string[];
  lignes: Array<Array<string | number | null | undefined>>;
  metadata?: Record<string, any>;
}

export class ExportService {
  // ==========================================================================
  // 📄 CSV
  // ==========================================================================
  /**
   * Convertit un tableau d'objets en CSV (séparateur ';' + BOM pour Excel FR).
   */
  static toCSV(data: any[], columns?: CsvColumn[]): string {
    if (!data || data.length === 0) return '';

    const cols: CsvColumn[] =
      columns ??
      Object.keys(data[0]).map((k) => ({ key: k, label: k }));

    const header = cols.map((c) => this.escapeCsv(c.label)).join(';');

    const rows = data.map((row) =>
      cols
        .map((c) => {
          const value = this.getNestedValue(row, c.key);
          if (value === null || value === undefined) return '""';
          if (typeof value === 'object') return this.escapeCsv(JSON.stringify(value));
          if (value instanceof Date) return this.escapeCsv(value.toLocaleString('fr-FR'));
          return this.escapeCsv(String(value));
        })
        .join(';'),
    );

    return '\uFEFF' + [header, ...rows].join('\r\n');
  }

  private static escapeCsv(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, k) => o?.[k], obj);
  }

  // ==========================================================================
  // 👥 UTILISATEURS
  // ==========================================================================
  static async utilisateursCSV(): Promise<string> {
    const users = await userRepository.findMany({
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });

    const data = users.map((u) => ({
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      telephone: u.telephone ?? '',
      role: u.role?.libelle ?? u.role?.nom ?? '',
      ville: u.ville ?? '',
      actif: u.actif ? 'Oui' : 'Non',
      derniereConnexion: u.derniereConnexion
        ? new Date(u.derniereConnexion).toLocaleString('fr-FR')
        : 'Jamais',
      createdAt: new Date(u.createdAt).toLocaleString('fr-FR'),
    }));

    logger.info(`📤 Export CSV utilisateurs : ${data.length}`);
    return this.toCSV(data, [
      { key: 'nom', label: 'Nom' },
      { key: 'prenom', label: 'Prénom' },
      { key: 'email', label: 'Email' },
      { key: 'telephone', label: 'Téléphone' },
      { key: 'role', label: 'Rôle' },
      { key: 'ville', label: 'Ville' },
      { key: 'actif', label: 'Actif' },
      { key: 'derniereConnexion', label: 'Dernière connexion' },
      { key: 'createdAt', label: 'Créé le' },
    ]);
  }

  static async utilisateursPDF(): Promise<Buffer> {
    const users = await userRepository.findMany({
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });

    return this.listePDF({
      titre: 'Liste des utilisateurs',
      colonnes: ['Nom', 'Prénom', 'Email', 'Rôle', 'Ville', 'Statut'],
      lignes: users.map((u) => [
        u.nom,
        u.prenom,
        u.email,
        u.role?.libelle ?? u.role?.nom ?? '',
        u.ville ?? '-',
        u.actif ? 'Actif' : 'Inactif',
      ]),
    });
  }

  // ==========================================================================
  // 📚 FORMATIONS
  // ==========================================================================
  static async formationsCSV(): Promise<string> {
    const formations = await formationRepository.findMany({
      relations: ['sessions', 'domaineRelation'],
      order: { createdAt: 'DESC' },
    });

    const data = formations.map((f) => ({
      titre: f.titre,
      domaine: f.domaineRelation?.nom ?? f.domaine,
      niveau: f.niveau,
      dureeHeures: f.dureeHeures,
      sessionsCount: f.sessions?.length ?? 0,
      prix: f.prix != null ? Number(f.prix).toFixed(2) : '-',
      estPubliee: f.estPubliee ? 'Oui' : 'Non',
      actif: f.actif ? 'Oui' : 'Non',
      nbVues: f.nbVues ?? 0,
      createdAt: new Date(f.createdAt).toLocaleString('fr-FR'),
    }));

    logger.info(`📤 Export CSV formations : ${data.length}`);
    return this.toCSV(data, [
      { key: 'titre', label: 'Titre' },
      { key: 'domaine', label: 'Domaine' },
      { key: 'niveau', label: 'Niveau' },
      { key: 'dureeHeures', label: 'Durée (h)' },
      { key: 'sessionsCount', label: 'Sessions' },
      { key: 'prix', label: 'Prix' },
      { key: 'estPubliee', label: 'Publiée' },
      { key: 'actif', label: 'Active' },
      { key: 'nbVues', label: 'Vues' },
      { key: 'createdAt', label: 'Créée le' },
    ]);
  }

  // ==========================================================================
  // 📝 INSCRIPTIONS
  // ==========================================================================
  static async inscriptionsCSV(sessionId?: string): Promise<string> {
    const qb = inscriptionRepository.raw
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.participant', 'p')
      .leftJoinAndSelect('p.role', 'r')
      .leftJoinAndSelect('i.session', 's')
      .leftJoinAndSelect('s.formation', 'f');

    if (sessionId) qb.where('i.session_id = :sid', { sid: sessionId });

    const inscriptions = await qb.orderBy('i.date_inscription', 'DESC').getMany();

    const data = inscriptions.map((i) => ({
      numero: i.id.substring(0, 8).toUpperCase(),
      nom: i.participant?.nom ?? '',
      prenom: i.participant?.prenom ?? '',
      email: i.participant?.email ?? '',
      telephone: i.participant?.telephone ?? '',
      ville: i.participant?.ville ?? '',
      formation: i.session?.formation?.titre ?? '',
      dateDebut: i.session?.dateDebut
        ? new Date(i.session.dateDebut).toLocaleDateString('fr-FR')
        : '',
      statut: i.statut,
      motivation: i.motivation ?? '',
      motifRefus: i.motifRefus ?? '',
      dateInscription: new Date(i.dateInscription).toLocaleString('fr-FR'),
    }));

    logger.info(`📤 Export CSV inscriptions : ${data.length}`);
    return this.toCSV(data, [
      { key: 'numero', label: 'N°' },
      { key: 'nom', label: 'Nom' },
      { key: 'prenom', label: 'Prénom' },
      { key: 'email', label: 'Email' },
      { key: 'telephone', label: 'Téléphone' },
      { key: 'ville', label: 'Ville' },
      { key: 'formation', label: 'Formation' },
      { key: 'dateDebut', label: 'Date début' },
      { key: 'statut', label: 'Statut' },
      { key: 'motivation', label: 'Motivation' },
      { key: 'motifRefus', label: 'Motif refus' },
      { key: 'dateInscription', label: 'Inscrit le' },
    ]);
  }

  static async inscriptionsPDF(sessionId: string): Promise<Buffer> {
    const session = await sessionRepository.findById(sessionId, ['formation']);
    if (!session) throw new NotFoundError('Session introuvable');

    const inscriptions = await inscriptionRepository.findBySession(sessionId);

    return this.listePDF({
      titre: `Inscriptions — ${session.formation?.titre ?? 'Session'}`,
      colonnes: ['Nom', 'Prénom', 'Email', 'Téléphone', 'Statut', 'Date inscription'],
      lignes: inscriptions.map((i) => [
        i.participant?.nom ?? '',
        i.participant?.prenom ?? '',
        i.participant?.email ?? '',
        i.participant?.telephone ?? '-',
        i.statut,
        new Date(i.dateInscription).toLocaleDateString('fr-FR'),
      ]),
    });
  }

  // ==========================================================================
  // 🎓 ATTESTATIONS
  // ==========================================================================
  static async attestationsCSV(): Promise<string> {
    const attestations = await attestationRepository.findMany({
      relations: ['participant', 'session', 'session.formation'],
      order: { dateEmission: 'DESC' },
    });

    const data = attestations.map((a) => ({
      numero: a.numero,
      nom: a.participant?.nom ?? '',
      prenom: a.participant?.prenom ?? '',
      email: a.participant?.email ?? '',
      formation: a.session?.formation?.titre ?? '',
      noteFinale: a.noteFinale != null ? Number(a.noteFinale).toFixed(2) : '-',
      tauxPresence: a.tauxPresence != null ? `${Number(a.tauxPresence).toFixed(2)}%` : '-',
      dateEmission: new Date(a.dateEmission).toLocaleDateString('fr-FR'),
      valide: a.valide ? 'Oui' : 'Non',
      hash: `${a.hash.substring(0, 16)}...`,
    }));

    logger.info(`📤 Export CSV attestations : ${data.length}`);
    return this.toCSV(data, [
      { key: 'numero', label: 'N° Attestation' },
      { key: 'nom', label: 'Nom' },
      { key: 'prenom', label: 'Prénom' },
      { key: 'email', label: 'Email' },
      { key: 'formation', label: 'Formation' },
      { key: 'noteFinale', label: 'Note finale' },
      { key: 'tauxPresence', label: 'Présence' },
      { key: 'dateEmission', label: 'Émise le' },
      { key: 'valide', label: 'Valide' },
      { key: 'hash', label: 'Hash' },
    ]);
  }

  // ==========================================================================
  // 📊 JSON
  // ==========================================================================
  static toJSON(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  // ==========================================================================
  // 📕 PDF GÉNÉRIQUE
  // ==========================================================================
  static async listePDF(params: PdfListeParams): Promise<Buffer> {
    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', Arial, sans-serif; color: #1A1A1A; padding: 20px; }
          .header {
            display: flex; justify-content: space-between; align-items: flex-start;
            border-bottom: 3px solid #FF7900; padding-bottom: 15px; margin-bottom: 20px;
          }
          .logo { font-weight: 700; color: #FF7900; font-size: 20px; }
          .titre { font-size: 22px; font-weight: 700; margin-top: 4px; }
          .meta { font-size: 11px; color: #6B6B6B; text-align: right; line-height: 1.5; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th {
            background: #FF7900; color: #FFF; padding: 10px; text-align: left;
            font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;
          }
          td { padding: 8px 10px; border-bottom: 1px solid #E0E0E0; font-size: 11px; }
          tr:nth-child(even) { background: #FFF8F2; }
          .footer {
            margin-top: 30px; padding-top: 15px; border-top: 1px solid #E0E0E0;
            text-align: center; font-size: 10px; color: #6B6B6B;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">ODC</div>
            <div class="titre">${this.escapeHtml(params.titre)}</div>
          </div>
          <div class="meta">
            Généré le : ${new Date().toLocaleString('fr-FR')}<br>
            Total : ${params.lignes.length} entrée(s)
          </div>
        </div>
        <table>
          <thead>
            <tr>${params.colonnes.map((c) => `<th>${this.escapeHtml(c)}</th>`).join('')}</tr>
          </thead>
          <tbody>
            ${params.lignes
              .map(
                (row) =>
                  `<tr>${row
                    .map((cell) => `<td>${this.escapeHtml(String(cell ?? ''))}</td>`)
                    .join('')}</tr>`,
              )
              .join('')}
          </tbody>
        </table>
        <div class="footer">
          Orange Digital Center • contact@odc.mg • odc.orange.mg
        </div>
      </body>
      </html>
    `;

    return PdfService.genererBufferDepuisHtml(html);
  }

  private static escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ==========================================================================
  // 💾 SAUVEGARDE DISQUE
  // ==========================================================================
  static async sauvegarderExport(
    contenu: string | Buffer,
    filename: string,
  ): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');

    // Sécurité : empêcher path traversal
    const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');

    const dir = path.join(process.cwd(), 'uploads', 'exports');
    await fs.mkdir(dir, { recursive: true });

    const fullPath = path.join(dir, safeName);
    await fs.writeFile(fullPath, contenu);

    logger.info(`📤 Export sauvegardé : /uploads/exports/${safeName}`);
    return `/uploads/exports/${safeName}`;
  }
}