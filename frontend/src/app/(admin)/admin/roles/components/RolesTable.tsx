'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Shield, Trash2, Edit, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { RoleForm } from './RoleForm';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

export function RolesTable() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const { data: roles, isLoading } = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: async () => {
      const { data } = await api.get('/admin/roles');
      return data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/roles/${id}`);
    },
    onSuccess: () => {
      toast.success('Rôle supprimé');
      qc.invalidateQueries({ queryKey: ['admin', 'roles'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-56" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-end">
        <Button variant="odc" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau rôle
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles?.map((role: any) => (
          <Card key={role.id} className="hover:shadow-odc-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: role.couleur ? `${role.couleur}20` : 'var(--odc-primary-soft)',
                    }}
                  >
                    <Shield
                      className="h-5 w-5"
                      style={{ color: role.couleur || 'var(--odc-primary)' }}
                    />
                  </div>
                  <div>
                    <CardTitle className="text-base">{role.libelle}</CardTitle>
                    <p className="text-xs text-odc-muted font-mono mt-0.5">
                      {role.nom}
                    </p>
                  </div>
                </div>

                {role.estSysteme && (
                  <Badge variant="outline" className="text-xs">
                    Système
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-odc-muted">
                <Users className="h-4 w-4" />
                <span>{role.users?.length ?? 0} utilisateur(s)</span>
              </div>

              <div>
                <p className="text-xs text-odc-muted mb-2">
                  {role.permissions?.length ?? 0} permission(s)
                </p>
                <div className="flex flex-wrap gap-1 max-h-20 overflow-hidden">
                  {role.permissions?.slice(0, 4).map((p: any) => (
                    <Badge key={p.id} variant="secondary" className="text-[10px]">
                      {p.code}
                    </Badge>
                  ))}
                  {role.permissions?.length > 4 && (
                    <Badge variant="secondary" className="text-[10px]">
                      +{role.permissions.length - 4}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-odc-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(role)}
                  className="flex-1"
                >
                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                  Modifier
                </Button>
                {!role.estSysteme && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-odc-error hover:text-odc-error hover:bg-odc-error-bg"
                    onClick={() => {
                      if (confirm(`Supprimer le rôle ${role.libelle} ?`)) {
                        deleteMutation.mutate(role.id);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modales */}
      {(creating || editing) && (
        <RoleForm
          role={editing}
          open={creating || !!editing}
          onOpenChange={(open) => {
            if (!open) {
              setCreating(false);
              setEditing(null);
            }
          }}
        />
      )}
    </>
  );
}