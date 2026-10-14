// src/app/(admin)/admin/utilisateurs/components/RoleSelectorModal.tsx
'use client';

import * as React from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  useChangeUserRole,
  ROLE_NOMS,
  ROLE_LABELS,
  type RoleNom,
} from '@/hooks/useUsers';

interface RoleSelectorModalProps {
  userId: string;
  currentRole: RoleNom;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ROLE_COLORS: Record<RoleNom, string> = {
  ADMINISTRATEUR: 'bg-red-50 text-red-700 ring-red-200',
  STAFF_ODC: 'bg-orange-50 text-orange-700 ring-orange-200',
  FORMATEUR: 'bg-blue-50 text-blue-700 ring-blue-200',
  PARTICIPANT: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  PARTENAIRE: 'bg-purple-50 text-purple-700 ring-purple-200',
};

export function RoleSelectorModal({
  userId,
  currentRole,
  open,
  onOpenChange,
}: RoleSelectorModalProps) {
  const [role, setRole] = React.useState<RoleNom>(currentRole);
  const changeRole = useChangeUserRole();

  React.useEffect(() => {
    if (open) setRole(currentRole);
  }, [open, currentRole]);

  const handleSubmit = async () => {
    if (role === currentRole) return;
    try {
      await changeRole.mutateAsync({ userId, roleNom: role });
      onOpenChange(false);
    } catch {
      /* Erreur déjà gérée */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-odc-primary-soft">
            <ShieldCheck className="h-6 w-6 text-odc-primary" />
          </div>

          <DialogTitle className="font-display text-lg">
            Changer le rôle
          </DialogTitle>

          <DialogDescription className="pt-1 text-sm">
            Le rôle détermine les permissions et les accès de l&apos;utilisateur.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="role">Nouveau rôle</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as RoleNom)}
              disabled={changeRole.isPending}
            >
              <SelectTrigger id="role" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_NOMS.map((r) => (
                  <SelectItem key={r} value={r}>
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
                        ROLE_COLORS[r],
                      )}
                    >
                      {ROLE_LABELS[r]}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Alerte changement sensible */}
          {currentRole === 'ADMINISTRATEUR' && role !== 'ADMINISTRATEUR' && (
            <div className="rounded-lg border border-odc-warning bg-odc-warning-bg p-3">
              <p className="text-xs text-odc-warning-dark">
                ⚠️ Vous retirez les droits administrateur à cet utilisateur.
              </p>
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
            disabled={changeRole.isPending || role === currentRole}
            loading={changeRole.isPending}
            loadingText="Enregistrement…"
            leftIcon={<ShieldCheck className="h-4 w-4" />}
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}