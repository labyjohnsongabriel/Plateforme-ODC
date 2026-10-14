// src/app/(admin)/admin/roles/components/RolesTable.tsx
'use client';

import * as React from 'react';
import {
  Edit,
  Trash2,
  Shield,
  Users,
  Key,
  Lock,
  Plus,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useRoles, type Role } from '@/hooks/useRoles';
import { RoleFormModal } from './RoleFormModal';
import { DeleteRoleDialog } from './DeleteRoleDialog';

/* ============================================================================
   SQUELETTE
   ============================================================================ */

function TableSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-64" />
      ))}
    </div>
  );
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function RolesTable() {
  const { data: roles = [], isLoading, isError } = useRoles();

  const [editingRole, setEditingRole] = React.useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = React.useState<Role | null>(null);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  /* -------------------- Chargement -------------------- */
  if (isLoading) return <TableSkeleton />;

  /* -------------------- Erreur -------------------- */
  if (isError) {
    return (
      <Card>
        <div className="p-12 text-center">
          <p className="text-sm text-odc-error">
            Impossible de charger les rôles. Veuillez réessayer.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </Button>
        </div>
      </Card>
    );
  }

  /* -------------------- État vide -------------------- */
  if (!roles.length) {
    return (
      <>
        <Card>
          <div className="p-12 text-center">
            <Shield className="mx-auto mb-3 h-12 w-12 text-odc-text-muted" />
            <p className="text-sm font-medium text-odc-text-primary">
              Aucun rôle configuré
            </p>
            <p className="mt-1 text-xs text-odc-text-muted">
              Créez votre premier rôle pour gérer les permissions.
            </p>
            <Button
              variant="odc"
              size="sm"
              className="mt-4"
              leftIcon={<Plus className="h-4 w-4" />}
              onClick={() => setIsCreateOpen(true)}
            >
              Créer un rôle
            </Button>
          </div>
        </Card>

        <RoleFormModal
          mode="create"
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
        />
      </>
    );
  }

  /* -------------------- Rendu -------------------- */
  return (
    <>
      {/* En-tête avec bouton de création */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-odc-text-muted">
          {roles.length} rôle{roles.length > 1 ? 's' : ''} configuré
          {roles.length > 1 ? 's' : ''}
        </p>
        <Button
          variant="odc"
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setIsCreateOpen(true)}
        >
          Nouveau rôle
        </Button>
      </div>

      {/* Grille de cartes */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <Card
            key={role.id}
            className="group transition-all duration-odc-base hover:shadow-odc-md"
          >
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-black/5"
                    style={{
                      backgroundColor: `${role.couleur}20`,
                    }}
                  >
                    <Shield
                      className="h-5 w-5"
                      style={{ color: role.couleur }}
                    />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="truncate text-base">
                      {role.libelle}
                    </CardTitle>
                    <p className="mt-0.5 truncate font-mono text-xs text-odc-text-muted">
                      {role.nom}
                    </p>
                  </div>
                </div>

                {role.estSysteme && (
                  <Badge variant="outline" className="shrink-0 text-xs">
                    <Lock className="mr-1 h-3 w-3" />
                    Système
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Description */}
              {role.description && (
                <p className="line-clamp-2 text-xs text-odc-text-secondary">
                  {role.description}
                </p>
              )}

              {/* Statistiques */}
              <div className="flex items-center gap-4 text-xs text-odc-text-muted">
                <div className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  <span>
                    {role.usersCount} utilisateur
                    {role.usersCount > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Key className="h-3.5 w-3.5" />
                  <span>
                    {role.permissions.length} permission
                    {role.permissions.length > 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Permissions preview */}
              {role.permissions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 4).map((p) => (
                    <Badge
                      key={p.id}
                      variant="secondary"
                      className="text-[10px] font-mono"
                    >
                      {p.code}
                    </Badge>
                  ))}
                  {role.permissions.length > 4 && (
                    <Badge variant="secondary" className="text-[10px]">
                      +{role.permissions.length - 4}
                    </Badge>
                  )}
                </div>
              )}

              {/* Niveau hiérarchie */}
              <div className="flex items-center justify-between rounded-md bg-odc-surface-alt/50 px-2.5 py-1.5">
                <span className="text-[10px] font-medium uppercase tracking-wider text-odc-text-muted">
                  Hiérarchie
                </span>
                <span className="font-mono text-xs font-semibold text-odc-text-primary">
                  #{role.niveauHierarchie.toString().padStart(3, '0')}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 border-t border-odc-border pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingRole(role)}
                  className="flex-1"
                  leftIcon={<Edit className="h-3.5 w-3.5" />}
                >
                  Modifier
                </Button>
                {!role.estSysteme && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeletingRole(role)}
                    className="text-odc-error hover:bg-odc-error-soft hover:text-odc-error"
                    aria-label={`Supprimer ${role.libelle}`}
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
      <RoleFormModal
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <RoleFormModal
        mode="edit"
        id={editingRole?.id}
        open={!!editingRole}
        onOpenChange={(open) => !open && setEditingRole(null)}
      />

      <DeleteRoleDialog
        role={deletingRole}
        open={!!deletingRole}
        onOpenChange={(open) => !open && setDeletingRole(null)}
      />
    </>
  );
}