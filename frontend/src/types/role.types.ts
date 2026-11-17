export const RoleName = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  FORMATEUR: 'FORMATEUR',
  PARTICIPANT: 'PARTICIPANT',
  PARTENAIRE: 'PARTENAIRE',
  ADMINISTRATEUR: 'ADMINISTRATEUR',
  STAFF_ODC: 'STAFF_ODC',
} as const;

export type RoleName = (typeof RoleName)[keyof typeof RoleName];

export type AppRoleName =
  | 'ADMINISTRATEUR'
  | 'STAFF_ODC'
  | 'FORMATEUR'
  | 'PARTICIPANT'
  | 'PARTENAIRE';

export const ROLE_LABELS: Record<AppRoleName, string> = {
  ADMINISTRATEUR: 'Administrateur',
  STAFF_ODC: 'Staff ODC',
  FORMATEUR: 'Formateur',
  PARTICIPANT: 'Participant',
  PARTENAIRE: 'Partenaire',
};

export const ROLE_COLORS: Record<
  AppRoleName,
  { name: string; bg: string; text: string; border: string; hex: string }
> = {
  ADMINISTRATEUR: {
    name: 'red',
    bg: 'bg-red-100 dark:bg-red-950',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-200 dark:border-red-900',
    hex: '#DC2626',
  },
  STAFF_ODC: {
    name: 'orange',
    bg: 'bg-orange-100 dark:bg-orange-950',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-200 dark:border-orange-900',
    hex: '#FF7900',
  },
  FORMATEUR: {
    name: 'blue',
    bg: 'bg-blue-100 dark:bg-blue-950',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-200 dark:border-blue-900',
    hex: '#2563EB',
  },
  PARTICIPANT: {
    name: 'green',
    bg: 'bg-green-100 dark:bg-green-950',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-200 dark:border-green-900',
    hex: '#16A34A',
  },
  PARTENAIRE: {
    name: 'purple',
    bg: 'bg-purple-100 dark:bg-purple-950',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-200 dark:border-purple-900',
    hex: '#9333EA',
  },
};

export const ROLE_COLORS_SIMPLE: Record<AppRoleName, string> = {
  ADMINISTRATEUR: 'red',
  STAFF_ODC: 'orange',
  FORMATEUR: 'blue',
  PARTICIPANT: 'green',
  PARTENAIRE: 'purple',
};

export const ROLE_ICONS: Record<AppRoleName, string> = {
  ADMINISTRATEUR: 'Shield',
  STAFF_ODC: 'Users',
  FORMATEUR: 'GraduationCap',
  PARTICIPANT: 'User',
  PARTENAIRE: 'Building2',
};

export const ROLE_HIERARCHY: Record<AppRoleName, number> = {
  ADMINISTRATEUR: 100,
  STAFF_ODC: 80,
  FORMATEUR: 60,
  PARTENAIRE: 40,
  PARTICIPANT: 20,
};

export const ROLE_DESCRIPTIONS: Record<AppRoleName, string> = {
  ADMINISTRATEUR: 'Accès total à la plateforme',
  STAFF_ODC: 'Gestion des formations et sessions',
  FORMATEUR: 'Animation des sessions de formation',
  PARTICIPANT: 'Apprenant suivant des formations',
  PARTENAIRE: "Organisation partenaire de l'ODC",
};

export enum PermissionCode {
  USER_CREATE = 'users.create',
  USER_READ = 'users.read',
  USER_UPDATE = 'users.update',
  USER_DELETE = 'users.delete',
  USER_CHANGE_ROLE = 'users.change_role',
  FORMATION_CREATE = 'formations.create',
  FORMATION_READ = 'formations.read',
  FORMATION_UPDATE = 'formations.update',
  FORMATION_DELETE = 'formations.delete',
  SESSION_CREATE = 'sessions.create',
  SESSION_READ = 'sessions.read',
  SESSION_UPDATE = 'sessions.update',
  SESSION_DELETE = 'sessions.delete',
  INSCRIPTION_CREATE = 'inscriptions.create',
  INSCRIPTION_READ = 'inscriptions.read',
  INSCRIPTION_SELECT = 'inscriptions.select',
  PRESENCE_SCAN = 'presences.scan',
  PRESENCE_MANAGE = 'presences.manage',
  EVALUATION_CREATE = 'evaluations.create',
  EVALUATION_GRADE = 'evaluations.grade',
  ATTESTATION_GENERATE = 'attestations.generate',
  ATTESTATION_DOWNLOAD = 'attestations.download',
  ADMIN_AUDIT = 'admin.audit',
  ADMIN_CONFIG = 'admin.config',
}

export interface Permission {
  id: string;
  code: string;
  libelle: string;
  categorie?: string;
  description?: string;
}

