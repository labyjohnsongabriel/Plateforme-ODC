// src/components/layout/public/PublicNavbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Menu, X, Search, LayoutDashboard, User, LogIn, LogOut,
  ChevronDown, Settings, Shield, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { NotificationModal } from '@/components/layout/NotificationModal';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';
import { getDashboardRoute } from '@/lib/routes';
import { getMediaUrl } from '@/lib/media';

/* ═══════════════════════════════════════════════════════════════════════════
   CONSTANTES
   ═══════════════════════════════════════════════════════════════════════════ */

const NAV_LINKS = [
  { href: '/formations', label: 'Formations' },
  { href: '/sessions', label: 'Sessions' },
  { href: '/domaines', label: 'Domaines' },
  { href: '/partenaires', label: 'Partenaires' },
  { href: '/a-propos', label: 'À propos' },
  { href: '/contact', label: 'Contact' },
] as const;

const LOGO_SRC = '/images/brand/logo-odc.png';

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES DE BOUTONS — alignés sur le bouton "Se connecter" du LoginForm
   ═══════════════════════════════════════════════════════════════════════════ */

const BTN_PRIMARY =
  'h-11 rounded-lg bg-slate-900 px-5 font-medium text-white shadow-md hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200 dark:focus-visible:ring-slate-500';

const BTN_OUTLINE =
  'h-11 rounded-lg border border-slate-300 bg-transparent px-5 font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50 dark:focus-visible:ring-slate-500';

const BTN_GHOST_ICON =
  'h-9 w-9 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50 dark:focus-visible:ring-slate-500';

const BTN_DESTRUCTIVE =
  'h-11 rounded-lg px-4 font-medium text-red-600 hover:bg-red-50 hover:text-red-700 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300';

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════════ */

