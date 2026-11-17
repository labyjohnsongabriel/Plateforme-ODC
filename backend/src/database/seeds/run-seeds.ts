// src/database/seeds/run-seeds.ts
import 'reflect-metadata';
import AppDataSource from '../../data-source';
import { Role } from '../../entities/Role.entity';
import { User } from '../../entities/User.entity';
import { Formation } from '../../entities/Formation.entity';
import { Session } from '../../entities/Session.entity';
import { Domaine } from '../../entities/Domaine.entity';
import { Partenaire } from '../../entities/Partenaire.entity';

// ⭐ Tous les enums depuis enums.ts
import {
  RoleName,
  NiveauFormation,
  StatutSession,
//ModaliteSession,
} from '../../entities/enums';

import { hashPassword } from '../../utils/password.util';
import { logger } from '../../config/logger';

/* ============================================================================
   HELPERS
   ============================================================================ */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

/* ============================================================================
   SEED
   ============================================================================ */

async function seed() {
  try {
    await AppDataSource.initialize();
    logger.info('🌱 Démarrage des seeds...');
    logger.info('');

    /* ========================================================================
       1. RÔLES
       ======================================================================== */
    const roleRepo = AppDataSource.getRepository(Role);

    const rolesData = [
      {
        nom: RoleName.ADMINISTRATEUR,   // ⭐ Pas ADMIN
        libelle: 'Administrateur',
        description: 'Administrateur de la plateforme',
        niveauHierarchie: 100,
        couleur: '#DC2626',
        icone: 'Shield',
      },
      {
        nom: RoleName.STAFF_ODC,        // ⭐ Pas STAFF
        libelle: 'Staff ODC',
        description: 'Personnel ODC',
        niveauHierarchie: 80,
        couleur: '#2563EB',
        icone: 'Users',
      },
      {
        nom: RoleName.FORMATEUR,
        libelle: 'Formateur',
        description: 'Formateur',
        niveauHierarchie: 60,
        couleur: '#16A34A',
        icone: 'GraduationCap',
      },
      {
        nom: RoleName.PARTENAIRE,
        libelle: 'Partenaire',
        description: 'Partenaire externe',
        niveauHierarchie: 40,
        couleur: '#9333EA',
        icone: 'Building2',
      },
      {
        nom: RoleName.PARTICIPANT,
        libelle: 'Participant',
        description: 'Participant aux formations',
        niveauHierarchie: 20,
        couleur: '#FF7900',
        icone: 'User',
      },
    ];

    const roles: Record<string, Role> = {};

    for (const r of rolesData) {
      let role = await roleRepo.findOne({ where: { nom: r.nom } });

      if (!role) {
        const created = roleRepo.create({
          ...r,
          actif: true,
          estSysteme: true,
        });
        role = await roleRepo.save(created);
        logger.info(`✅ Rôle créé : ${r.nom}`);
      } else {
        logger.info(`ℹ️  Rôle existant : ${r.nom}`);
      }

      roles[r.nom] = role;
    }

    /* ========================================================================
       2. DOMAINES (⭐ création automatique)
       ======================================================================== */
    const domaineRepo = AppDataSource.getRepository(Domaine);

    const domainesData = [
      { nom: 'Développement Web', couleur: '#FF7900', icone: 'Code' },
      { nom: 'Data & IA', couleur: '#2563EB', icone: 'Brain' },
      { nom: 'Cybersécurité', couleur: '#DC2626', icone: 'Shield' },
      { nom: 'Design UX/UI', couleur: '#EC4899', icone: 'Palette' },
      { nom: 'Marketing Digital', couleur: '#EAB308', icone: 'TrendingUp' },
    ];

    const domaines: Record<string, Domaine> = {};

    for (const d of domainesData) {
      const slug = slugify(d.nom);
      let domaine = await domaineRepo.findOne({ where: { slug } });

      if (!domaine) {
        const created = domaineRepo.create({
          nom: d.nom,
          slug,
          description: `Formations en ${d.nom}`,
          couleur: d.couleur,
          icone: d.icone,
          ordreAffichage: 0,
          actif: true,
          estPubliee: true,
        });
        domaine = await domaineRepo.save(created);
        logger.info(`✅ Domaine créé : ${d.nom}`);
      } else {
        logger.info(`ℹ️  Domaine existant : ${d.nom}`);
      }

      domaines[d.nom] = domaine;
    }

    /* ========================================================================
       3. UTILISATEURS
       ======================================================================== */
    const userRepo = AppDataSource.getRepository(User);
    const defaultPassword = await hashPassword('Password123');

    const usersData = [
      {
        nom: 'Admin',
        prenom: 'Super',
        email: 'admin@odc.mg',
        roleNom: RoleName.ADMINISTRATEUR,
      },
      {
        nom: 'Rakoto',
        prenom: 'Marie',
        email: 'staff@odc.mg',
        roleNom: RoleName.STAFF_ODC,
      },
      {
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'formateur@odc.mg',
        roleNom: RoleName.FORMATEUR,
      },
      {
        nom: 'Rasoa',
        prenom: 'Soa',
        email: 'participant@odc.mg',
        roleNom: RoleName.PARTICIPANT,
      },
      {
        nom: 'Orange',
        prenom: 'Partner',
        email: 'partenaire@odc.mg',
        roleNom: RoleName.PARTENAIRE,
      },
    ];

    const users: Record<string, User> = {};

    for (const u of usersData) {
      const existing = await userRepo.findOne({ where: { email: u.email } });

      if (existing) {
        users[u.email] = existing;
        logger.info(`ℹ️  Utilisateur existant : ${u.email}`);
        continue;
      }

      const role = roles[u.roleNom];
      if (!role) {
        logger.warn(`⚠️  Rôle ${u.roleNom} introuvable — skip ${u.email}`);
        continue;
      }

      // ⭐ UNIQUEMENT les propriétés TypeScript (camelCase)
      const data = {
        nom: u.nom,
        prenom: u.prenom,
        email: u.email.toLowerCase(),
        motDePasse: defaultPassword,           // ⭐ PAS mot_de_passe
        roleId: role.id,                       // ⭐ PAS role_id
        actif: true,
        emailVerifie: true,                    // ⭐ PAS email_verifie
      };

      const created = userRepo.create(data);
      const saved = await userRepo.save(created);
      users[u.email] = saved;

      logger.info(`✅ Utilisateur créé : ${u.email}`);
    }

    /* ========================================================================
       4. FORMATIONS
       ======================================================================== */
    const formationRepo = AppDataSource.getRepository(Formation);
    const formateurId = users['formateur@odc.mg']?.id ?? null;

    const formationsData = [
      {
        titre: 'Développement Web React',
        description: 'Maîtrisez React avec TypeScript',
        domaineNom: 'Développement Web',
        dureeHeures: 40,
        niveau: NiveauFormation.INTERMEDIAIRE,
      },
      {
        titre: 'Data Science avec Python',
        description: 'Analyse de données et machine learning',
        domaineNom: 'Data & IA',
        dureeHeures: 60,
        niveau: NiveauFormation.AVANCE,
      },
      {
        titre: 'Cybersécurité Fondamentaux',
        description: 'Bases de la sécurité informatique',
        domaineNom: 'Cybersécurité',
        dureeHeures: 30,
        niveau: NiveauFormation.DEBUTANT,
      },
      {
        titre: 'UI/UX Design',
        description: 'Concevoir des interfaces intuitives',
        domaineNom: 'Design UX/UI',
        dureeHeures: 35,
        niveau: NiveauFormation.DEBUTANT,
      },
      {
        titre: 'Marketing Digital',
        description: 'Stratégie marketing en ligne et SEO',
        domaineNom: 'Marketing Digital',
        dureeHeures: 25,
        niveau: NiveauFormation.DEBUTANT,
      },
    ];

    const formations: Formation[] = [];

    for (const f of formationsData) {
      const slug = slugify(f.titre);
      let formation = await formationRepo.findOne({ where: { slug } });

      if (!formation) {
        const domaine = domaines[f.domaineNom];
        if (!domaine) {
          logger.warn(`⚠️  Domaine ${f.domaineNom} introuvable — skip`);
          continue;
        }

        // ⭐ UNIQUEMENT les propriétés TS
        const data = {
          titre: f.titre,
          slug,
          description: f.description,
          resume: f.description.substring(0, 150),
          domaineId: domaine.id,             // ⭐ PAS domaine_id
          formateurId,                       // ⭐ PAS formateur_id
          dureeHeures: f.dureeHeures,        // ⭐ PAS duree_heures
          niveau: f.niveau,
          prix: 0,
          placesMax: 25,                     // ⭐ PAS places_max
          estPubliee: true,                  // ⭐ PAS est_publiee
          miseEnAvant: false,                // ⭐ PAS mise_en_avant
          nbVues: 0,                         // ⭐ PAS nb_vues
        };

        const created = formationRepo.create(data);
        formation = await formationRepo.save(created);
        logger.info(`✅ Formation créée : ${f.titre}`);
      } else {
        logger.info(`ℹ️  Formation existante : ${f.titre}`);
      }

      formations.push(formation);
    }

    /* ========================================================================
       5. SESSIONS
       ======================================================================== */
    const sessionRepo = AppDataSource.getRepository(Session);
    const today = new Date();

    if (formateurId && formations.length >= 3) {
      const sessionsData = [
        {
          formation: formations[0],
          dateDebut: addDays(today, 7),
          dateFin: addDays(today, 21),
          lieu: 'Salle A1 - ODC Antananarivo',
          placesMax: 25,
          statut: StatutSession.OUVERTE,
          code: 'ODC-2026-0001',
        },
        {
          formation: formations[1],
          dateDebut: addDays(today, 14),
          dateFin: addDays(today, 35),
          lieu: 'Salle B2 - ODC Antananarivo',
          placesMax: 20,
          statut: StatutSession.OUVERTE,
          code: 'ODC-2026-0002',
        },
        {
          formation: formations[2],
          dateDebut: addDays(today, -7),
          dateFin: addDays(today, 7),
          lieu: 'Salle C1 - ODC Antananarivo',
          placesMax: 30,
          statut: StatutSession.EN_COURS,
          code: 'ODC-2026-0003',
        },
      ];

      for (const s of sessionsData) {
        const existing = await sessionRepo.findOne({
          where: { codeSession: s.code },
        });

        if (existing) {
          logger.info(`ℹ️  Session existante : ${s.code}`);
          continue;
        }

        // ⭐ UNIQUEMENT les propriétés TS
        const data = {
          codeSession: s.code,               // ⭐ PAS code_session
          titre: s.formation.titre,
          formationId: s.formation.id,       // ⭐ PAS formation_id
          formateurId,                       // ⭐ PAS formateur_id
          dateDebut: s.dateDebut,            // ⭐ PAS date_debut
          dateFin: s.dateFin,                // ⭐ PAS date_fin
          lieu: s.lieu,
          modalite: ModaliteSession.PRESENTIEL,
          placesMax: s.placesMax,            // ⭐ PAS capacite
          statut: s.statut,
          estPubliee: true,                  // ⭐ PAS est_publiee
          presenceOuverte: false,
        };

        const created = sessionRepo.create(data);
        await sessionRepo.save(created);
        logger.info(`✅ Session créée : ${s.code} (${s.lieu})`);
      }
    } else {
      logger.warn('⚠️  Formateur ou formations manquants — sessions ignorées');
    }

    /* ========================================================================
       6. PARTENAIRES
       ======================================================================== */
    const partenaireRepo = AppDataSource.getRepository(Partenaire);

    const partenairesData = [
      {
        nom: 'Orange Madagascar',
        secteur: 'Télécommunications',
        description: 'Opérateur télécom partenaire principal',
        contactEmail: 'contact@orange.mg',   // ⭐ PAS contact_email
        siteWeb: 'https://orange.mg',        // ⭐ PAS site_web
      },
      {
        nom: 'Université Antananarivo',
        secteur: 'Éducation',
        description: 'Partenaire académique',
        contactEmail: 'contact@univ-antananarivo.mg',
      },
      {
        nom: 'Tech Hub Madagascar',
        secteur: 'Technologie',
        description: 'Incubateur de startups',
        contactEmail: 'hello@techhub.mg',
      },
    ];

    for (const p of partenairesData) {
      const existing = await partenaireRepo.findOne({ where: { nom: p.nom } });

      if (!existing) {
        const data = {
          nom: p.nom,
          secteur: p.secteur,
          description: p.description,
          contactEmail: p.contactEmail,      // ⭐ camelCase
          siteWeb: p.siteWeb ?? null,        // ⭐ camelCase
          estPubliee: true,
        };
        const created = partenaireRepo.create(data);
        await partenaireRepo.save(created);
        logger.info(`✅ Partenaire créé : ${p.nom}`);
      } else {
        logger.info(`ℹ️  Partenaire existant : ${p.nom}`);
      }
    }

    /* ========================================================================
       RÉSUMÉ
       ======================================================================== */
    logger.info('');
    logger.info('═══════════════════════════════════════');
    logger.info('🎉 Seeds terminés avec succès !');
    logger.info('═══════════════════════════════════════');
    logger.info('');
    logger.info('📊 Comptes de test :');
    logger.info('   👑 admin@odc.mg       / Password123');
    logger.info('   👥 staff@odc.mg       / Password123');
    logger.info('   🎓 formateur@odc.mg   / Password123');
    logger.info('   📚 participant@odc.mg / Password123');
    logger.info('   🤝 partenaire@odc.mg  / Password123');
    logger.info('');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (err: any) {
    logger.error('❌ Erreur seeds :', err);
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
    process.exit(1);
  }
}

seed();