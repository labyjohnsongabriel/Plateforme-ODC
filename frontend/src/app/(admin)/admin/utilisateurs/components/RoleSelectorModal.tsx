// src/app/(admin)/admin/utilisateurs/components/RoleSelectorModal.tsx
'use client';

import * as React from 'react';
import {
  AlertTriangle,
  GraduationCap,
  Handshake,
  Loader2,
  Shield,
  ShieldCheck,
  User,
  Users as UsersIcon,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  useChangeUserRole,
  ROLE_NOMS,
  ROLE_LABELS,
  type RoleNom,
} from '@/hooks/useUsers';

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════════════════════════════════════ */

const ROLE_ICONS: Record<RoleNom, React.ElementType> = {
  ADMINISTRATEUR: Shield,
  STAFF_ODC: UsersIcon,
  FORMATEUR: GraduationCap,
  PARTICIPANT: User,
  PARTENAIRE: Handshake,
};

const ROLE_COLORS: Record<RoleNom, string> = {
  ADMINISTRATEUR:
    'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900',
  STAFF_ODC:
    'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:ring-orange-900',
  FORMATEUR:
    'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900',
  PARTICIPANT:
    'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900',
  PARTENAIRE:
    'bg-purple-50 text-purple-700 ring-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:ring-purple-900',
};

/* ═══════════════════════════════════════════════════════════════════════════
   PROPS
   ═══════════════════════════════════════════════════════════════════════════ */

interface RoleSelectorModalProps {
  userId: string;
  userName?: string;
  currentRole: RoleNom;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function RoleSelectorModal({
  userId,
  userName,
  currentRole,
  open,
  onOpenChange,
}: RoleSelectorModalProps) {
  const [role, setRole] = React.useState<RoleNom>(currentRole);
  const changeRole = useChangeUserRole();

  // ⭐ Reset à chaque ouverture
  React.useEffect(() => {
    if (open) setRole(currentRole);
  }, [open, currentRole]);

  const hasChanged = role !== currentRole;
  const isDowngradingAdmin =
    currentRole === 'ADMINISTRATEUR' && role !== 'ADMINISTRATEUR';
  const isPromotingAdmin =
    role === 'ADMINISTRATEUR' && currentRole !== 'ADMINISTRATEUR';

  const CurrentIcon = ROLE_ICONS[currentRole];
  const NewIcon = ROLE_ICONS[role];

  const handleSubmit = async () => {
    if (!hasChanged) {
      onOpenChange(false);
      return;
    }

    try {
      await changeRole.mutateAsync({ userId, roleNom: role });
      onOpenChange(false);
    } catch {
      /* Erreur déjà gérée par le hook */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-odc-primary-soft">
            <ShieldCheck className="h-6 w-6 text-odc-primary" aria-hidden />
          </div>

          <DialogTitle className="font-display text-lg">
            Changer le rôle
          </DialogTitle>

          <DialogDescription className="pt-1 text-sm">
            {userName ? (
              <>
                Modifier le rôle de{' '}
                <strong className="text-foreground">{userName}</strong>.
              </>
            ) : (
              'Le rôle détermine les permissions et les accès de l’utilisateur.'
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Rôle actuel */}
          <div>
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">
              Rôle actuel
            </Label>
            <div className="mt-1.5 flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2.5">
              <CurrentIcon
                className="h-4 w-4 text-muted-foreground"
                aria-hidden
              />
              <span className="text-sm font-medium">
                {ROLE_LABELS[currentRole]}
              </span>
            </div>
          </div>

          {/* Nouveau rôle */}
          <div>
            <Label
              htmlFor="role"
              className="text-xs uppercase tracking-wider text-muted-foreground"
            >
              Nouveau rôle
            </Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as RoleNom)}
              disabled={changeRole.isPending}
            >
              <SelectTrigger id="role" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_NOMS.map((r) => {
                  const Icon = ROLE_ICONS[r];
                  const isCurrent = r === currentRole;
                  return (
                    <SelectItem
                      key={r}
                      value={r}
                      disabled={isCurrent}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                            ROLE_COLORS[r],
                          )}
                        >
                          <Icon className="h-3 w-3" aria-hidden />
                          {ROLE_LABELS[r]}
                        </span>
                        {isCurrent && (
                          <span className="text-xs text-muted-foreground">
                            (actuel)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Aperçu */}
          {hasChanged && (
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-xs text-muted-foreground mb-2">
                Aperçu du nouveau rôle
              </p>
              <Badge
                variant="outline"
                className={cn(
                  'gap-1.5 border-transparent',
                  ROLE_COLORS[role],
                )}
              >
                <NewIcon className="h-3 w-3" aria-hidden />
                {ROLE_LABELS[role]}
              </Badge>
            </div>
          )}

          {/* Avertissement rétrogradation */}
          {isDowngradingAdmin && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden
              />
              <span>
                Vous retirez les droits administrateur à cet utilisateur. Il
                perdra l’accès aux fonctions de gestion.
              </span>
            </div>
          )}

          {/* Avertissement promotion */}
          {isPromotingAdmin && (
            <div className="flex items-start gap-2 rounded-lg border border-blue-300 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300">
              <AlertTriangle
                className="mt-0.5 h-4 w-4 shrink-0"
                aria-hidden
              />
              <span>
                Un administrateur a accès à <strong>toutes</strong> les
                fonctionnalités de gestion (utilisateurs, formations, sessions,
                attestations, exports…). Assurez-vous que cette personne est
                habilitée.
              </span>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={changeRole.isPending}
          >
            Annuler
          </Button>
          <Button
            type="button"
            variant="odc"
            onClick={handleSubmit}
            disabled={changeRole.isPending || !hasChanged}
          >
            {changeRole.isPending ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden
                />
                Enregistrement…
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" aria-hidden />
                Enregistrer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}