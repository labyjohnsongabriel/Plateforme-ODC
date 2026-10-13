// src/components/layout/public/PublicNavbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Menu,
  X,
  Search,
  LayoutDashboard,
  User,
  LogIn,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext'; // ⭐ BON IMPORT
import { getDashboardRoute } from '@/lib/routes';          // ⭐ BON IMPORT

/* ============================================================================
   LIENS DE NAVIGATION
   ============================================================================ */

const NAV_LINKS = [
  { href: '/formations', label: 'Formations' },
  { href: '/sessions', label: 'Sessions' },
  { href: '/domaines', label: 'Domaines' },
  { href: '/partenaires', label: 'Partenaires' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
] as const;

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function PublicNavbar() {
  const pathname = usePathname();

  // ⭐ Utiliser useAuthContext (le bon hook)
  const { user, isAuthenticated, isHydrated, logout } = useAuthContext();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  /* -------------------- Montage -------------------- */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* -------------------- Scroll -------------------- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* -------------------- Fermer menus au changement de route -------------------- */
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  /* ============================================================================
     ⭐ CORRECTION DE LA LIGNE 50
     ============================================================================
     - `user?.role?.nom` (accès sécurisé au nom du rôle)
     - `getDashboardRoute()` (fonction qui gère le mapping)
     - `?? '/connexion'` (fallback sûr)
     ============================================================================ */
  const dashboardHref = isAuthenticated && user
    ? getDashboardRoute(user.role?.nom)
    : '/connexion';

  /* -------------------- Profil link -------------------- */
  const profileHref = dashboardHref !== '/connexion'
    ? `${dashboardHref.replace('/dashboard', '')}/profil`
    : '/profil';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-odc-border bg-odc-surface/95 backdrop-blur-md shadow-odc-sm'
          : 'border-b border-transparent bg-odc-surface/80 backdrop-blur-sm',
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* ================================================================ */}
          {/* LOGO                                                              */}
          {/* ================================================================ */}
          <Link
            href="/"
            className="flex items-center gap-2.5 shrink-0 group"
            aria-label="ODC Platform — Accueil"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-odc-500 to-odc-700 text-white font-display font-bold text-sm shadow-odc-sm group-hover:shadow-odc-md transition-shadow">
              ODC
            </div>
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="font-display font-bold text-sm">
                Orange Digital Center
              </span>
              <span className="text-xs text-odc-muted">Madagascar</span>
            </div>
          </Link>

          {/* ================================================================ */}
          {/* NAVIGATION DESKTOP                                                */}
          {/* ================================================================ */}
          <nav
            className="hidden lg:flex items-center gap-1"
            aria-label="Navigation principale"
          >
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href || pathname?.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'text-odc-primary'
                      : 'text-odc-text-secondary hover:text-odc-primary hover:bg-odc-primary-soft/50',
                  )}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full bg-odc-primary" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ================================================================ */}
          {/* ACTIONS                                                           */}
          {/* ================================================================ */}
          <div className="flex items-center gap-2">
            {/* -------------------- Recherche -------------------- */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:inline-flex h-9 w-9"
              aria-label="Rechercher"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* -------------------- Thème -------------------- */}
            <ThemeToggle />

            {/* -------------------- Auth -------------------- */}
            {!mounted || !isHydrated ? (
              // ⭐ Placeholder pendant l'hydratation (évite le mismatch SSR)
              <div className="hidden md:block h-9 w-32 rounded-md bg-odc-surface-alt animate-pulse" />
            ) : isAuthenticated && user ? (
              <UserMenu
                user={user}
                dashboardHref={dashboardHref}
                profileHref={profileHref}
                open={userMenuOpen}
                onToggle={() => setUserMenuOpen((v) => !v)}
                onClose={() => setUserMenuOpen(false)}
                onLogout={logout}
              />
            ) : (
              <GuestActions />
            )}

            {/* -------------------- Menu mobile toggle -------------------- */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* MENU MOBILE                                                       */}
      {/* ================================================================ */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-odc-border bg-odc-surface animate-in slide-in-from-top-2 duration-200">
          <nav
            className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-1"
            aria-label="Navigation mobile"
          >
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'block px-4 py-3 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-odc-primary-soft text-odc-primary'
                      : 'hover:bg-odc-surface-alt',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}

            {mounted && isHydrated && !isAuthenticated && (
              <>
                <div className="border-t border-odc-border my-3" />
                <div className="grid grid-cols-2 gap-2 px-4">
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/connexion">Connexion</Link>
                  </Button>
                  <Button variant="odc" asChild className="w-full">
                    <Link href="/inscription">S&apos;inscrire</Link>
                  </Button>
                </div>
              </>
            )}

            {mounted && isHydrated && isAuthenticated && user && (
              <>
                <div className="border-t border-odc-border my-3" />
                <Link
                  href={dashboardHref}
                  className="block px-4 py-3 rounded-md text-sm font-medium hover:bg-odc-surface-alt"
                >
                  <LayoutDashboard className="inline h-4 w-4 mr-2" />
                  Mon tableau de bord
                </Link>
                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-3 rounded-md text-sm font-medium text-odc-error hover:bg-odc-error-bg"
                >
                  <LogOut className="inline h-4 w-4 mr-2" />
                  Se déconnecter
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

/* ============================================================================
   SOUS-COMPOSANT — Menu utilisateur (desktop)
   ============================================================================ */

interface UserMenuProps {
  user: {
    nom?: string;
    prenom?: string;
    email?: string;
    role?: { nom?: string; libelle?: string };
  };
  dashboardHref: string;
  profileHref: string;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onLogout: () => void;
}

function UserMenu({
  user,
  dashboardHref,
  profileHref,
  open,
  onToggle,
  onClose,
  onLogout,
}: UserMenuProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-odc-surface-alt transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menu utilisateur"
      >
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-odc-500 to-odc-700 flex items-center justify-center text-white font-medium text-xs">
          {user.prenom?.charAt(0) ?? '?'}
          {user.nom?.charAt(0) ?? ''}
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-odc-muted transition-transform',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Menu */}
          <div
            className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-odc-border bg-odc-surface shadow-odc-lg p-1 z-50 animate-in fade-in-0 zoom-in-95 duration-150"
            role="menu"
          >
            {/* En-tête */}
            <div className="px-3 py-2 border-b border-odc-border">
              <p className="text-sm font-medium truncate">
                {user.prenom} {user.nom}
              </p>
              <p className="text-xs text-odc-muted truncate">{user.email}</p>
            </div>

            {/* Liens */}
            <Link
              href={dashboardHref}
              onClick={onClose}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-odc-surface-alt transition-colors"
              role="menuitem"
            >
              <LayoutDashboard className="h-4 w-4" />
              Mon tableau de bord
            </Link>

            <Link
              href={profileHref}
              onClick={onClose}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-odc-surface-alt transition-colors"
              role="menuitem"
            >
              <User className="h-4 w-4" />
              Mon profil
            </Link>

            <div className="border-t border-odc-border my-1" />

            <button
              onClick={() => {
                onClose();
                onLogout();
              }}
              className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-odc-error hover:bg-odc-error-bg transition-colors"
              role="menuitem"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================================
   SOUS-COMPOSANT — Actions invité
   ============================================================================ */

function GuestActions() {
  return (
    <div className="hidden md:flex items-center gap-2">
      <Button variant="ghost" asChild>
        <Link href="/connexion">
          <LogIn className="h-4 w-4 mr-1.5" />
          Connexion
        </Link>
      </Button>
      <Button variant="odc" asChild>
        <Link href="/inscription">S&apos;inscrire</Link>
      </Button>
    </div>
  );
}