// src/lib/roles.ts
import {
  Shield,
  Users,
  GraduationCap,
  UserCircle,
  Handshake,
  type LucideIcon,
} from 'lucide-react';

export type RoleKey =
  | 'admin'
  | 'staff'
  | 'formateur'
  | 'participant'
  | 'partenaire'
  | 'default';

export interface RoleMeta {
  key: RoleKey;
  label: string;
  icon: LucideIcon;
  /** classes tailwind pour le badge (orange, light + dark) */
  badgeClass: string;
}

const ORANGE_BADGE =
  'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300';

const ROLES: Record<RoleKey, RoleMeta> = {
  admin: {
    key: 'admin',
    label: 'Administrateur',
    icon: Shield,
    badgeClass: ORANGE_BADGE,
  },
  staff: {
    key: 'staff',
    label: 'Staff',
    icon: Users,
    badgeClass: ORANGE_BADGE,
  },
  formateur: {
    key: 'formateur',
    label: 'Formateur',
    icon: GraduationCap,
    badgeClass: ORANGE_BADGE,
  },
  participant: {
    key: 'participant',
    label: 'Participant',
    icon: UserCircle,
    badgeClass: ORANGE_BADGE,
  },
  partenaire: {
    key: 'partenaire',
    label: 'Partenaire',
    icon: Handshake,
    badgeClass: ORANGE_BADGE,
  },
  default: {
    key: 'default',
    label: 'Utilisateur',
    icon: UserCircle,
    badgeClass: ORANGE_BADGE,
  },
};

/**
 * Résout les métadonnées d'un rôle à partir de son nom (API)
 * ex: "ADMIN", "admin", "Administrateur" → RoleMeta admin
 */
export function getRoleMeta(
  roleNom?: string | null,
  roleLibelle?: string | null,
): RoleMeta {
  const raw = (roleNom ?? roleLibelle ?? '').toString().trim().toLowerCase();

  if (raw.includes('admin')) return ROLES.admin;
  if (raw.includes('staff')) return ROLES.staff;
  if (raw.includes('formateur') || raw.includes('trainer')) return ROLES.formateur;
  if (raw.includes('participant') || raw.includes('apprenant'))
    return ROLES.participant;
  if (raw.includes('partenaire') || raw.includes('partner'))
    return ROLES.partenaire;

  // si libelle fourni, on l'utilise pour l'affichage
  if (roleLibelle) {
    return { ...ROLES.default, label: roleLibelle };
  }

  return ROLES.default;
}