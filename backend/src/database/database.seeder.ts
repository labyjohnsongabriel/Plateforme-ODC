// src/database/database.seeder.ts
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from '../entities/Role.entity';
import { Permission } from '../entities/Permission.entity';
import { User } from '../entities/User.entity';
import { RoleName } from '../entities/enums';

/* ============================================================================
   DONNÉES
   ============================================================================ */

const ROLES_DATA: Array<Partial<Role>> = [
  {
    nom: RoleName.ADMINISTRATEUR,
    libelle: 'Administrateur',
    description: 'Accès total à la plateforme',
    niveauHierarchie: 100,
    couleur: '#DC2626',
    icone: 'Shield',
    estSysteme: true,
  },
  {
    nom: RoleName.STAFF_ODC,
    libelle: 'Staff ODC',
    description: 'Gestion des formations et sessions',
    niveauHierarchie: 80,
    couleur: '#2563EB',
    icone: 'Users',
    estSysteme: true,
  },
  {
    nom: RoleName.FORMATEUR,
    libelle: 'Formateur',
    description: 'Animation des sessions de formation',
    niveauHierarchie: 60,
    couleur: '#16A34A',
    icone: 'GraduationCap',
    estSysteme: true,
  },
  {
    nom: RoleName.PARTENAIRE,
    libelle: 'Partenaire',
    description: 'Organisation partenaire de l\'ODC',
    niveauHierarchie: 40,
    couleur: '#9333EA',
    icone: 'Building2',
    estSysteme: true,
  },
  {
    nom: RoleName.PARTICIPANT,
    libelle: 'Participant',
    description: 'Apprenant suivant des formations',
    niveauHierarchie: 20,
    couleur: '#FF7900',
    icone: 'User',
    estSysteme: true,
  },
];

const PERMISSIONS_DATA: Array<Partial<Permission>> = [
  { code: 'formations.view', libelle: 'Voir les formations', categorie: 'formations' },
  { code: 'formations.create', libelle: 'Créer une formation', categorie: 'formations' },
  { code: 'formations.edit', libelle: 'Modifier une formation', categorie: 'formations' },
  { code: 'formations.delete', libelle: 'Supprimer une formation', categorie: 'formations' },
  { code: 'formations.publish', libelle: 'Publier une formation', categorie: 'formations' },
  { code: 'sessions.view', libelle: 'Voir les sessions', categorie: 'sessions' },
  { code: 'sessions.create', libelle: 'Créer une session', categorie: 'sessions' },
  { code: 'sessions.edit', libelle: 'Modifier une session', categorie: 'sessions' },
  { code: 'sessions.delete', libelle: 'Supprimer une session', categorie: 'sessions' },
  { code: 'inscriptions.view', libelle: 'Voir les inscriptions', categorie: 'inscriptions' },
  { code: 'inscriptions.create', libelle: 'Créer une inscription', categorie: 'inscriptions' },
  { code: 'inscriptions.accept', libelle: 'Accepter une inscription', categorie: 'inscriptions' },
  { code: 'inscriptions.reject', libelle: 'Refuser une inscription', categorie: 'inscriptions' },
  { code: 'presences.view', libelle: 'Voir les présences', categorie: 'presences' },
  { code: 'presences.mark', libelle: 'Marquer les présences', categorie: 'presences' },
  { code: 'notes.view', libelle: 'Voir les notes', categorie: 'notes' },
  { code: 'notes.create', libelle: 'Créer une note', categorie: 'notes' },
  { code: 'notes.edit', libelle: 'Modifier une note', categorie: 'notes' },
  { code: 'attestations.view', libelle: 'Voir les attestations', categorie: 'attestations' },
  { code: 'attestations.generate', libelle: 'Générer une attestation', categorie: 'attestations' },
  { code: 'evaluations.view', libelle: 'Voir les évaluations', categorie: 'evaluations' },
  { code: 'evaluations.create', libelle: 'Créer une évaluation', categorie: 'evaluations' },
  { code: 'ressources.view', libelle: 'Voir les ressources', categorie: 'ressources' },
  { code: 'ressources.create', libelle: 'Créer une ressource', categorie: 'ressources' },
  { code: 'ressources.edit', libelle: 'Modifier une ressource', categorie: 'ressources' },
  { code: 'users.view', libelle: 'Voir les utilisateurs', categorie: 'users' },
  { code: 'users.create', libelle: 'Créer un utilisateur', categorie: 'users' },
  { code: 'users.edit', libelle: 'Modifier un utilisateur', categorie: 'users' },
  { code: 'partenaires.view', libelle: 'Voir les partenaires', categorie: 'partenaires' },
  { code: 'partenaires.edit', libelle: 'Modifier les partenaires', categorie: 'partenaires' },
  { code: 'stats.view', libelle: 'Voir les statistiques', categorie: 'stats' },
];

