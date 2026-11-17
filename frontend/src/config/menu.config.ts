// src/config/menu.config.ts
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  ClipboardList,
  GraduationCap,
  FileText,
  Award,
  MessageSquare,
  Bell,
  Users,
  Handshake,
  User,
  Settings,
  HelpCircle,
  Shield,
  Network,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

export type RoleName =
  | 'ADMINISTRATEUR'
  | 'STAFF_ODC'
  | 'FORMATEUR'
  | 'PARTICIPANT'
  | 'PARTENAIRE';

export interface MenuItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles?: RoleName[];
  badge?: 'notifications' | 'messages' | 'inscriptions';
  exact?: boolean;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

/* ═══════════════════════════════════════════════════════════════════════════
   MENU PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════════ */

export const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'Principal',
    items: [
      {
        to: '/dashboard',
        label: 'Tableau de bord',
        icon: LayoutDashboard,
        exact: true,
      },
    ],
  },
  {
    title: 'Formations',
    items: [
      { to: '/formations', label: 'Catalogue', icon: BookOpen },
      { to: '/sessions', label: 'Sessions', icon: Calendar },
      { to: '/inscriptions', label: 'Inscriptions', icon: ClipboardList },
    ],
  },
  {
    title: 'Suivi',
    items: [
      {
        to: '/presences',
        label: 'Présences',
        icon: GraduationCap,
        roles: ['ADMINISTRATEUR', 'STAFF_ODC', 'FORMATEUR'],
      },
      {
        to: '/evaluations',
        label: 'Évaluations',
        icon: FileText,
        roles: ['ADMINISTRATEUR', 'FORMATEUR'],
      },
      { to: '/attestations', label: 'Attestations', icon: Award },
    ],
  },
  {
    title: 'Communication',
    items: [
      {
        to: '/messagerie',
        label: 'Messagerie',
        icon: MessageSquare,
        badge: 'messages',
      },
      {
        to: '/notifications',
        label: 'Notifications',
        icon: Bell,
        badge: 'notifications',
      },
      {
        to: '/reseautage',
        label: 'Réseautage',
        icon: Network,
        roles: ['ADMINISTRATEUR', 'STAFF_ODC', 'PARTICIPANT', 'PARTENAIRE'],
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        to: '/users',
        label: 'Utilisateurs',
        icon: Users,
        roles: ['ADMINISTRATEUR', 'STAFF_ODC'],
      },
      {
        to: '/partenaires',
        label: 'Partenaires',
        icon: Handshake,
        roles: ['ADMINISTRATEUR', 'STAFF_ODC', 'PARTENAIRE'],
      },
      {
        to: '/admin/audit',
        label: 'Audit',
        icon: Shield,
        roles: ['ADMINISTRATEUR'],
      },
    ],
  },
  {
    title: 'Mon compte',
    items: [
      { to: '/profile', label: 'Profil', icon: User },
      { to: '/settings', label: 'Paramètres', icon: Settings },
      { to: '/help', label: 'Aide', icon: HelpCircle },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Filtre le menu selon le rôle de l'utilisateur.
 */
export function getMenuForRole(role?: RoleName | null): MenuSection[] {
  if (!role) return [];

  const normalized = String(role).toUpperCase() as RoleName;

  return MENU_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) => !item.roles || item.roles.includes(normalized),
    ),
  })).filter((section) => section.items.length > 0);
}

export default MENU_SECTIONS;