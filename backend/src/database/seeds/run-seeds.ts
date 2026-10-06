import 'reflect-metadata';
import AppDataSource from '../data-source';
import { Role, RoleName } from '../../entities/Role.entity';
import { User } from '../../entities/User.entity';
import { Formation, NiveauFormation } from '../../entities/Formation.entity';
import { Session, StatutSession } from '../../entities/Session.entity';
import { Partenaire } from '../../entities/Partenaire.entity';
import { hashPassword } from '../../utils/password.util';
import { logger } from '../../config/logger';

async function seed() {
  try {
    await AppDataSource.initialize();
    logger.info('🌱 Démarrage des seeds...');

    // =========================================================================
    // 1. RÔLES
    // =========================================================================
    const roleRepo = AppDataSource.getRepository(Role);

    const rolesData = [
      { nom: RoleName.ADMIN, description: 'Administrateur de la plateforme' },
      { nom: RoleName.STAFF, description: 'Personnel ODC' },
      { nom: RoleName.FORMATEUR, description: 'Formateur' },
      { nom: RoleName.PARTICIPANT, description: 'Participant aux formations' },
      { nom: RoleName.PARTENAIRE, description: 'Partenaire externe' },
    ];

    const roles: Record<string, Role> = {};

    for (const r of rolesData) {
      let role = await roleRepo.findOne({ where: { nom: r.nom } });

      if (!role) {
        const created = roleRepo.create(r);
        role = (await roleRepo.save(created)) as unknown as Role;
        logger.info(`✅ Rôle créé : ${r.nom}`);
      } else {
        logger.info(`ℹ️  Rôle existant : ${r.nom}`);
      }

      roles[r.nom] = role;
    }

    // =========================================================================
    // 2. UTILISATEURS
    // =========================================================================
    const userRepo = AppDataSource.getRepository(User);
    const defaultPassword = await hashPassword('Password123');

    const usersData = [
      { nom: 'Admin', prenom: 'Super', email: 'admin@odc.mg', role: RoleName.ADMIN },
      { nom: 'Rakoto', prenom: 'Marie', email: 'staff@odc.mg', role: RoleName.STAFF },
      { nom: 'Dupont', prenom: 'Jean', email: 'formateur@odc.mg', role: RoleName.FORMATEUR },
      { nom: 'Rasoa', prenom: 'Soa', email: 'participant@odc.mg', role: RoleName.PARTICIPANT },
      { nom: 'Orange', prenom: 'Partner', email: 'partenaire@odc.mg', role: RoleName.PARTENAIRE },
    ];

    const users: Record<string, User> = {};

    for (const u of usersData) {
      const existing = await userRepo.findOne({ where: { email: u.email } });

      if (existing) {
        users[u.email] = existing;
        logger.info(`ℹ️  Utilisateur existant : ${u.email}`);
        continue;
      }

      const data: any = {
        nom: u.nom,
        prenom: u.prenom,
        email: u.email,
        role_id: roles[u.role].id,
        actif: true,
        motDePasse: defaultPassword,
        mot_de_passe: defaultPassword,
        emailVerifie: true,
        email_verifie: true,
      };

      const created = userRepo.create(data);
      const saved = (await userRepo.save(created)) as unknown as User;
      users[u.email] = saved;
      logger.info(`✅ Utilisateur créé : ${u.email}`);
    }

    // =========================================================================
    // 3. FORMATIONS
    // =========================================================================
    const formationRepo = AppDataSource.getRepository(Formation);

    const formationsData: any[] = [
      {
        titre: 'Développement Web React',
        description: 'Maîtrisez React avec TypeScript',
        domaine: 'WEB',
        dureeHeures: 40,
        duree_heures: 40,
        niveau: NiveauFormation.INTERMEDIAIRE,
      },
      {
        titre: 'Data Science avec Python',
        description: 'Analyse de données et machine learning',
        domaine: 'DATA',
        dureeHeures: 60,
        duree_heures: 60,
        niveau: NiveauFormation.AVANCE,
      },
      {
        titre: 'Cybersécurité Fondamentaux',
        description: 'Bases de la sécurité informatique',
        domaine: 'CYBER',
        dureeHeures: 30,
        duree_heures: 30,
        niveau: NiveauFormation.DEBUTANT,
      },
      {
        titre: 'UI/UX Design',
        description: 'Concevoir des interfaces intuitives',
        domaine: 'DESIGN',
        dureeHeures: 35,
        duree_heures: 35,
        niveau: NiveauFormation.DEBUTANT,
      },
      {
        titre: 'Intelligence Artificielle',
        description: 'Introduction au machine learning',
        domaine: 'IA',
        dureeHeures: 50,
        duree_heures: 50,
        niveau: NiveauFormation.AVANCE,
      },
    ];

    const formations: Formation[] = [];

    for (const f of formationsData) {
      let formation = await formationRepo.findOne({ where: { titre: f.titre } });

      if (!formation) {
        const created = formationRepo.create(f);
        formation = (await formationRepo.save(created)) as unknown as Formation;
        logger.info(`✅ Formation créée : ${f.titre}`);
      } else {
        logger.info(`ℹ️  Formation existante : ${f.titre}`);
      }

      formations.push(formation);
    }

    // =========================================================================
    // 4. SESSIONS
    // =========================================================================
    const sessionRepo = AppDataSource.getRepository(Session);

    const today = new Date();
    const inDays = (d: number): Date => {
      const date = new Date(today);
      date.setDate(date.getDate() + d);
      return date;
    };

    const formateurId = users['formateur@odc.mg']?.id;

    if (formateurId && formations.length >= 3) {
      const sessionsData: any[] = [
        {
          formationId: formations[0].id,
          formation_id: formations[0].id,
          formateurId,
          formateur_id: formateurId,
          dateDebut: inDays(7),
          date_debut: inDays(7),
          dateFin: inDays(21),
          date_fin: inDays(21),
          lieu: 'Salle A1 - ODC Antananarivo',
          capacite: 25,
          statut: StatutSession.OUVERTE,
        },
        {
          formationId: formations[1].id,
          formation_id: formations[1].id,
          formateurId,
          formateur_id: formateurId,
          dateDebut: inDays(14),
          date_debut: inDays(14),
          dateFin: inDays(35),
          date_fin: inDays(35),
          lieu: 'Salle B2 - ODC Antananarivo',
          capacite: 20,
          statut: StatutSession.OUVERTE,
        },
        {
          formationId: formations[2].id,
          formation_id: formations[2].id,
          formateurId,
          formateur_id: formateurId,
          dateDebut: inDays(-7),
          date_debut: inDays(-7),
          dateFin: inDays(7),
          date_fin: inDays(7),
          lieu: 'Salle C1 - ODC Antananarivo',
          capacite: 30,
          statut: StatutSession.EN_COURS,
        },
      ];

      for (const s of sessionsData) {
        const created = sessionRepo.create(s);
        await sessionRepo.save(created);
        logger.info(`✅ Session créée : ${s.lieu}`);
      }
    } else {
      logger.warn('⚠️  Formateur ou formations manquants — sessions ignorées');
    }

    // =========================================================================
    // 5. PARTENAIRES
    // =========================================================================
    const partenaireRepo = AppDataSource.getRepository(Partenaire);

    const partenairesData: any[] = [
      {
        nom: 'Orange Madagascar',
        secteur: 'Télécommunications',
        description: 'Opérateur télécom partenaire principal',
        contactEmail: 'contact@orange.mg',
        contact_email: 'contact@orange.mg',
        siteWeb: 'https://orange.mg',
        site_web: 'https://orange.mg',
      },
      {
        nom: 'Université Antananarivo',
        secteur: 'Éducation',
        description: 'Partenaire académique',
        contactEmail: 'contact@univ-antananarivo.mg',
        contact_email: 'contact@univ-antananarivo.mg',
      },
      {
        nom: 'Tech Hub Madagascar',
        secteur: 'Technologie',
        description: 'Incubateur de startups',
        contactEmail: 'hello@techhub.mg',
        contact_email: 'hello@techhub.mg',
      },
    ];

    for (const p of partenairesData) {
      const existing = await partenaireRepo.findOne({ where: { nom: p.nom } });

      if (!existing) {
        const created = partenaireRepo.create(p);
        await partenaireRepo.save(created);
        logger.info(`✅ Partenaire créé : ${p.nom}`);
      } else {
        logger.info(`ℹ️  Partenaire existant : ${p.nom}`);
      }
    }

    // =========================================================================
    // RÉSUMÉ
    // =========================================================================
    logger.info('🎉 Seeds terminés avec succès !');
    logger.info('');
    logger.info('📊 Comptes de test :');
    logger.info('   admin@odc.mg       / Password123');
    logger.info('   staff@odc.mg       / Password123');
    logger.info('   formateur@odc.mg   / Password123');
    logger.info('   participant@odc.mg / Password123');
    logger.info('   partenaire@odc.mg  / Password123');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (err: any) {
    logger.error('❌ Erreur seeds :', err);
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
    process.exit(1);
  }
}

seed();