'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Menu, X, Search, LayoutDashboard,
  User, LogIn, LogOut, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_DASHBOARD } from '@/constants/routes';

/* ============================================================================
   LIENS DE NAVIGATION
   ============================================================================ */
const NAV_LINKS = [
  { href: '/formations',   label: 'Formations' },
  { href: '/sessions',     label: 'Sessions' },
  { href: '/domaines',     label: 'Domaines' },
  { href: '/partenaires',  label: 'Partenaires' },
  { href: '/a-propos',     label: 'À propos' },
  { href: '/contact',      label: 'Contact' },
] as const;

export function PublicNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  /* Effet scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Fermer le menu mobile lors d'un changement de route */
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  const dashboardHref = user
    ? ROLE_DASHBOARD[user.role] ?? '/'
    : '/connexion';

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-odc-border bg-odc-surface/95 backdrop-blur-md shadow-odc-sm'
          : 'border-b border-transparent bg-odc-surface/80 backdrop-blur-sm',
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        {/* ====================================================================
            LOGO
            ==================================================================== */}
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

        {/* ====================================================================
            NAVIGATION DESKTOP
            ==================================================================== */}
        <nav
          className="hidden lg:flex items-center gap-1"
          aria-label="Navigation principale"
        >
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href ||
              pathname.startsWith(link.href + '/');
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

        {/* ====================================================================
            ACTIONS
            ==================================================================== */}
        <div className="flex items-center gap-2">
          {/* Search (desktop) */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:inline-flex h-9 w-9"
            aria-label="Rechercher"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Theme toggle */}
          <ThemeToggle />

          {/* Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full pl-1 pr-2 py-1 hover:bg-odc-surface-alt transition-colors"
                aria-expanded={userMenuOpen}
                aria-haspopup="menu"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-odc-500 to-odc-700 flex items-center justify-center text-white font-medium text-xs">
                  {user.prenom?.charAt(0)}
                  {user.nom?.charAt(0)}
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-odc-muted transition-transform',
                    userMenuOpen && 'rotate-180',
                  )}
                />
              </button>

              {userMenuOpen && (
                <>
                  {/* Overlay */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                    aria-hidden="true"
                  />
                  {/* Menu */}
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-odc-border bg-odc-surface shadow-odc-lg p-1 z-50 animate-scale-in">
                    <div className="px-3 py-2 border-b border-odc-border">
                      <p className="text-sm font-medium truncate">
                        {user.prenom} {user.nom}
                      </p>
                      <p className="text-xs text-odc-muted truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href={dashboardHref}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-odc-surface-alt transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Mon tableau de bord
                    </Link>
                    <Link
                      href={`${dashboardHref.replace('/dashboard', '')}/profil`}
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-odc-surface-alt transition-colors"
                    >
                      <User className="h-4 w-4" />
                      Mon profil
                    </Link>
                    <div className="border-t border-odc-border my-1" />
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm text-odc-error hover:bg-odc-error-bg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Se déconnecter
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
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
          )}

          {/* Menu mobile toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* ====================================================================
          MENU MOBILE
          ==================================================================== */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-odc-border bg-odc-surface animate-slide-in-down">
          <nav className="container-page py-4 space-y-1" aria-label="Navigation mobile">
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

            {!user && (
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
          </nav>
        </div>
      )}
    </header>
  );
}