export function PublicNavbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, isHydrated, logout } = useAuthContext();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = original;
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen]);

  const dashboardHref =
    isAuthenticated && user ? getDashboardRoute(user.role?.nom) : '/connexion';

  const profileHref =
    dashboardHref !== '/connexion'
      ? `${dashboardHref.replace('/dashboard', '')}/profil`
      : '/profil';

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 w-full transition-all duration-500',
          scrolled
            ? 'border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95'
            : 'border-b border-transparent bg-white/80 backdrop-blur-md dark:bg-slate-950/80',
        )}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* ═══════ LOGO ═══════ */}
            <Link
              href="/"
              className="group flex shrink-0 items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:outline-none"
              aria-label="ODC Platform — Accueil"
            >
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md dark:ring-slate-800">
                <Image
                  src={LOGO_SRC}
                  alt="Orange Digital Center Madagascar"
                  fill
                  sizes="40px"
                  priority
                  className="object-contain p-1"
                />
              </div>
              <div className="hidden flex-col leading-tight sm:flex">
                <span className="font-display text-sm font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  Orange Digital Center
                </span>
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  Madagascar
                </span>
              </div>
            </Link>

            {/* ═══════ NAV DESKTOP ═══════ */}
            <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navigation principale">
              {NAV_LINKS.map((link) => {
                const isActive =
                  pathname === link.href || pathname?.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'relative rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200',
                      'focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:outline-none',
                      isActive
                        ? 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300'
                        : 'text-slate-600 hover:bg-orange-50 hover:text-orange-700 dark:text-slate-400 dark:hover:bg-orange-500/10 dark:hover:text-orange-300',
                    )}
                  >
                    {link.label}
                    <span
                      className={cn(
                        'absolute bottom-1 left-1/2 h-0.5 -translate-x-1/2 rounded-full bg-orange-500 transition-all duration-300',
                        isActive ? 'w-5 opacity-100' : 'w-0 opacity-0',
                      )}
                      aria-hidden
                    />
                  </Link>
                );
              })}
            </nav>

            {/* ═══════ ACTIONS ═══════ */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className={cn('hidden md:inline-flex', BTN_GHOST_ICON)}
                aria-label="Rechercher"
              >
                <Search className="h-[18px] w-[18px]" />
              </Button>

              <ThemeToggle />

              {mounted && isHydrated && isAuthenticated && <NotificationModal />}

              {!mounted || !isHydrated ? (
                <div
                  className="hidden h-11 w-32 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800 md:block"
                  aria-hidden
                />
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

              <Button
                variant="ghost"
                size="icon"
                className={cn('lg:hidden', BTN_GHOST_ICON)}
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                aria-expanded={mobileOpen}
                aria-controls="mobile-nav-drawer"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        pathname={pathname}
        user={user}
        isAuthenticated={isAuthenticated}
        isHydrated={isHydrated}
        mounted={mounted}
        dashboardHref={dashboardHref}
        profileHref={profileHref}
        onLogout={logout}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   AVATAR UTILISATEUR
   ═══════════════════════════════════════════════════════════════════════════ */

interface UserAvatarProps {
  user: { nom?: string; prenom?: string; photoUrl?: string | null };
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
}

function UserAvatar({ user, size = 'md', showStatus = false }: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const sizes = {
    sm: 'h-8 w-8 text-[11px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-12 w-12 text-sm',
  };
  const initials =
    `${user.prenom?.charAt(0) ?? ''}${user.nom?.charAt(0) ?? ''}`.toUpperCase() || '?';
  const photoSrc = !imageError && user.photoUrl ? getMediaUrl(user.photoUrl) : null;

  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-500 to-orange-700 font-semibold text-white shadow-sm ring-2 ring-white dark:ring-slate-900',
          sizes[size],
        )}
      >
        {photoSrc ? (
          <Image
            src={photoSrc}
            alt={`${user.prenom} ${user.nom}`}
            width={64}
            height={64}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <span aria-hidden>{initials}</span>
        )}
      </div>
      {showStatus && (
        <span
          className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900"
          aria-label="En ligne"
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MENU UTILISATEUR (desktop)
   ═══════════════════════════════════════════════════════════════════════════ */

interface UserMenuProps {
  user: {
    nom?: string;
    prenom?: string;
    email?: string;
    photoUrl?: string | null;
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
  user, dashboardHref, profileHref, open, onToggle, onClose, onLogout,
}: UserMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); triggerRef.current?.focus(); }
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [open, onClose]);

  const roleLabel = user.role?.libelle ?? user.role?.nom ?? 'Utilisateur';

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={triggerRef}
        onClick={onToggle}
        className={cn(
          'group relative flex items-center gap-2 rounded-full p-1 pr-2.5 transition-all duration-200',
          'hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 focus-visible:outline-none',
          'dark:hover:bg-slate-800 dark:focus-visible:ring-slate-500',
          open && 'bg-slate-100 dark:bg-slate-800',
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Menu utilisateur"
      >
        <UserAvatar user={user} size="sm" showStatus />
        <ChevronDown
          className={cn(
            'h-4 w-4 text-slate-500 transition-transform duration-200 dark:text-slate-400',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950',
            'animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-200',
          )}
          role="menu"
          aria-label="Menu utilisateur"
        >
          <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} size="lg" showStatus />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {user.prenom} {user.nom}
                </p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  <Shield className="h-2.5 w-2.5" aria-hidden />
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="p-1.5">
            <MenuItem href={dashboardHref} icon={LayoutDashboard} label="Tableau de bord" onClick={onClose} />
            <MenuItem href={profileHref} icon={User} label="Mon profil" onClick={onClose} />
            <MenuItem href={`${profileHref}?tab=settings`} icon={Settings} label="Paramètres" onClick={onClose} />
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800" />

          <div className="p-1.5">
            <button
              onClick={() => { onClose(); onLogout(); }}
              className={cn('flex w-full items-center gap-2.5 px-3', BTN_DESTRUCTIVE, 'justify-start')}
              role="menuitem"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href, icon: Icon, label, onClick,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:outline-none dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
      role="menuitem"
    >
      <Icon
        className="h-4 w-4 text-slate-400 transition-colors group-hover:text-slate-700 dark:group-hover:text-slate-200"
        aria-hidden
      />
      <span>{label}</span>
    </Link>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ACTIONS INVITÉ (desktop)
   ═══════════════════════════════════════════════════════════════════════════ */

function GuestActions() {
  return (
    <div className="hidden items-center gap-2 md:flex">
      <Button asChild size="sm" variant="outline" className={BTN_OUTLINE}>
        <Link href="/connexion">
          <LogIn className="mr-1.5 h-4 w-4" aria-hidden />
          Connexion
        </Link>
      </Button>

      <Button asChild size="sm" className={BTN_PRIMARY}>
        <Link href="/inscription">
          <Sparkles className="mr-1.5 h-4 w-4" aria-hidden />
          S&apos;inscrire
        </Link>
      </Button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MENU MOBILE
   ═══════════════════════════════════════════════════════════════════════════ */

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  pathname: string | null;
  user: {
    nom?: string;
    prenom?: string;
    email?: string;
    photoUrl?: string | null;
    role?: { nom?: string; libelle?: string };
  } | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  mounted: boolean;
  dashboardHref: string;
  profileHref: string;
  onLogout: () => void;
}

function MobileMenu({
  open, onClose, pathname, user, isAuthenticated, isHydrated,
  mounted, dashboardHref, profileHref, onLogout,
}: MobileMenuProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeButtonRef.current?.focus();
  }, [open]);

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden
      />

      <aside
        id="mobile-nav-drawer"
        className={cn(
          'fixed right-0 top-0 z-50 flex h-full w-[85%] max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform duration-300 ease-out dark:border-slate-800 dark:bg-slate-950 lg:hidden',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        aria-hidden={!open}
        aria-label="Menu de navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2 rounded-lg focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:outline-none"
            aria-label="Retour à l'accueil"
          >
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white ring-1 ring-slate-200 dark:ring-slate-800">
              <Image src={LOGO_SRC} alt="ODC" fill sizes="36px" className="object-contain p-0.5" />
            </div>
            <span className="font-display text-sm font-bold text-slate-900 dark:text-slate-50">
              ODC Platform
            </span>
          </Link>

          <Button
            ref={closeButtonRef}
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={BTN_GHOST_ICON}
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto px-3 py-4">
          {mounted && isHydrated && isAuthenticated && user && (
            <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <UserAvatar user={user} size="md" showStatus />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                    {user.prenom} {user.nom}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-0.5">
            <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Navigation
            </p>
            {NAV_LINKS.map((link) => {
              const isActive =
                pathname === link.href || pathname?.startsWith(link.href + '/');
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50',
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {mounted && isHydrated && isAuthenticated && user && (
            <>
              <div className="my-4 h-px bg-slate-200 dark:bg-slate-800" />
              <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Mon compte
              </p>
              <Link
                href={dashboardHref}
                onClick={onClose}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
              >
                <LayoutDashboard className="h-4 w-4 text-slate-400" aria-hidden />
                Tableau de bord
              </Link>
              <Link
                href={profileHref}
                onClick={onClose}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-50"
              >
                <User className="h-4 w-4 text-slate-400" aria-hidden />
                Mon profil
              </Link>
            </>
          )}

          {/* Auth — boutons alignés sur le LoginForm */}
          {mounted && isHydrated && !isAuthenticated && (
            <>
              <div className="my-4 h-px bg-slate-200 dark:bg-slate-800" />
              <div className="grid grid-cols-2 gap-2 px-1">
                {/* ✅ Connexion — outline */}
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className={cn(BTN_OUTLINE, 'w-full justify-center')}
                >
                  <Link href="/connexion" onClick={onClose}>
                    Connexion
                  </Link>
                </Button>

                {/* ✅ S'inscrire — primary slate-900 */}
                <Button
                  asChild
                  size="sm"
                  className={cn(BTN_PRIMARY, 'w-full justify-center')}
                >
                  <Link href="/inscription" onClick={onClose}>
                    S&apos;inscrire
                  </Link>
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Footer déconnexion */}
        {mounted && isHydrated && isAuthenticated && (
          <div className="border-t border-slate-200 p-3 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { onLogout(); onClose(); }}
              className={cn(
                'group flex w-full items-center justify-center gap-2',
                BTN_DESTRUCTIVE,
              )}
            >
              <LogOut
                className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
                aria-hidden
              />
              Se déconnecter
            </button>
          </div>
        )}
      </aside>
    </>
  );
}