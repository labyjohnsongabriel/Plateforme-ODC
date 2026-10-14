// src/app/(admin)/admin/utilisateurs/components/RoleSelectorInline.tsx
'use client';

import {
  Shield,
  Users as UsersIcon,
  GraduationCap,
  User as UserIcon,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type RoleNom =
  | 'ADMINISTRATEUR'
  | 'STAFF_ODC'
  | 'FORMATEUR'
  | 'PARTICIPANT'
  | 'PARTENAIRE';

interface RoleSelectorInlineProps {
  value: RoleNom;
  onChange: (value: RoleNom) => void;
  disabled?: boolean;
  layout?: 'grid' | 'list';
}

const ROLES: RoleNom[] = [
  'ADMINISTRATEUR',
  'STAFF_ODC',
  'FORMATEUR',
  'PARTICIPANT',
  'PARTENAIRE',
];

const ROLE_CONFIG: Record<
  RoleNom,
  { label: string; icon: React.ElementType; color: string; description: string }
> = {
  ADMINISTRATEUR: {
    label: 'Administrateur',
    icon: Shield,
    color: 'text-red-600',
    description: 'Accès complet à toutes les fonctionnalités',
  },
  STAFF_ODC: {
    label: 'Staff ODC',
    icon: UsersIcon,
    color: 'text-orange-600',
    description: 'Gestion quotidienne des formations et sessions',
  },
  FORMATEUR: {
    label: 'Formateur',
    icon: GraduationCap,
    color: 'text-blue-600',
    description: 'Anime les sessions et gère ses participants',
  },
  PARTICIPANT: {
    label: 'Participant',
    icon: UserIcon,
    color: 'text-emerald-600',
    description: 'Suit les formations et consulte ses attestations',
  },
  PARTENAIRE: {
    label: 'Partenaire',
    icon: Building2,
    color: 'text-purple-600',
    description: 'Accès aux formations partenaires',
  },
};

export function RoleSelectorInline({
  value,
  onChange,
  disabled = false,
  layout = 'grid',
}: RoleSelectorInlineProps) {
  return (
    <div
      className={cn(
        'gap-3',
        layout === 'grid' ? 'grid sm:grid-cols-2' : 'flex flex-col',
      )}
      role="radiogroup"
      aria-label="Sélection du rôle"
    >
      {ROLES.map((role) => {
        const config = ROLE_CONFIG[role];
        const Icon = config.icon;
        const isSelected = value === role;

        return (
          <button
            key={role}
            type="button"
            onClick={() => !disabled && onChange(role)}
            disabled={disabled}
            role="radio"
            aria-checked={isSelected}
            className={cn(
              'flex items-start gap-3 rounded-lg border-2 p-3 text-left transition-all duration-odc-fast',
              disabled && 'cursor-not-allowed opacity-60',
              !disabled && 'hover:border-odc-primary-light hover:shadow-odc-sm',
              isSelected
                ? 'border-odc-primary bg-odc-primary-softer shadow-odc-sm'
                : 'border-odc-border bg-odc-surface',
            )}
          >
            <div
              className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                isSelected ? 'bg-odc-primary text-white' : 'bg-odc-surface-alt',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4',
                  isSelected ? 'text-white' : config.color,
                )}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-odc-text-primary">
                {config.label}
              </p>
              <p className="mt-0.5 line-clamp-2 text-xs text-odc-text-muted">
                {config.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}