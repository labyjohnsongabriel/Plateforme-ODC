'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, ShieldCheck } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

const ROLES = [
  { value: 'ADMINISTRATEUR', label: 'Administrateur' },
  { value: 'STAFF_ODC', label: 'Staff ODC' },
  { value: 'FORMATEUR', label: 'Formateur' },
  { value: 'PARTICIPANT', label: 'Participant' },
  { value: 'PARTENAIRE', label: 'Partenaire' },
];

interface Props {
  userId: string;
  currentRole: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoleSelector({ userId, currentRole, open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const [role, setRole] = useState(currentRole);

  const mutation = useMutation({
    mutationFn: async (roleNom: string) => {
      await api.put(`/admin/users/${userId}/role`, { roleNom });
    },
    onSuccess: () => {
      toast.success('Rôle modifié avec succès');
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-odc-primary" />
            Changer le rôle
          </DialogTitle>
          <DialogDescription>
            Le rôle détermine les permissions et les accès de l&apos;utilisateur.
          </DialogDescription>
        </DialogHeader>

        <div>
          <Label htmlFor="role">Nouveau rôle</Label>
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger id="role" className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((r) => (
                <SelectItem key={r.value} value={r.value}>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            variant="odc"
            onClick={() => mutation.mutate(role)}
            disabled={mutation.isPending || role === currentRole}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}