const ROLE_PERMISSIONS_MAP: Record<RoleName, string[]> = {
  [RoleName.ADMINISTRATEUR]: ['*'],
  [RoleName.STAFF_ODC]: [
    'formations.view', 'formations.create', 'formations.edit', 'formations.delete', 'formations.publish',
    'sessions.view', 'sessions.create', 'sessions.edit', 'sessions.delete',
    'inscriptions.view', 'inscriptions.accept', 'inscriptions.reject',
    'presences.view', 'presences.mark',
    'notes.view', 'notes.create', 'notes.edit',
    'attestations.view', 'attestations.generate',
    'evaluations.view',
    'ressources.view', 'ressources.create', 'ressources.edit',
    'users.view',
    'partenaires.view', 'partenaires.edit',
    'stats.view',
  ],
  [RoleName.FORMATEUR]: [
    'formations.view',
    'sessions.view', 'sessions.edit',
    'presences.view', 'presences.mark',
    'notes.view', 'notes.create', 'notes.edit',
    'evaluations.view',
    'ressources.view', 'ressources.create', 'ressources.edit',
  ],
  [RoleName.PARTENAIRE]: [
    'formations.view',
    'sessions.view',
    'partenaires.view', 'partenaires.edit',
    'stats.view',
  ],
  [RoleName.PARTICIPANT]: [
    'formations.view',
    'sessions.view',
    'inscriptions.create',
    'attestations.view',
    'notes.view',
    'evaluations.create',
    'ressources.view',
  ],
};

/* ============================================================================
   SEEDER PRINCIPAL
   ============================================================================ */

export class DatabaseSeeder {
  private roleRepo: Repository<Role>;
  private permissionRepo: Repository<Permission>;
  private userRepo: Repository<User>;

  constructor(private dataSource: DataSource) {
    this.roleRepo = dataSource.getRepository(Role);
    this.permissionRepo = dataSource.getRepository(Permission);
    this.userRepo = dataSource.getRepository(User);
  }

  /**
   * Exécute tous les seeders. Idempotent.
   */
  async run(): Promise<void> {
    console.log('\n🌱 Démarrage du seed…\n');
    await this.seedPermissions();
    await this.seedRoles();
    await this.seedAdmin();
    console.log('\n🎉 Seed terminé\n');
  }

  /* -------------------------------------------------------------------- */
  /* 1. PERMISSIONS                                                        */
  /* -------------------------------------------------------------------- */
  private async seedPermissions(): Promise<void> {
    console.log('🔑 Permissions…');
    let created = 0;

    for (const data of PERMISSIONS_DATA) {
      const existing = await this.permissionRepo.findOne({
        where: { code: data.code },
        withDeleted: true,
      });

      if (!existing) {
        await this.permissionRepo.save(this.permissionRepo.create(data));
        created++;
      }
    }

    console.log(`   ✅ ${created} créée(s), ${PERMISSIONS_DATA.length - created} existante(s)`);
  }

  /* -------------------------------------------------------------------- */
  /* 2. RÔLES + LIAISONS                                                   */
  /* -------------------------------------------------------------------- */
  private async seedRoles(): Promise<void> {
    console.log('👥 Rôles…');
    const permissionByCode = new Map<string, Permission>();

    for (const p of await this.permissionRepo.find()) {
      permissionByCode.set(p.code, p);
    }

    for (const data of ROLES_DATA) {
      let role = await this.roleRepo.findOne({
        where: { nom: data.nom },
        relations: ['permissions'],
      });

      if (!role) {
        role = this.roleRepo.create(data);
        role = await this.roleRepo.save(role);
        console.log(`   ✅ ${data.libelle} créé`);
      } else {
        console.log(`   ✓ ${data.libelle} existe déjà`);
      }

      /* -------------------- Liaisons -------------------- */
      const codes = ROLE_PERMISSIONS_MAP[data.nom as RoleName];
      if (!codes) continue;

      const targetCodes = codes.includes('*')
        ? PERMISSIONS_DATA.map((p) => p.code!)
        : codes;

      const currentCodes = new Set(role.permissions?.map((p) => p.code) ?? []);
      const toAdd = targetCodes
        .filter((c) => !currentCodes.has(c))
        .map((c) => permissionByCode.get(c))
        .filter((p): p is Permission => !!p);

      if (toAdd.length > 0) {
        role.permissions = [...(role.permissions ?? []), ...toAdd];
        await this.roleRepo.save(role);
        console.log(`      🔗 +${toAdd.length} permission(s)`);
      }
    }
  }

  /* -------------------------------------------------------------------- */
  /* 3. ADMIN                                                              */
  /* -------------------------------------------------------------------- */
  private async seedAdmin(): Promise<void> {
    console.log('\n👤 Admin par défaut…');

    const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@odc.mg';
    const password = process.env.SEED_ADMIN_PASSWORD ?? 'Admin123!';

    const existing = await this.userRepo.findOne({ where: { email } });
    if (existing) {
      console.log(`   ✓ Admin existe déjà (${email})`);
      return;
    }

    const role = await this.roleRepo.findOne({
      where: { nom: RoleName.ADMINISTRATEUR },
    });

    if (!role) {
      console.log('   ⚠️  Rôle ADMINISTRATEUR introuvable');
      return;
    }

    const hashed = await bcrypt.hash(password, 10);

    await this.userRepo.save(
      this.userRepo.create({
        nom: 'Admin',
        prenom: 'ODC',
        email,
        motDePasse: hashed,
        roleId: role.id,
        actif: true,
        emailVerifie: true,
      }),
    );

    console.log(`   ✅ Admin créé`);
    console.log(`      📧 ${email}`);
    console.log(`      🔑 ${password}`);
  }
}