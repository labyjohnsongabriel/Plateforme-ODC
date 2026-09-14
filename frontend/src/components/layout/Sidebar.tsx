import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
  Sparkles,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { PERMISSIONS } from '@/config/permissions.config';
import { SidebarItem } from './SidebarItem';
import { cn } from '@/utils/cn';

// ============================================================================
//  TYPES
// ============================================================================

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  permission?: string | string[];
  badge?: string | number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const SIDEBAR_STORAGE_KEY = 'odc-sidebar-collapsed';

// ============================================================================
//  CONFIGURATION DES SECTIONS
// ============================================================================

const SECTIONS: NavSection[] = [
  {
    title: 'Principal',
    items: [
      {
        to: '/dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
    ],
  },
  {
    title: 'Formations',
    items: [
      {
        to: '/formations',
        label: 'Catalogue',
        icon: BookOpen,
        permission: PERMISSIONS.FORMATIONS_VIEW,
      },
      {
        to: '/sessions',
        label: 'Sessions',
        icon: Calendar,
        permission: PERMISSIONS.SESSIONS_VIEW,
      },
      {
        to: '/inscriptions',
        label: 'Inscriptions',
        icon: ClipboardList,
        permission: [
          PERMISSIONS.INSCRIPTIONS_VIEW_ALL,
          PERMISSIONS.INSCRIPTIONS_VIEW_OWN,
        ],
      },
    ],
  },
  {
    title: 'Suivi',
    items: [
      {
        to: '/presences',
        label: 'Présences',
        icon: GraduationCap,
        permission: [
          PERMISSIONS.PRESENCES_VIEW_ALL,
          PERMISSIONS.PRESENCES_VIEW_OWN,
          PERMISSIONS.PRESENCES_SCAN,
        ],
      },
      {
        to: '/evaluations',
        label: 'Évaluations',
        icon: FileText,
        permission: PERMISSIONS.EVALUATIONS_VIEW,
      },
      {
        to: '/attestations',
        label: 'Attestations',
        icon: Award,
        permission: [
          PERMISSIONS.ATTESTATIONS_VIEW_ALL,
          PERMISSIONS.ATTESTATIONS_VIEW_OWN,
        ],
      },
    ],
  },
  {
    title: 'Communication',
    items: [
      {
        to: '/messagerie',
        label: 'Messagerie',
        icon: MessageSquare,
        permission: PERMISSIONS.MESSAGERIE_USE,
      },
      {
        to: '/notifications',
        label: 'Notifications',
        icon: Bell,
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
      {
        to: '/reseautage',
        label: 'Réseautage',
        icon: Handshake,
        permission: PERMISSIONS.RESEAUTAGE_USE,
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        to: '/inscriptions/selection',
        label: 'Sélection',
        icon: Award,
        permission: PERMISSIONS.INSCRIPTIONS_SELECT,
      },
      {
        to: '/users',
        label: 'Utilisateurs',
        icon: Users,
        permission: PERMISSIONS.USERS_VIEW,
      },
      {
        to: '/partenaires',
        label: 'Partenaires',
        icon: Handshake,
        permission: PERMISSIONS.PARTENAIRES_VIEW,
      },
    ],
  },
  {
    title: 'Mon compte',
    items: [
      {
        to: '/profile',
        label: 'Profil',
        icon: User,
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
      {
        to: '/settings',
        label: 'Paramètres',
        icon: Settings,
        permission: PERMISSIONS.SETTINGS_VIEW,
      },
    ],
  },
];

// ============================================================================
//  SIDEBAR
// ============================================================================

export function Sidebar() {
  const { user } = useAuth();
  const { can } = usePermissions();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [mobileOpen, setMobileOpen] = useState(false);

  // Persister l'état collapsed
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed]);

  // Fermer mobile au changement de route
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // ========================================================================
  //  FILTRER PAR PERMISSION
  // ========================================================================

  const filterByPermission = (items: NavItem[]): NavItem[] => {
    return items.filter((item) => {
      if (!item.permission) return true;
      const permissions = Array.isArray(item.permission)
        ? item.permission
        : [item.permission];
      return permissions.some((p) => can(p as any));
    });
  };

  // ========================================================================
  //  RENDER
  // ========================================================================

  return (
    <>
      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 h-screen z-50',
          'bg-white dark:bg-odc-surface-dark',
          'border-r border-odc-border-light dark:border-odc-border-dark',
          'flex flex-col',
          'transition-all duration-300 ease-out',
          collapsed ? 'w-20' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* ================================================================== */}
        {/* LOGO */}
        {/* ================================================================== */}
        <div
          className={cn(
            'h-16 flex items-center border-b border-odc-border-light dark:border-odc-border-dark',
            collapsed ? 'justify-center px-2' : 'justify-between px-5'
          )}
        >
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-odc-primary to-odc-primary-dark flex items-center justify-center text-white font-bold shadow-odc-md group-hover:scale-105 transition-transform">
                ODC
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-odc-success border-2 border-white dark:border-odc-surface-dark" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="font-heading font-bold text-sm text-odc-text-light dark:text-odc-text-dark truncate">
                  ODC Platform
                </div>
                <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark truncate">
                  {user?.role?.nom || 'Utilisateur'}
                </div>
              </div>
            )}
          </Link>
        </div>

        {/* ================================================================== */}
        {/* NAVIGATION */}
        {/* ================================================================== */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4">
          <div className={cn('space-y-6', collapsed ? 'px-2' : 'px-3')}>
            {SECTIONS.map((section) => {
              const visibleItems = filterByPermission(section.items);
              if (visibleItems.length === 0) return null;

              return (
                <div key={section.title}>
                  {!collapsed && (
                    <div className="px-3 mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-odc-text-muted-light dark:text-odc-text-muted-dark">
                        {section.title}
                      </span>
                    </div>
                  )}
                  <div className="space-y-1">
                    {visibleItems.map((item) => (
                      <SidebarItem
                        key={item.to}
                        to={item.to}
                        label={item.label}
                        icon={<item.icon size={20} />}
                        badge={item.badge}
                        collapsed={collapsed}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        {/* ================================================================== */}
        {/* FOOTER */}
        {/* ================================================================== */}
        <div className="border-t border-odc-border-light dark:border-odc-border-dark p-3">
          <div className={cn('mb-2', collapsed ? 'flex justify-center' : '')}>
            {collapsed ? (
              <button
                className="p-2.5 rounded-lg hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20 text-odc-text-muted-light dark:text-odc-text-muted-dark transition-colors"
                title="Aide"
              >
                <HelpCircle size={20} />
              </button>
            ) : (
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20 transition-colors text-left">
                <HelpCircle
                  size={20}
                  className="text-odc-primary flex-shrink-0"
                />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-odc-text-light dark:text-odc-text-dark">
                    Besoin d'aide ?
                  </div>
                  <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark truncate">
                    Documentation
                  </div>
                </div>
              </button>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'hidden lg:flex items-center justify-center gap-2 w-full py-2.5 rounded-lg',
              'hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20',
              'text-odc-text-muted-light dark:text-odc-text-muted-dark',
              'transition-colors text-sm font-medium'
            )}
            title={collapsed ? 'Développer' : 'Réduire'}
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span>Réduire</span>
              </>
            )}
          </button>
        </div>
      </aside>

      {/* Bouton flottant mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className={cn(
          'lg:hidden fixed bottom-6 left-6 z-30',
          'w-14 h-14 rounded-full',
          'bg-gradient-to-br from-odc-primary to-odc-primary-dark',
          'text-white shadow-odc-lg',
          'flex items-center justify-center',
          'hover:scale-105 active:scale-95 transition-transform'
        )}
        aria-label="Ouvrir le menu"
      >
        <Sparkles size={24} />
      </button>
    </>
  );
}

export default Sidebar;