export interface Role {
  id: string;
  nom: AppRoleName;
  libelle: string;
  description?: string | null;
  niveauHierarchie: number;
  couleur?: string | null;
  icone?: string | null;
  actif: boolean;
  estSysteme: boolean;
  permissions?: Permission[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleSummary {
  id?: string;
  nom: AppRoleName;
  libelle?: string;
  permissions?: Permission[];
}

export interface RoleWithPermissions {
  id: string;
  nom: AppRoleName;
  description?: string;
  permissions: Permission[];
}

const ADMIN_PERMISSIONS = Object.values(PermissionCode);
const STAFF_PERMISSIONS = [
  PermissionCode.USER_READ,
  PermissionCode.FORMATION_CREATE,
  PermissionCode.FORMATION_READ,
  PermissionCode.FORMATION_UPDATE,
  PermissionCode.SESSION_CREATE,
  PermissionCode.SESSION_READ,
  PermissionCode.SESSION_UPDATE,
  PermissionCode.INSCRIPTION_READ,
  PermissionCode.INSCRIPTION_SELECT,
  PermissionCode.PRESENCE_MANAGE,
  PermissionCode.ATTESTATION_GENERATE,
];
const FORMATEUR_PERMISSIONS = [
  PermissionCode.FORMATION_READ,
  PermissionCode.SESSION_READ,
  PermissionCode.INSCRIPTION_READ,
  PermissionCode.PRESENCE_SCAN,
  PermissionCode.PRESENCE_MANAGE,
  PermissionCode.EVALUATION_CREATE,
  PermissionCode.EVALUATION_GRADE,
];
const PARTICIPANT_PERMISSIONS = [
  PermissionCode.FORMATION_READ,
  PermissionCode.SESSION_READ,
  PermissionCode.INSCRIPTION_CREATE,
  PermissionCode.INSCRIPTION_READ,
  PermissionCode.PRESENCE_SCAN,
  PermissionCode.ATTESTATION_DOWNLOAD,
];
const PARTENAIRE_PERMISSIONS = [
  PermissionCode.FORMATION_READ,
  PermissionCode.SESSION_READ,
];

export const ROLE_PERMISSIONS: Record<RoleName, PermissionCode[]> = {
  ADMIN: ADMIN_PERMISSIONS,
  ADMINISTRATEUR: ADMIN_PERMISSIONS,
  STAFF: STAFF_PERMISSIONS,
  STAFF_ODC: STAFF_PERMISSIONS,
  FORMATEUR: FORMATEUR_PERMISSIONS,
  PARTICIPANT: PARTICIPANT_PERMISSIONS,
  PARTENAIRE: PARTENAIRE_PERMISSIONS,
};

export function getRoleLabel(role?: RoleName | string | null): string {
  if (!role) return '—';
  return ROLE_LABELS[role as AppRoleName] ?? role;
}

export function getRoleClasses(role?: RoleName | string | null) {
  if (!role || !(role in ROLE_COLORS)) {
    return {
      name: 'gray',
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-700 dark:text-gray-300',
      border: 'border-gray-200 dark:border-gray-700',
      hex: '#6B7280',
    };
  }
  return ROLE_COLORS[role as AppRoleName];
}

export function getRoleIcon(role?: AppRoleName | null): string {
  return role ? ROLE_ICONS[role] : 'User';
}

export function getRoleLevel(role?: AppRoleName | null): number {
  return role ? ROLE_HIERARCHY[role] : 0;
}

export function hasRole(
  userRole: RoleName | string | null | undefined,
  allowedRoles: RoleName | RoleName[],
): boolean {
  if (!userRole) return false;
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return roles.includes(userRole as RoleName);
}

export function atLeastRole(
  userRole: AppRoleName | string | null | undefined,
  minRole: AppRoleName,
): boolean {
  if (!userRole) return false;
  return getRoleLevel(userRole as AppRoleName) >= getRoleLevel(minRole);
}

export function roleHasPermission(
  role: RoleName,
  permission: PermissionCode,
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function roleHasAnyPermission(
  role: RoleName,
  permissions: PermissionCode[],
): boolean {
  return permissions.some((permission) => roleHasPermission(role, permission));
}

export function roleHasAllPermissions(
  role: RoleName,
  permissions: PermissionCode[],
): boolean {
  return permissions.every((permission) => roleHasPermission(role, permission));
}

export function canManageUsers(role?: RoleName | string | null): boolean {
  return hasRole(role, [RoleName.ADMINISTRATEUR, RoleName.STAFF_ODC]);
}

export function canManageFormations(role?: RoleName | string | null): boolean {
  return canManageUsers(role);
}

export function canAnimateSessions(role?: RoleName | string | null): boolean {
  return hasRole(role, [
    RoleName.ADMINISTRATEUR,
    RoleName.STAFF_ODC,
    RoleName.FORMATEUR,
  ]);
}

export function isSystemRole(_role: AppRoleName): boolean {
  return true;
}

export const ROLE_NAMES: AppRoleName[] = [
  'ADMINISTRATEUR',
  'STAFF_ODC',
  'FORMATEUR',
  'PARTICIPANT',
  'PARTENAIRE',
];

export const BACK_OFFICE_ROLES: AppRoleName[] = [
  'ADMINISTRATEUR',
  'STAFF_ODC',
  'FORMATEUR',
];

export const FRONT_OFFICE_ROLES: AppRoleName[] = [
  'PARTICIPANT',
  'PARTENAIRE',
];

export const ADMIN_ROLES: AppRoleName[] = ['ADMINISTRATEUR', 'STAFF_ODC'];
