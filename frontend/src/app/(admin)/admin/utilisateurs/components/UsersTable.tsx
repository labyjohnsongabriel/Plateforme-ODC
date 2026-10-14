// src/app/(admin)/admin/utilisateurs/components/UsersTable.tsx
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  MoreVertical,
  Edit,
  Trash2,
  ShieldCheck,
  UserX,
  UserCheck,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Shield,
  Users as UsersIcon,
  GraduationCap,
  User as UserIcon,
  Building2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';
import { getInitials } from '@/lib/utils';
import {
  useUsers,
  useToggleUserActif,
  type User,
  type RoleNom,
} from '@/hooks/useUsers';
import { UserFormModal } from './UserFormModal';
import { RoleSelectorModal } from './RoleSelectorModal';
import { DeleteUserDialog, BulkDeleteUsersDialog } from './DeleteUserDialog';

/* ============================================================================
   CONFIGURATION DES RÔLES
   ============================================================================ */

const ROLE_CONFIG: Record<
  RoleNom,
  { label: string; icon: React.ElementType; badge: string }
> = {
  ADMINISTRATEUR: {
    label: 'Administrateur',
    icon: Shield,
    badge: 'bg-red-50 text-red-700 ring-red-200',
  },
  STAFF_ODC: {
    label: 'Staff ODC',
    icon: UsersIcon,
    badge: 'bg-orange-50 text-orange-700 ring-orange-200',
  },
  FORMATEUR: {
    label: 'Formateur',
    icon: GraduationCap,
    badge: 'bg-blue-50 text-blue-700 ring-blue-200',
  },
  PARTICIPANT: {
    label: 'Participant',
    icon: UserIcon,
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  PARTENAIRE: {
    label: 'Partenaire',
    icon: Building2,
    badge: 'bg-purple-50 text-purple-700 ring-purple-200',
  },
};

type SortField = 'nom' | 'email' | 'createdAt' | 'role';
type SortOrder = 'asc' | 'desc';

/* ============================================================================
   SQUELETTE
   ============================================================================ */

function TableSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="divide-y divide-odc-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function UsersTable() {
  const searchParams = useSearchParams();

  /* -------------------- État local -------------------- */
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [sortField, setSortField] = React.useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc');

  /* -------------------- Modales -------------------- */
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [deletingUser, setDeletingUser] = React.useState<User | null>(null);
  const [changingRoleUser, setChangingRoleUser] = React.useState<User | null>(
    null,
  );
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = React.useState(false);

  /* -------------------- Filtres URL -------------------- */
  const filters = React.useMemo(
    () => ({
      page: Number(searchParams.get('page')) || 1,
      limit: 10,
      q: searchParams.get('q') ?? undefined,
      roleId: searchParams.get('roleId') ?? undefined,
      actif: (searchParams.get('actif') as 'all' | 'true' | 'false') ?? 'all',
    }),
    [searchParams],
  );

  /* -------------------- Queries & Mutations -------------------- */
  const { data, isLoading, isError } = useUsers(filters);
  const toggleActif = useToggleUserActif();

  /* -------------------- Tri -------------------- */
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3.5 w-3.5 text-odc-primary" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-odc-primary" />
    );
  };

  /* -------------------- Sélection -------------------- */
  const toggleSelectAll = () => {
    const users = data?.data ?? [];
    if (selectedIds.length === users.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u) => u.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  /* -------------------- Chargement -------------------- */
  if (isLoading) return <TableSkeleton />;

  /* -------------------- Erreur -------------------- */
  if (isError) {
    return (
      <Card>
        <EmptyState
          icon={UserX}
          title="Erreur de chargement"
          description="Impossible de charger les utilisateurs."
          action={
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          }
        />
      </Card>
    );
  }

  /* -------------------- Tri des données -------------------- */
  const users = [...(data?.data ?? [])].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case 'nom':
        comparison = `${a.nom} ${a.prenom}`.localeCompare(
          `${b.nom} ${b.prenom}`,
        );
        break;
      case 'email':
        comparison = a.email.localeCompare(b.email);
        break;
      case 'role':
        comparison = (a.role?.nom ?? '').localeCompare(b.role?.nom ?? '');
        break;
      case 'createdAt':
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  /* -------------------- Vide -------------------- */
  if (!users.length) {
    return (
      <>
        <Card>
          <EmptyState
            icon={UserX}
            title="Aucun utilisateur"
            description="Aucun utilisateur ne correspond à vos filtres."
            action={
              <Button variant="odc" onClick={() => setIsCreateOpen(true)}>
                <UserIcon className="mr-2 h-4 w-4" />
                Créer un utilisateur
              </Button>
            }
          />
        </Card>

        <UserFormModal
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
      {/* Barre de sélection */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-odc-primary/30 bg-odc-primary-soft/40 p-3">
          <span className="text-sm font-medium text-odc-primary">
            {selectedIds.length} utilisateur(s) sélectionné(s)
          </span>
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBulkDeleteOpen(true)}
              leftIcon={<Trash2 className="h-4 w-4" />}
            >
              Supprimer
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds([])}
            >
              Annuler
            </Button>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedIds.length === users.length && users.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Tout sélectionner"
                />
              </TableHead>

              <TableHead
                className="cursor-pointer select-none hover:text-odc-primary"
                onClick={() => handleSort('nom')}
              >
                <span className="inline-flex items-center gap-1.5">
                  Utilisateur
                  {getSortIcon('nom')}
                </span>
              </TableHead>

              <TableHead
                className="hidden cursor-pointer select-none hover:text-odc-primary md:table-cell"
                onClick={() => handleSort('role')}
              >
                <span className="inline-flex items-center gap-1.5">
                  Rôle
                  {getSortIcon('role')}
                </span>
              </TableHead>

              <TableHead
                className="hidden cursor-pointer select-none hover:text-odc-primary lg:table-cell"
                onClick={() => handleSort('createdAt')}
              >
                <span className="inline-flex items-center gap-1.5">
                  Inscrit le
                  {getSortIcon('createdAt')}
                </span>
              </TableHead>

              <TableHead>Statut</TableHead>

              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((user) => {
              const roleConfig =
                ROLE_CONFIG[user.role?.nom ?? 'PARTICIPANT'];
              const RoleIcon = roleConfig.icon;
              const isSelected = selectedIds.includes(user.id);

              return (
                <TableRow
                  key={user.id}
                  data-state={isSelected ? 'selected' : undefined}
                  className="group hover:bg-odc-surface-hover"
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelectOne(user.id)}
                      aria-label={`Sélectionner ${user.prenom} ${user.nom}`}
                    />
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.photoUrl} />
                        <AvatarFallback className="bg-odc-primary-soft text-xs font-medium text-odc-primary">
                          {getInitials(user.nom, user.prenom)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-odc-text-primary">
                          {user.prenom} {user.nom}
                        </p>
                        <p className="truncate text-xs text-odc-text-muted">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant="outline"
                      className={cn(
                        'gap-1.5 border-transparent',
                        roleConfig.badge,
                      )}
                    >
                      <RoleIcon className="h-3 w-3" />
                      {roleConfig.label}
                    </Badge>
                  </TableCell>

                  <TableCell className="hidden text-sm text-odc-text-muted lg:table-cell">
                    {formatDate(user.createdAt)}
                  </TableCell>

                  <TableCell>
                    {user.actif ? (
                      <Badge className="gap-1 bg-odc-success-soft text-odc-success-dark hover:bg-odc-success-soft">
                        <span className="h-1.5 w-1.5 rounded-full bg-odc-success" />
                        Actif
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="gap-1 text-odc-text-muted"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-odc-text-muted" />
                        Inactif
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
                          aria-label="Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Modifier
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => setChangingRoleUser(user)}
                        >
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Changer le rôle
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() =>
                            toggleActif.mutate({
                              id: user.id,
                              actif: !user.actif,
                            })
                          }
                          disabled={toggleActif.isPending}
                        >
                          {user.actif ? (
                            <>
                              <UserX className="mr-2 h-4 w-4" />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Activer
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-odc-error focus:bg-odc-error-soft focus:text-odc-error"
                          onClick={() => setDeletingUser(user)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* ================================================================
          MODALES
          ================================================================ */}

      {/* Création */}
      <UserFormModal
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      {/* Édition */}
      <UserFormModal
        mode="edit"
        userId={editingUser?.id}
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      />

      {/* Changement de rôle */}
      <RoleSelectorModal
        userId={changingRoleUser?.id ?? ''}
        currentRole={changingRoleUser?.role?.nom ?? 'PARTICIPANT'}
        open={!!changingRoleUser}
        onOpenChange={(open) => !open && setChangingRoleUser(null)}
      />

      {/* Suppression simple */}
      <DeleteUserDialog
        user={deletingUser}
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
      />

      {/* Suppression en masse */}
      <BulkDeleteUsersDialog
        count={selectedIds.length}
        ids={selectedIds}
        open={isBulkDeleteOpen}
        onOpenChange={setIsBulkDeleteOpen}
        onSuccess={() => setSelectedIds([])}
      />
    </>
  );
}