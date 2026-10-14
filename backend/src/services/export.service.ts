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

    qb.orderBy('d.ordreAffichage', 'ASC');

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
  }
}