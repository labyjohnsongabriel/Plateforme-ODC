'use client';

import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

interface Props {
  role: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoleForm({ role, open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const isEditing = !!role;

  const [form, setForm] = useState({
    nom: role?.nom ?? '',
    libelle: role?.libelle ?? '',
    description: role?.description ?? '',
    niveauHierarchie: role?.niveauHierarchie ?? 0,
    couleur: role?.couleur ?? '#FF7900',
    permissionCodes: role?.permissions?.map((p: any) => p.code) ?? [],
  });

  const { data: allPermissions } = useQuery({
    queryKey: ['admin', 'permissions'],
    queryFn: async () => {
      const { data } = await api.get('/admin/roles/permissions');
      return data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (isEditing) {
        await api.put(`/admin/roles/${role.id}`, form);
      } else {
        await api.post('/admin/roles', form);
      }
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Rôle mis à jour' : 'Rôle créé');
      qc.invalidateQueries({ queryKey: ['admin', 'roles'] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const togglePermission = (code: string) => {
    setForm((f) => ({
      ...f,
      permissionCodes: f.permissionCodes.includes(code)
        ? f.permissionCodes.filter((c) => c !== code)
        : [...f.permissionCodes, code],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier le rôle' : 'Nouveau rôle'}
          </DialogTitle>
          <DialogDescription>
            Définissez les informations et permissions de ce rôle.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nom">Nom technique *</Label>
              <Input
                id="nom"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                placeholder="EX: SUPERVISEUR"
                disabled={role?.estSysteme}
                className="mt-1.5 font-mono"
              />
            </div>
            <div>
              <Label htmlFor="libelle">Libellé *</Label>
              <Input
                id="libelle"
                value={form.libelle}
                onChange={(e) => setForm({ ...form, libelle: e.target.value })}
                placeholder="Ex: Superviseur"
                className="mt-1.5"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-1.5"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="niveau">Niveau hiérarchique</Label>
              <Input
                id="niveau"
                type="number"
                value={form.niveauHierarchie}
                onChange={(e) =>
                  setForm({ ...form, niveauHierarchie: Number(e.target.value) })
                }
                min={0}
                max={1000}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="couleur">Couleur</Label>
              <Input
                id="couleur"
                type="color"
                value={form.couleur}
                onChange={(e) => setForm({ ...form, couleur: e.target.value })}
                className="mt-1.5 h-10"
              />
            </div>
          </div>

          {/* Permissions */}
          <div>
            <Label>Permissions ({form.permissionCodes.length})</Label>
            <div className="mt-1.5 rounded-lg border border-odc-border p-3 max-h-64 overflow-y-auto scrollbar-thin">
              <div className="grid sm:grid-cols-2 gap-2">
                {allPermissions?.map((p: any) => (
                  <label
                    key={p.id}
                    className="flex items-start gap-2 p-2 rounded hover:bg-odc-surface-alt cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.permissionCodes.includes(p.code)}
                      onChange={() => togglePermission(p.code)}
                      className="mt-0.5"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium font-mono truncate">
                        {p.code}
                      </p>
                      <p className="text-[10px] text-odc-muted">{p.libelle}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button
            variant="odc"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? 'Mettre à jour' : 'Créer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}