import { Crown, Briefcase, GraduationCap, Users, Handshake, Check } from 'lucide-react';
import { RoleName } from '../types/user.types';
import { cn } from '@/utils/cn';

interface RoleOption {
  value: RoleName;
  label: string;
  description: string;
  icon: any;
  color: string;
}

const ROLES: RoleOption[] = [
  {
    value: RoleName.ADMIN,
    label: 'Administrateur',
    description: 'Accès total à la plateforme',
    icon: Crown,
    color: 'text-odc-error bg-odc-error-bg',
  },
  {
    value: RoleName.STAFF,
    label: 'Staff ODC',
    description: 'Gestion opérationnelle',
    icon: Briefcase,
    color: 'text-odc-warning bg-odc-warning-bg',
  },
  {
    value: RoleName.FORMATEUR,
    label: 'Formateur',
    description: 'Animation des formations',
    icon: GraduationCap,
    color: 'text-odc-info bg-odc-info-bg',
  },
  {
    value: RoleName.PARTICIPANT,
    label: 'Participant',
    description: 'Suivi de formations',
    icon: Users,
    color: 'text-odc-success bg-odc-success-bg',
  },
  {
    value: RoleName.PARTENAIRE,
    label: 'Partenaire',
    description: 'Consultation des statistiques',
    icon: Handshake,
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
  },
];

interface RoleSelectorProps {
  value?: RoleName;
  onChange: (role: RoleName) => void;
  error?: string;
  disabled?: boolean;
}

export function RoleSelector({ value, onChange, error, disabled }: RoleSelectorProps) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-3 text-odc-text-light dark:text-odc-text-dark">
        Rôle <span className="text-odc-error">*</span>
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ROLES.map((role) => {
          const selected = value === role.value;
          const Icon = role.icon;

          return (
            <button
              key={role.value}
              type="button"
              onClick={() => !disabled && onChange(role.value)}
              disabled={disabled}
              className={cn(
                'relative flex items-start gap-3 p-4 rounded-xl text-left transition-all',
                'border-2',
                selected
                  ? 'border-odc-primary bg-odc-primary-soft dark:bg-odc-primary-soft/20'
                  : 'border-odc-border-light dark:border-odc-border-dark hover:border-odc-primary/50',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center',
                  role.color
                )}
              >
                <Icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-odc-text-light dark:text-odc-text-dark">
                  {role.label}
                </div>
                <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mt-0.5">
                  {role.description}
                </div>
              </div>
              {selected && (
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-odc-primary flex items-center justify-center">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {error && <p className="mt-2 text-xs text-odc-error">{error}</p>}
    </div>
  );
}