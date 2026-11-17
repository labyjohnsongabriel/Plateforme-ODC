'use client';

import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  user: { prenom?: string; nom?: string; role?: { libelle?: string } } | null;
  roleLabel?: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onLogout: () => void;
}

export function SidebarUserBlock({
  user, roleLabel = 'Formateur', collapsed, onToggleCollapse, onLogout,
}: Props) {
  const initials = user
    ? `${user.prenom?.charAt(0) ?? ''}${user.nom?.charAt(0) ?? ''}`.toUpperCase() || '?'
    : '?';

  return (
    <div className="shrink-0 space-y-1 border-t border-odc-border p-3">
      {/* Bloc utilisateur */}
      {!collapsed && user && (
        <div className="mb-2 flex items-center gap-3 rounded-lg bg-odc-surface-alt/50 px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-odc-500 to-odc-700 text-xs font-semibold text-white shadow-odc-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            {/* ✅ Nom en noir (text-primary) */}
            <p className="truncate text-xs font-semibold text-odc-text-primary">
              {user.prenom} {user.nom}
            </p>
            {/* ✅ Rôle en gris foncé (secondary) plutôt que muted */}
            <p className="truncate text-[10px] font-medium uppercase tracking-wider text-odc-text-secondary">
              {roleLabel}
            </p>
          </div>
        </div>
      )}

      {/* Toggle repli */}
      <button
        type="button"
        onClick={onToggleCollapse}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium',
          // ✅ Texte noir
          'text-odc-text-primary',
          'transition-colors hover:bg-odc-surface-alt',
          'focus-visible:ring-2 focus-visible:ring-odc-primary focus-visible:ring-offset-2 focus-visible:outline-none',
          collapsed && 'justify-center',
        )}
        aria-label={collapsed ? 'Déplier la sidebar' : 'Replier la sidebar'}
        aria-expanded={!collapsed}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" aria-hidden />
        ) : (
          <>
            <ChevronLeft className="h-4 w-4" aria-hidden />
            <span>Replier</span>
          </>
        )}
      </button>

      {/* Déconnexion */}
      <button
        type="button"
        onClick={onLogout}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-odc-error transition-colors',
          'hover:bg-odc-error-bg',
          'focus-visible:ring-2 focus-visible:ring-odc-error focus-visible:ring-offset-2 focus-visible:outline-none',
          collapsed && 'justify-center',
        )}
        aria-label="Se déconnecter"
      >
        <LogOut className="h-4 w-4 shrink-0" aria-hidden />
        {!collapsed && <span>Déconnexion</span>}
      </button>
    </div>
  );
}