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
} from 'lucide-react';
import { RoleName } from '@/types/user.types';

// ============================================================================
//  TYPES
// ============================================================================

export interface MenuItem {
  to: string;
  label: string;
  icon: any;
  roles?: RoleName[];
  badge?: 'notifications' | 'messages' | 'inscriptions';
  exact?: boolean;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

// ============================================================================
//  MENU PRINCIPAL
// ============================================================================

export const MENU_SECTIONS: MenuSection[] = [
  {
    title: 'Principal',
    items: [
      {
        to: '/dashboard',
        label: 'Dashboard',
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
        roles: [RoleName.ADMIN, RoleName.STAFF, RoleName.FORMATEUR],
      },
      {
        to: '/evaluations',
        label: 'Évaluations',
        icon: FileText,
        roles: [RoleName.ADMIN, RoleName.FORMATEUR],
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
      { to: '/reseautage', label: 'Réseautage', icon: Handshake },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        to: '/users',
        label: 'Utilisateurs',
        icon: Users,
        roles: [RoleName.ADMIN, RoleName.STAFF],
      },
      {
        to: '/partenaires',
        label: 'Partenaires',
        icon: Handshake,
        roles: [RoleName.ADMIN, RoleName.STAFF, RoleName.PARTENAIRE],
      },
      {
        to: '/admin/audit',
        label: 'Audit',
        icon: Shield,
        roles: [RoleName.ADMIN],
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

// ============================================================================
//  HELPERS
// ============================================================================

export function getMenuForRole(role?: RoleName | null): MenuSection[] {
  if (!role) return [];

  return MENU_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => !item.roles || item.roles.includes(role)),
  })).filter((section) => section.items.length > 0);
}

export default MENU_SECTIONS;