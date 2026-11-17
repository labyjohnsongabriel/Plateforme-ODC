// src/components/shared/HeaderUserMenu.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';
import { getDashboardRoute } from '@/lib/routes';
import { getMediaUrl } from '@/lib/media';
import { getRoleMeta } from '@/lib/roles';

/* ═══════════════════════════════════════════════════════════════════════════
   AVATAR UTILISATEUR (image + fallback initiales)
   ═══════════════════════════════════════════════════════════════════════════ */

interface UserAvatarProps {
  user: {
    nom?: string;
    prenom?: string;
    photoUrl?: string | null;
  };
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
    `${user.prenom?.charAt(0) ?? ''}${user.nom?.charAt(0) ?? ''}`.toUpperCase() ||
    '?';

  const photoSrc =
    !imageError && user.photoUrl ? getMediaUrl(user.photoUrl) : null;

  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden rounded-full',
          'bg-gradient-to-br from-orange-500 to-orange-700 font-semibold text-white',
          'shadow-sm ring-2 ring-white dark:ring-slate-900',
          sizes[size],
        )}
      >
        {photoSrc ? (
          <Image
            src={photoSrc}
            alt={`${user.prenom ?? ''} ${user.nom ?? ''}`.trim() || 'Avatar'}
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
   MENU UTILISATEUR
   ═══════════════════════════════════════════════════════════════════════════ */

export function HeaderUserMenu() {
  const router = useRouter();

  const { user, isAuthenticated, isHydrated, logout } = useAuthContext();

  const [open, setOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  if (!isHydrated || !isAuthenticated || !user) {
    return null;
  }

  const roleMeta = getRoleMeta(user.role?.nom, user.role?.libelle);
  const RoleIcon = roleMeta.icon;

  const dashboardHref = getDashboardRoute(user.role?.nom);
  const profileHref = `${dashboardHref.replace('/dashboard', '')}/profil`;

  const handleLogout = async () => {
    try {
      setOpen(false);
      await logout();
      router.push('/connexion');
      router.refresh();
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error);
      router.push('/connexion');
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={triggerRef}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'group flex items-center gap-2 rounded-full p-1 pr-2.5 transition-colors',
          'hover:bg-orange-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2',
          'dark:hover:bg-orange-500/10 dark:focus-visible:ring-orange-500',
          open && 'bg-orange-50 dark:bg-orange-500/10',
        )}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Menu utilisateur — ${roleMeta.label}`}
        type="button"
      >
        <UserAvatar user={user} size="sm" showStatus />

        <ChevronDown
          className={cn(
            'h-4 w-4 text-slate-500 transition-transform duration-200 dark:text-slate-400',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div
          className={cn(
            'absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl',
            'border border-slate-200 bg-white shadow-xl',
            'dark:border-slate-800 dark:bg-slate-950',
            'animate-in fade-in-0 zoom-in-95 slide-in-from-top-1 duration-200',
          )}
          role="menu"
        >
          {/* Header utilisateur */}
          <div className="border-b border-slate-200 bg-orange-50/50 px-4 py-4 dark:border-slate-800 dark:bg-orange-500/5">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} size="lg" showStatus />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {user.prenom} {user.nom}
                </p>

                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user.email}
                </p>

                {/* Badge de rôle ORANGE */}
                <span
                  className={cn(
                    'mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                    roleMeta.badgeClass,
                  )}
                  aria-label={`Rôle : ${roleMeta.label}`}
                >
                  <RoleIcon className="h-2.5 w-2.5" aria-hidden="true" />
                  {roleMeta.label}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800" />

          {/* Navigation */}
          <div className="p-1.5">
            <MenuLink
              href={dashboardHref}
              icon={LayoutDashboard}
              label="Tableau de bord"
              onClick={() => setOpen(false)}
            />

            <MenuLink
              href={profileHref}
              icon={User}
              label="Mon profil"
              onClick={() => setOpen(false)}
            />

            <MenuLink
              href={`${profileHref}?tab=settings`}
              icon={Settings}
              label="Paramètres"
              onClick={() => setOpen(false)}
            />
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800" />

          {/* Déconnexion */}
          <div className="p-1.5">
            <button
              type="button"
              onClick={handleLogout}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'text-red-600 hover:bg-red-50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2',
                'dark:text-red-400 dark:hover:bg-red-950/30',
              )}
              role="menuitem"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onClick,
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
      className={cn(
        'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        'text-slate-700 hover:bg-orange-50 hover:text-orange-700',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2',
        'dark:text-slate-300 dark:hover:bg-orange-500/10 dark:hover:text-orange-300 dark:focus-visible:ring-orange-500',
      )}
      role="menuitem"
    >
      <Icon
        className={cn(
          'h-4 w-4 text-slate-400 transition-colors',
          'group-hover:text-orange-600 dark:group-hover:text-orange-400',
        )}
        aria-hidden="true"
      />
      <span>{label}</span>
    </Link>
  );
}