import { AppDataSource } from '../config/database';
import { User } from '../models/User.entity';
import { Formation } from '../models/Formation.entity';
import { Session } from '../models/Session.entity';
import { Inscription } from '../models/Inscription.entity';
import { Attestation } from '../models/Attestation.entity';
import { PdfService } from './pdf.service';
import { logger } from '../config/logger';

export class ExportService {
  /**
   * Convertit un tableau d'objets en CSV
   */
  static toCSV(
    data: any[],
    columns?: Array<{ key: string; label: string }>
  ): string {
    if (data.length === 0) return '';

    // Déterminer les colonnes
    const cols = columns || Object.keys(data[0]).map((k) => ({ key: k, label: k }));

    // En-tête
    const header = cols.map((c) => `"${c.label}"`).join(';');

    // Lignes
    const rows = data.map((row) =>
      cols
        .map((c) => {
          const value = this.getNestedValue(row, c.key);
          if (value === null || value === undefined) return '""';
          if (typeof value === 'object') return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(';')
    );

    return '\uFEFF' + [header, ...rows].join('\n'); // BOM pour Excel
  }

  /**
   * Récupère une valeur imbriquée (a.b.c)
   */
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, k) => o?.[k], obj);
  }

  /**
   * Export utilisateurs en CSV
   */
  static async utilisateursCSV(): Promise<string> {
    const users = await AppDataSource.getRepository(User).find({
      relations: ['role'],
      order: { createdAt: 'DESC' },
    });

    const data = users.map((u) => ({
      id: u.id,
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      telephone: u.telephone || '',
      role: u.role?.nom || '',
      actif: u.actif ? 'Oui' : 'Non',
      ville: u.ville || '',
      derniereConnexion: u.derniereConnexion
        ? new Date(u.derniereConnexion).toLocaleString('fr-FR')
        : 'Jamais',
      createdAt: new Date(u.createdAt).toLocaleString('fr-FR'),
    }));

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

  /**
   * Export formations en CSV
   */
  static async formationsCSV(): Promise<string> {
    const formations = await AppDataSource.getRepository(Formation).find({
      relations: ['sessions'],
      order: { createdAt: 'DESC' },
    });

    const data = formations.map((f) => ({
      titre: f.titre,
      domaine: f.domaine,
      niveau: f.niveau,
      dureeHeures: f.dureeHeures,
      sessionsCount: f.sessions?.length || 0,
      actif: f.actif ? 'Oui' : 'Non',
      description: f.description || '',
      createdAt: new Date(f.createdAt).toLocaleString('fr-FR'),
    }));

    return this.toCSV(data, [
      { key: 'titre', label: 'Titre' },
      { key: 'domaine', label: 'Domaine' },
      { key: 'niveau', label: 'Niveau' },
      { key: 'dureeHeures', label: 'Durée (h)' },
      { key: 'sessionsCount', label: 'Sessions' },
      { key: 'actif', label: 'Actif' },
      { key: 'description', label: 'Description' },
      { key: 'createdAt', label: 'Créé le' },
    ]);
  }

  /**
   * Export inscriptions en CSV (par session)
   */
  static async inscriptionsCSV(sessionId?: string): Promise<string> {
    const qb = AppDataSource.getRepository(Inscription)
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.participant', 'p')
      .leftJoinAndSelect('p.role', 'r')
      .leftJoinAndSelect('i.session', 's')
      .leftJoinAndSelect('s.formation', 'f');

    if (sessionId) {
      qb.where('i.session_id = :sid', { sid: sessionId });
    }

    const inscriptions = await qb.getMany();

    const data = inscriptions.map((i) => ({
      numero: i.id.substring(0, 8).toUpperCase(),
      nom: i.participant?.nom || '',
      prenom: i.participant?.prenom || '',
      email: i.participant?.email || '',
      telephone: i.participant?.telephone || '',
      ville: i.participant?.ville || '',
      formation: i.session?.formation?.titre || '',
      dateDebut: i.session?.dateDebut
        ? new Date(i.session.dateDebut).toLocaleDateString('fr-FR')
        : '',
      statut: i.statut,
      motivation: i.motivation || '',
      motifRefus: i.motifRefus || '',
      dateInscription: new Date(i.dateInscription).toLocaleString('fr-FR'),
    }));

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

  /**
   * Export attestations en CSV
   */
  static async attestationsCSV(): Promise<string> {
    const attestations = await AppDataSource.getRepository(Attestation).find({
      relations: [
        'participant',
        'session',
        'session.formation',
      ],
      order: { dateEmission: 'DESC' },
    });

    const data = attestations.map((a) => ({
      numero: a.numero,
      nom: a.participant?.nom || '',
      prenom: a.participant?.prenom || '',
      email: a.participant?.email || '',
      formation: a.session?.formation?.titre || '',
      domaine: a.session?.formation?.domaine || '',
      noteFinale: Number(a.noteFinale || 0).toFixed(2),
      tauxPresence: Number(a.tauxPresence || 0).toFixed(2) + '%',
      dateEmission: new Date(a.dateEmission).toLocaleDateString('fr-FR'),
      hash: a.hash.substring(0, 16) + '...',
    }));

    return this.toCSV(data, [
      { key: 'numero', label: 'N° Attestation' },
      { key: 'nom', label: 'Nom' },
      { key: 'prenom', label: 'Prénom' },
      { key: 'email', label: 'Email' },
      { key: 'formation', label: 'Formation' },
      { key: 'domaine', label: 'Domaine' },
      { key: 'noteFinale', label: 'Note finale' },
      { key: 'tauxPresence', label: 'Présence' },
      { key: 'dateEmission', label: 'Émis le' },
      { key: 'hash', label: 'Hash' },
    ]);
  }

  /**
   * Export JSON (pour API)
   */
  static async toJSON(data: any): Promise<string> {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Export PDF d'une liste (générique)
   */
  static async listePDF(params: {
    titre: string;
    colonnes: string[];
    lignes: any[][];
    metadata?: any;
  }): Promise<Buffer> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Inter', sans-serif; color: #1A1A1A; padding: 20px; }
          .header {
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 3px solid #FF7900; padding-bottom: 15px; margin-bottom: 20px;
          }
          .logo { font-family: 'Poppins', sans-serif; font-weight: 700; color: #FF7900; font-size: 20px; }
          .titre { font-size: 24px; font-weight: 700; color: #1A1A1A; }
          .meta { font-size: 11px; color: #6B6B6B; text-align: right; }
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
            <div class="titre">${params.titre}</div>
          </div>
          <div class="meta">
            Généré le : ${new Date().toLocaleString('fr-FR')}<br>
            Total : ${params.lignes.length} entrée(s)
          </div>
        </div>

        <table>
          <thead>
            <tr>
              ${params.colonnes.map((c) => `<th>${c}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${params.lignes
              .map(
                (row) =>
                  `<tr>${row.map((cell) => `<td>${cell ?? ''}</td>`).join('')}</tr>`
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

  /**
   * Export utilisateurs en PDF
   */
  static async utilisateursPDF(): Promise<Buffer> {
    const users = await AppDataSource.getRepository(User).find({
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
        u.role?.nom || '',
        u.ville || '-',
        u.actif ? 'Actif' : 'Inactif',
      ]),
    });
  }

  /**
   * Export inscriptions en PDF
   */
  static async inscriptionsPDF(sessionId: string): Promise<Buffer> {
    const session = await AppDataSource.getRepository(Session).findOne({
      where: { id: sessionId },
      relations: ['formation'],
    });

    const inscriptions = await AppDataSource.getRepository(Inscription).find({
      where: { sessionId },
      relations: ['participant'],
    });

    return this.listePDF({
      titre: `Inscriptions — ${session?.formation.titre || 'Session'}`,
      colonnes: ['Nom', 'Prénom', 'Email', 'Téléphone', 'Statut', 'Date inscription'],
      lignes: inscriptions.map((i) => [
        i.participant.nom,
        i.participant.prenom,
        i.participant.email,
        i.participant.telephone || '-',
        i.statut,
        new Date(i.dateInscription).toLocaleDateString('fr-FR'),
      ]),
    });
  }

  /**
   * Enregistre un export dans /uploads/exports
   */
  static async sauvegarderExport(
    contenu: string | Buffer,
    filename: string
  ): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');

    const dir = path.join(process.cwd(), 'uploads', 'exports');
    await fs.mkdir(dir, { recursive: true });

    const fullPath = path.join(dir, filename);
    await fs.writeFile(fullPath, contenu);

    logger.info(`📤 Export sauvegardé : /uploads/exports/${filename}`);
    return `/uploads/exports/${filename}`;
  }
}