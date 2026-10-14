<<<<<<< HEAD
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
=======
// src/services/export.service.ts
import { AppDataSource } from '../config/database';
import { User } from '../entities/User.entity';
import { Formation } from '../entities/Formation.entity';
import { Inscription } from '../entities/Inscription.entity';
import { Attestation } from '../entities/Attestation.entity';
import { Session } from '../entities/Session.entity';
import { Partenaire } from '../entities/Partenaire.entity';
import { Domaine } from '../entities/Domaine.entity';
import { AuditLog } from '../entities/AuditLog.entity';
import { generateCSV, type CSVColumn } from '../utils/csv.util';
import { generatePDF, type PDFColumn } from '../utils/pdf.util';
import archiver from 'archiver';
import { EntityMetadata } from 'typeorm';

export class ExportService {
  /* ==========================================================================
     ⭐ HELPER — Détecte automatiquement une relation
     ========================================================================== */

  private static hasRelation(
    entity: any,
    relationName: string,
  ): boolean {
    try {
      const metadata = AppDataSource.getMetadata(entity);
      return metadata.relations.some(
        (rel: any) => rel.propertyName === relationName,
      );
    } catch {
      return false;
    }
  }

  /* ==========================================================================
     ⭐ FORMATIONS — Version robuste
     ========================================================================== */
  static async exportFormations(format: 'csv' | 'pdf') {
    const qb = AppDataSource.getRepository(Formation)
      .createQueryBuilder('f');

<<<<<<< HEAD
    /* -------------------- Joindre domaine SI existe -------------------- */
    const hasDomaine = this.hasRelation(Formation, 'domaine');
    const hasDomaineFormation = this.hasRelation(Formation, 'domaineFormation');

    if (hasDomaine) {
      qb.leftJoinAndSelect('f.domaine', 'd');
    } else if (hasDomaineFormation) {
      qb.leftJoinAndSelect('f.domaineFormation', 'd');
    }

    /* -------------------- Joindre sessions/inscriptions SI existe -------------------- */
    if (this.hasRelation(Formation, 'sessions')) {
      qb.loadRelationCountAndMap('f.sessionsCount', 'f.sessions');
    }

    if (this.hasRelation(Formation, 'inscriptions')) {
      qb.loadRelationCountAndMap('f.inscriptionsCount', 'f.inscriptions');
    }

    qb.orderBy('f.createdAt', 'DESC');

    const formations = await qb.getMany();

    /* -------------------- Charger les domaines manuellement -------------------- */
    const hasDomaineId = formations.some((f: any) => f.domaineId);
    const domaines = hasDomaineId
      ? await AppDataSource.getRepository(Domaine).find({
          where: formations
            .map((f: any) => f.domaineId)
            .filter(Boolean)
            .map((id) => ({ id })),
=======
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
    const rows = data.map((row) =>
      cols
        .map((c) => {
          const value = this.getNestedValue(row, c.key);
          if (value === null || value === undefined) return '""';
<<<<<<< HEAD
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
=======
          if (typeof value === 'object') return this.escapeCsv(JSON.stringify(value));
          if (value instanceof Date) return this.escapeCsv(value.toLocaleString('fr-FR'));
          return this.escapeCsv(String(value));
>>>>>>> origin/main
        })
      : [];
    const domaineMap = new Map(domaines.map((d) => [d.id, d]));

    /* -------------------- Mapper les données -------------------- */
    const data = formations.map((f: any) => {
      // Extraire le domaine selon la façon dont il est disponible
      let domaineNom = '—';
      if (hasDomaine && f.domaine) {
        domaineNom = f.domaine.nom;
      } else if (hasDomaineFormation && f.domaineFormation) {
        domaineNom = f.domaineFormation.nom;
      } else if (f.domaineId && domaineMap.has(f.domaineId)) {
        domaineNom = domaineMap.get(f.domaineId)!.nom;
      }

<<<<<<< HEAD
      return {
        id: f.id,
        titre: f.titre,
        slug: f.slug,
        domaine: domaineNom,
        niveau: f.niveau ?? '—',
        dureeHeures: f.dureeHeures,
        prix: f.prix ?? 0,
        sessionsCount: f.sessionsCount ?? 0,
        inscriptionsCount: f.inscriptionsCount ?? 0,
        estPubliee: f.estPubliee,
        createdAt: f.createdAt,
      };
=======
  private static escapeCsv(value: string): string {
    return `"${value.replace(/"/g, '""')}"`;
  }

>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  private static getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, k) => o?.[k], obj);
  }

<<<<<<< HEAD
  /**
   * Export utilisateurs en CSV
   */
  static async utilisateursCSV(): Promise<string> {
    const users = await AppDataSource.getRepository(User).find({
=======
  // ==========================================================================
  // 👥 UTILISATEURS
  // ==========================================================================
  static async utilisateursCSV(): Promise<string> {
    const users = await userRepository.findMany({
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      relations: ['role'],
      order: { createdAt: 'DESC' },
>>>>>>> origin/main
    });

    /* -------------------- Colonnes -------------------- */
    const columns = [
      { key: 'id', header: 'ID' },
      { key: 'titre', header: 'Titre' },
      { key: 'slug', header: 'Slug' },
      { key: 'domaine', header: 'Domaine' },
      { key: 'niveau', header: 'Niveau' },
      { key: 'dureeHeures', header: 'Durée (h)' },
      {
        key: 'prix',
        header: 'Prix (Ar)',
        format: (v: any) =>
          v ? new Intl.NumberFormat('fr-FR').format(v) : '0',
      },
      { key: 'sessionsCount', header: 'Sessions' },
      { key: 'inscriptionsCount', header: 'Inscriptions' },
      { key: 'estPubliee', header: 'Publiée' },
      {
        key: 'createdAt',
        header: 'Créée le',
        format: (v: any) =>
          v ? new Date(v).toLocaleDateString('fr-FR') : '—',
      },
    ];

    return format === 'csv'
      ? generateCSV(data, columns as CSVColumn<any>[])
      : generatePDF(data, columns as PDFColumn<any>[], {
          title: 'Catalogue des formations',
          subtitle: 'Liste des formations avec statistiques',
          orientation: 'landscape',
        });
  }

  /* ==========================================================================
     ⭐ SESSIONS — Version robuste
     ========================================================================== */
  static async exportSessions(format: 'csv' | 'pdf') {
    const qb = AppDataSource.getRepository(Session)
      .createQueryBuilder('s');

    /* -------------------- Relations conditionnelles -------------------- */
    if (this.hasRelation(Session, 'formation')) {
      qb.leftJoinAndSelect('s.formation', 'f');
    }
    if (this.hasRelation(Session, 'formateur')) {
      qb.leftJoinAndSelect('s.formateur', 'u');
    }
    if (this.hasRelation(Session, 'inscriptions')) {
      qb.loadRelationCountAndMap('s.inscriptionsCount', 's.inscriptions');
    }

    qb.orderBy('s.dateDebut', 'DESC');

    const sessions = await qb.getMany();

    /* -------------------- Charger les formations manuellement si besoin -------------------- */
    const hasFormation = this.hasRelation(Session, 'formation');
    const formationIds = !hasFormation
      ? [...new Set(sessions.map((s: any) => s.formationId).filter(Boolean))]
      : [];

    const formations = formationIds.length > 0
      ? await AppDataSource.getRepository(Formation).find({
          where: formationIds.map((id) => ({ id })),
        })
      : [];
    const formationMap = new Map(formations.map((f) => [f.id, f]));

    /* -------------------- Mapper -------------------- */
    const data = sessions.map((s: any) => {
      const formation = hasFormation
        ? s.formation
        : formationMap.get(s.formationId);

      return {
        code: s.codeSession,
        formation: formation?.titre ?? '—',
        formateur: s.formateur
          ? `${s.formateur.prenom} ${s.formateur.nom}`
          : '—',
        dateDebut: s.dateDebut,
        dateFin: s.dateFin,
        lieu: s.lieu ?? 'En ligne',
        capacite: s.capacite,
        inscrits: s.inscriptionsCount ?? 0,
        statut: s.statut,
      };
    });

    const columns = [
      { key: 'code', header: 'Code' },
      { key: 'formation', header: 'Formation' },
      { key: 'formateur', header: 'Formateur' },
      {
        key: 'dateDebut',
        header: 'Début',
        format: (v: any) =>
          v ? new Date(v).toLocaleDateString('fr-FR') : '—',
      },
      {
        key: 'dateFin',
        header: 'Fin',
        format: (v: any) =>
          v ? new Date(v).toLocaleDateString('fr-FR') : '—',
      },
      { key: 'lieu', header: 'Lieu' },
      { key: 'capacite', header: 'Capacité' },
      { key: 'inscrits', header: 'Inscrits' },
      { key: 'statut', header: 'Statut' },
    ];

    return format === 'csv'
      ? generateCSV(data, columns as CSVColumn<any>[])
      : generatePDF(data, columns as PDFColumn<any>[], {
          title: 'Planning des sessions',
          subtitle: 'Liste complète des sessions de formation',
          orientation: 'landscape',
        });
  }

  /* ==========================================================================
     ⭐ ATTESTATIONS — Version robuste
     ========================================================================== */
  static async exportAttestations(format: 'csv' | 'pdf') {
    const qb = AppDataSource.getRepository(Attestation)
      .createQueryBuilder('a');

    if (this.hasRelation(Attestation, 'participant')) {
      qb.leftJoinAndSelect('a.participant', 'p');
    }
    if (this.hasRelation(Attestation, 'session')) {
      qb.leftJoinAndSelect('a.session', 's');
    }

    qb.orderBy('a.dateEmission', 'DESC');

    const attestations = await qb.getMany();

    const data = attestations.map((a: any) => ({
      numero: a.numero,
      participant: a.participant
        ? `${a.participant.prenom} ${a.participant.nom}`
        : '—',
      email: a.participant?.email ?? '—',
      formation: a.session?.formation?.titre ?? '—',
      session: a.session?.codeSession ?? '—',
      noteFinale: a.noteFinale ? Number(a.noteFinale) : '—',
      tauxPresence: a.tauxPresence ? `${a.tauxPresence}%` : '—',
      valide: a.valide,
      dateEmission: a.dateEmission,
    }));

    const columns = [
      { key: 'numero', header: 'Numéro' },
      { key: 'participant', header: 'Participant' },
      { key: 'email', header: 'Email' },
      { key: 'formation', header: 'Formation' },
      { key: 'session', header: 'Session' },
      { key: 'noteFinale', header: 'Note finale' },
      { key: 'tauxPresence', header: 'Présence' },
      { key: 'valide', header: 'Valide' },
      {
        key: 'dateEmission',
        header: 'Émise le',
        format: (v: any) =>
          v ? new Date(v).toLocaleDateString('fr-FR') : '—',
      },
    ];

    return format === 'csv'
      ? generateCSV(data, columns as CSVColumn<any>[])
      : generatePDF(data, columns as PDFColumn<any>[], {
          title: 'Registre des attestations',
          subtitle: 'Liste complète des attestations émises',
          orientation: 'landscape',
        });
  }

  /* ==========================================================================
     ⭐ INSCRIPTIONS — Version robuste
     ========================================================================== */
  static async exportInscriptions(format: 'csv' | 'pdf') {
    const qb = AppDataSource.getRepository(Inscription)
      .createQueryBuilder('i');

    if (this.hasRelation(Inscription, 'participant')) {
      qb.leftJoinAndSelect('i.participant', 'p');
    }
    if (this.hasRelation(Inscription, 'session')) {
      qb.leftJoinAndSelect('i.session', 's');
    }

    qb.orderBy('i.createdAt', 'DESC');

    const inscriptions = await qb.getMany();

    const data = inscriptions.map((i: any) => ({
      id: i.id,
      participant: i.participant
        ? `${i.participant.prenom} ${i.participant.nom}`
        : '—',
      email: i.participant?.email ?? '—',
      session: i.session?.codeSession ?? '—',
      formation: i.session?.formation?.titre ?? '—',
      statut: i.statut,
      createdAt: i.createdAt,
    }));

    const columns = [
      { key: 'id', header: 'ID' },
      { key: 'participant', header: 'Participant' },
      { key: 'email', header: 'Email' },
      { key: 'session', header: 'Code session' },
      { key: 'formation', header: 'Formation' },
      { key: 'statut', header: 'Statut' },
      {
        key: 'createdAt',
        header: 'Inscrit le',
        format: (v: any) =>
          v ? new Date(v).toLocaleDateString('fr-FR') : '—',
      },
    ];

    return format === 'csv'
      ? generateCSV(data, columns as CSVColumn<any>[])
      : generatePDF(data, columns as PDFColumn<any>[], {
          title: 'Registre des inscriptions',
          subtitle: 'Liste complète des inscriptions',
          orientation: 'landscape',
        });
  }

  /* ==========================================================================
     UTILISATEURS (inchangé)
     ========================================================================== */
  static async exportUtilisateurs(format: 'csv' | 'pdf') {
    const users = await AppDataSource.getRepository(User)
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.role', 'r')
      .where('u.deletedAt IS NULL')
      .orderBy('u.createdAt', 'DESC')
      .getMany();

    const data = users.map((u) => ({
<<<<<<< HEAD
      id: u.id,
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      telephone: u.telephone ?? '—',
      role: u.role?.libelle ?? '—',
      actif: u.actif,
      emailVerifie: u.emailVerifie,
      createdAt: u.createdAt,
    }));

    const columns = [
      { key: 'id', header: 'ID' },
      { key: 'nom', header: 'Nom' },
      { key: 'prenom', header: 'Prénom' },
      { key: 'email', header: 'Email' },
      { key: 'telephone', header: 'Téléphone' },
      { key: 'role', header: 'Rôle' },
      { key: 'actif', header: 'Actif' },
      { key: 'emailVerifie', header: 'Email vérifié' },
      {
        key: 'createdAt',
        header: 'Inscrit le',
        format: (v: any) =>
          v ? new Date(v).toLocaleDateString('fr-FR') : '—',
      },
    ];

    return format === 'csv'
      ? generateCSV(data, columns as CSVColumn<any>[])
      : generatePDF(data, columns as PDFColumn<any>[], {
          title: 'Liste des utilisateurs',
          subtitle: 'Export complet des comptes utilisateurs ODC',
          orientation: 'landscape',
        });
  }

  /* ==========================================================================
     PARTENAIRES (inchangé)
     ========================================================================== */
  static async exportPartenaires(format: 'csv' | 'pdf') {
    const partenaires = await AppDataSource.getRepository(Partenaire)
      .createQueryBuilder('p')
      .orderBy('p.nom', 'ASC')
      .getMany();

    const data = partenaires.map((p) => ({
      id: p.id,
      nom: p.nom,
      secteur: p.secteur ?? '—',
      contactEmail: p.contactEmail ?? '—',
      contactTel: p.contactTel ?? '—',
      siteWeb: p.siteWeb ?? '—',
      actif: p.actif,
      estPubliee: p.estPubliee,
      createdAt: p.createdAt,
    }));

    const columns = [
      { key: 'id', header: 'ID' },
      { key: 'nom', header: 'Nom' },
      { key: 'secteur', header: 'Secteur' },
      { key: 'contactEmail', header: 'Email' },
      { key: 'contactTel', header: 'Téléphone' },
      { key: 'siteWeb', header: 'Site web' },
      { key: 'actif', header: 'Actif' },
      { key: 'estPubliee', header: 'Publié' },
      {
        key: 'createdAt',
        header: 'Créé le',
        format: (v: any) =>
          v ? new Date(v).toLocaleDateString('fr-FR') : '—',
      },
    ];

    return format === 'csv'
      ? generateCSV(data, columns as CSVColumn<any>[])
      : generatePDF(data, columns as PDFColumn<any>[], {
          title: 'Liste des partenaires',
          subtitle: 'Écosystème de partenaires ODC',
          orientation: 'landscape',
        });
  }

  /* ==========================================================================
     DOMAINES (inchangé)
     ========================================================================== */
  static async exportDomaines(format: 'csv' | 'pdf') {
    const qb = AppDataSource.getRepository(Domaine)
      .createQueryBuilder('d');

    if (this.hasRelation(Domaine, 'formations')) {
      qb.loadRelationCountAndMap('d.formationsCount', 'd.formations');
    }
=======
<<<<<<< HEAD
      id: u.id,
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      telephone: u.telephone || '',
      role: u.role?.nom || '',
      actif: u.actif ? 'Oui' : 'Non',
      ville: u.ville || '',
=======
      nom: u.nom,
      prenom: u.prenom,
      email: u.email,
      telephone: u.telephone ?? '',
      role: u.role?.libelle ?? u.role?.nom ?? '',
      ville: u.ville ?? '',
      actif: u.actif ? 'Oui' : 'Non',
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      derniereConnexion: u.derniereConnexion
        ? new Date(u.derniereConnexion).toLocaleString('fr-FR')
        : 'Jamais',
      createdAt: new Date(u.createdAt).toLocaleString('fr-FR'),
    }));

<<<<<<< HEAD
=======
    logger.info(`📤 Export CSV utilisateurs : ${data.length}`);
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
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

<<<<<<< HEAD
  /**
   * Export formations en CSV
   */
  static async formationsCSV(): Promise<string> {
    const formations = await AppDataSource.getRepository(Formation).find({
      relations: ['sessions'],
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      order: { createdAt: 'DESC' },
    });

    const data = formations.map((f) => ({
      titre: f.titre,
<<<<<<< HEAD
      domaine: f.domaine,
      niveau: f.niveau,
      dureeHeures: f.dureeHeures,
      sessionsCount: f.sessions?.length || 0,
      actif: f.actif ? 'Oui' : 'Non',
      description: f.description || '',
      createdAt: new Date(f.createdAt).toLocaleString('fr-FR'),
    }));

=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
    return this.toCSV(data, [
      { key: 'titre', label: 'Titre' },
      { key: 'domaine', label: 'Domaine' },
      { key: 'niveau', label: 'Niveau' },
      { key: 'dureeHeures', label: 'Durée (h)' },
      { key: 'sessionsCount', label: 'Sessions' },
<<<<<<< HEAD
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
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.participant', 'p')
      .leftJoinAndSelect('p.role', 'r')
      .leftJoinAndSelect('i.session', 's')
      .leftJoinAndSelect('s.formation', 'f');

<<<<<<< HEAD
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
=======
    if (sessionId) qb.where('i.session_id = :sid', { sid: sessionId });
>>>>>>> origin/main

    qb.orderBy('d.ordreAffichage', 'ASC');

<<<<<<< HEAD
    const domaines = await qb.getMany();

    const data = domaines.map((d: any) => ({
      id: d.id,
      nom: d.nom,
      slug: d.slug,
      couleur: d.couleur ?? '#FF7900',
      formationsCount: d.formationsCount ?? 0,
      actif: d.actif,
      estPubliee: d.estPubliee,
      ordreAffichage: d.ordreAffichage,
    }));

    const columns = [
      { key: 'id', header: 'ID' },
      { key: 'nom', header: 'Nom' },
      { key: 'slug', header: 'Slug' },
      { key: 'couleur', header: 'Couleur' },
      { key: 'formationsCount', header: 'Formations' },
      { key: 'actif', header: 'Actif' },
      { key: 'estPubliee', header: 'Publié' },
      { key: 'ordreAffichage', header: 'Ordre' },
    ];

    return format === 'csv'
      ? generateCSV(data, columns as CSVColumn<any>[])
      : generatePDF(data, columns as PDFColumn<any>[], {
          title: 'Liste des domaines',
          subtitle: 'Domaines de formation ODC',
          orientation: 'portrait',
        });
  }

  /* ==========================================================================
     AUDIT LOGS (inchangé)
     ========================================================================== */
  static async exportAuditLogs(
    format: 'csv' | 'pdf',
    filters?: {
      dateDebut?: string;
      dateFin?: string;
      action?: string;
    },
  ) {
    const qb = AppDataSource.getRepository(AuditLog)
      .createQueryBuilder('log');
=======
    const data = inscriptions.map((i) => ({
      numero: i.id.substring(0, 8).toUpperCase(),
      nom: i.participant?.nom ?? '',
      prenom: i.participant?.prenom ?? '',
      email: i.participant?.email ?? '',
      telephone: i.participant?.telephone ?? '',
      ville: i.participant?.ville ?? '',
      formation: i.session?.formation?.titre ?? '',
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      dateDebut: i.session?.dateDebut
        ? new Date(i.session.dateDebut).toLocaleDateString('fr-FR')
        : '',
      statut: i.statut,
<<<<<<< HEAD
      motivation: i.motivation || '',
      motifRefus: i.motifRefus || '',
      dateInscription: new Date(i.dateInscription).toLocaleString('fr-FR'),
    }));

=======
      motivation: i.motivation ?? '',
      motifRefus: i.motifRefus ?? '',
      dateInscription: new Date(i.dateInscription).toLocaleString('fr-FR'),
    }));

    logger.info(`📤 Export CSV inscriptions : ${data.length}`);
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
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

<<<<<<< HEAD
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
=======
  static async inscriptionsPDF(sessionId: string): Promise<Buffer> {
    const session = await sessionRepository.findById(sessionId, ['formation']);
    if (!session) throw new NotFoundError('Session introuvable');
>>>>>>> origin/main

    if (this.hasRelation(AuditLog, 'user')) {
      qb.leftJoinAndSelect('log.user', 'user');
    }

    qb.orderBy('log.createdAt', 'DESC').limit(10000);

    if (filters?.dateDebut) {
      qb.andWhere('log.createdAt >= :dateDebut', {
        dateDebut: filters.dateDebut,
      });
    }

    if (filters?.dateFin) {
      qb.andWhere('log.createdAt <= :dateFin', {
        dateFin: filters.dateFin,
      });
    }

    if (filters?.action) {
      qb.andWhere('log.action ILIKE :action', {
        action: `%${filters.action}%`,
      });
    }

    const logs = await qb.getMany();

    const data = logs.map((log: any) => ({
      date: log.createdAt,
      action: log.action,
      entite: log.entite ?? '—',
      entiteId: log.entiteId ?? '—',
      utilisateur: log.user
        ? `${log.user.prenom} ${log.user.nom}`
        : 'Système',
      ip: log.ipAddress ?? '—',
    }));

    const columns = [
      {
        key: 'date',
        header: 'Date',
        format: (v: any) =>
          v ? new Date(v).toLocaleString('fr-FR') : '—',
      },
      { key: 'action', header: 'Action' },
      { key: 'entite', header: 'Entité' },
      { key: 'entiteId', header: 'ID Entité' },
      { key: 'utilisateur', header: 'Utilisateur' },
      { key: 'ip', header: 'IP' },
    ];

    return format === 'csv'
      ? generateCSV(data, columns as CSVColumn<any>[])
      : generatePDF(data, columns as PDFColumn<any>[], {
          title: "Journal d'audit",
          subtitle: `Logs du ${filters?.dateDebut ?? 'début'} au ${filters?.dateFin ?? 'maintenant'}`,
          orientation: 'landscape',
        });
  }

  /* ==========================================================================
     EXPORT COMPLET (ZIP)
     ========================================================================== */
  static async exportComplet(): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        const archive = archiver('zip', { zlib: { level: 9 } });
        const chunks: Buffer[] = [];

        archive.on('data', (chunk: Buffer) => chunks.push(chunk));
        archive.on('end', () => resolve(Buffer.concat(chunks)));
        archive.on('error', reject);

        archive.append(
          (await this.exportUtilisateurs('csv')) as string,
          { name: 'utilisateurs.csv' },
        );
        archive.append(
          (await this.exportFormations('csv')) as string,
          { name: 'formations.csv' },
        );
        archive.append(
          (await this.exportInscriptions('csv')) as string,
          { name: 'inscriptions.csv' },
        );
        archive.append(
          (await this.exportAttestations('csv')) as string,
          { name: 'attestations.csv' },
        );
        archive.append(
          (await this.exportSessions('csv')) as string,
          { name: 'sessions.csv' },
        );
        archive.append(
          (await this.exportPartenaires('csv')) as string,
          { name: 'partenaires.csv' },
        );
        archive.append(
          (await this.exportDomaines('csv')) as string,
          { name: 'domaines.csv' },
        );

        archive.append(
          `Export ODC — ${new Date().toLocaleString('fr-FR')}`,
          { name: 'README.txt' },
        );

        archive.finalize();
      } catch (error) {
        reject(error);
      }
    });
  }

<<<<<<< HEAD
  /* ==========================================================================
     STATS
     ========================================================================== */
  static async getStats() {
    const [
      utilisateurs,
      formations,
      inscriptions,
      attestations,
      sessions,
      partenaires,
      domaines,
    ] = await Promise.all([
      AppDataSource.getRepository(User).count(),
      AppDataSource.getRepository(Formation).count(),
      AppDataSource.getRepository(Inscription).count(),
      AppDataSource.getRepository(Attestation).count(),
      AppDataSource.getRepository(Session).count(),
      AppDataSource.getRepository(Partenaire).count(),
      AppDataSource.getRepository(Domaine).count(),
=======
  // ==========================================================================
  // 🎓 ATTESTATIONS
  // ==========================================================================
  static async attestationsCSV(): Promise<string> {
    const attestations = await attestationRepository.findMany({
      relations: ['participant', 'session', 'session.formation'],
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      order: { dateEmission: 'DESC' },
    });

    const data = attestations.map((a) => ({
      numero: a.numero,
<<<<<<< HEAD
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

=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
    return this.toCSV(data, [
      { key: 'numero', label: 'N° Attestation' },
      { key: 'nom', label: 'Nom' },
      { key: 'prenom', label: 'Prénom' },
      { key: 'email', label: 'Email' },
      { key: 'formation', label: 'Formation' },
<<<<<<< HEAD
      { key: 'domaine', label: 'Domaine' },
      { key: 'noteFinale', label: 'Note finale' },
      { key: 'tauxPresence', label: 'Présence' },
      { key: 'dateEmission', label: 'Émis le' },
=======
      { key: 'noteFinale', label: 'Note finale' },
      { key: 'tauxPresence', label: 'Présence' },
      { key: 'dateEmission', label: 'Émise le' },
      { key: 'valide', label: 'Valide' },
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
      { key: 'hash', label: 'Hash' },
>>>>>>> origin/main
    ]);

    return {
      utilisateurs,
      formations,
      inscriptions,
      attestations,
      sessions,
      partenaires,
      domaines,
    };
  }

<<<<<<< HEAD
  /* ==========================================================================
     EXPORT PERSONNALISÉ
     ========================================================================== */
  static async exportCustom(
    type: string,
    format: 'csv' | 'pdf',
    _filters?: any,
  ): Promise<string | Buffer> {
    switch (type) {
      case 'utilisateurs':
        return this.exportUtilisateurs(format);
      case 'formations':
        return this.exportFormations(format);
      case 'inscriptions':
        return this.exportInscriptions(format);
      case 'attestations':
        return this.exportAttestations(format);
      case 'sessions':
        return this.exportSessions(format);
      case 'partenaires':
        return this.exportPartenaires(format);
      case 'domaines':
        return this.exportDomaines(format);
      case 'audit-logs':
        return this.exportAuditLogs(format, _filters);
      default:
        throw new Error(`Type non supporté : ${type}`);
    }
=======
<<<<<<< HEAD
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
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
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
<<<<<<< HEAD
            <div class="titre">${params.titre}</div>
=======
            <div class="titre">${this.escapeHtml(params.titre)}</div>
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
          </div>
          <div class="meta">
            Généré le : ${new Date().toLocaleString('fr-FR')}<br>
            Total : ${params.lignes.length} entrée(s)
          </div>
        </div>
<<<<<<< HEAD

        <table>
          <thead>
            <tr>
              ${params.colonnes.map((c) => `<th>${c}</th>`).join('')}
            </tr>
=======
        <table>
          <thead>
            <tr>${params.colonnes.map((c) => `<th>${this.escapeHtml(c)}</th>`).join('')}</tr>
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
          </thead>
          <tbody>
            ${params.lignes
              .map(
                (row) =>
<<<<<<< HEAD
                  `<tr>${row.map((cell) => `<td>${cell ?? ''}</td>`).join('')}</tr>`
=======
                  `<tr>${row
                    .map((cell) => `<td>${this.escapeHtml(String(cell ?? ''))}</td>`)
                    .join('')}</tr>`,
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
              )
              .join('')}
          </tbody>
        </table>
<<<<<<< HEAD

=======
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
        <div class="footer">
          Orange Digital Center • contact@odc.mg • odc.orange.mg
        </div>
      </body>
      </html>
    `;

    return PdfService.genererBufferDepuisHtml(html);
  }

<<<<<<< HEAD
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
=======
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
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
  ): Promise<string> {
    const fs = await import('fs/promises');
    const path = await import('path');

<<<<<<< HEAD
    const dir = path.join(process.cwd(), 'uploads', 'exports');
    await fs.mkdir(dir, { recursive: true });

    const fullPath = path.join(dir, filename);
    await fs.writeFile(fullPath, contenu);

    logger.info(`📤 Export sauvegardé : /uploads/exports/${filename}`);
    return `/uploads/exports/${filename}`;
=======
    // Sécurité : empêcher path traversal
    const safeName = path.basename(filename).replace(/[^a-zA-Z0-9._-]/g, '_');

    const dir = path.join(process.cwd(), 'uploads', 'exports');
    await fs.mkdir(dir, { recursive: true });

    const fullPath = path.join(dir, safeName);
    await fs.writeFile(fullPath, contenu);

    logger.info(`📤 Export sauvegardé : /uploads/exports/${safeName}`);
    return `/uploads/exports/${safeName}`;
>>>>>>> e54f154096b5eb84c5aa87e97113c8162d284234
>>>>>>> origin/main
  }
}