// src/app/admin/profil/components/AdminProfileContent.tsx
'use client';

import * as React from 'react';
import {
  Shield,
  User as UserIcon,
  Lock,
} from 'lucide-react';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { ProfileIdentityCard } from './ProfileIdentityCard';
import { ProfileInfoForm } from './ProfileInfoForm';
import { ProfileSecurityForm } from './ProfileSecurityForm';
import { useAuthContext } from '@/contexts/AuthContext';
import { getRoleMeta } from '@/lib/roles';
import { cn } from '@/lib/utils';

type Tab = 'info' | 'security';

export function AdminProfileContent() {
  const { user } = useAuthContext();
  const [tab, setTab] = React.useState<Tab>('info');

  if (!user) return null;

  const roleMeta = getRoleMeta(user.role?.nom, user.role?.libelle);
  const RoleIcon = roleMeta.icon;

  return (
    <div className="space-y-6">
      {/* ── Carte identité ─────────────────────────────── */}
      <div
        className={cn(
          'rounded-xl border border-slate-200 bg-white p-5 sm:p-6',
          'dark:border-slate-800 dark:bg-slate-950',
        )}
      >
        <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <ProfileIdentityCard />

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-50">
              {user.prenom} {user.nom}
            </h2>
            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
              {user.email}
            </p>
            <span
              className={cn(
                'mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
              )}
              aria-label={`Rôle : ${roleMeta.label}`}
            >
              <RoleIcon className="h-3 w-3" aria-hidden />
              {roleMeta.label}
            </span>
          </div>
        </div>
      </div>

      {/* ── Onglets ────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
        <TabButton active={tab === 'info'} onClick={() => setTab('info')} icon={UserIcon}>
          Informations
        </TabButton>
        <TabButton active={tab === 'security'} onClick={() => setTab('security')} icon={Lock}>
          Sécurité
        </TabButton>
      </div>

      {/* ── Contenu ────────────────────────────────────── */}
      {tab === 'info' ? <ProfileInfoForm /> : <ProfileSecurityForm />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative -mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2',
        active
          ? 'border-slate-900 text-slate-900 dark:border-slate-50 dark:text-slate-50'
          : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50',
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon className="h-4 w-4" aria-hidden />
      {children}
    </button>
  );
}