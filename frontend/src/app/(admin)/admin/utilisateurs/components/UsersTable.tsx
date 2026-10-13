// src/app/(admin)/admin/utilisateurs/components/UsersTable.tsx
'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  MoreVertical,
  Edit,
  Trash2,
  ShieldCheck,
  UserX,
  UserCheck,
  Eye,
  Mail,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { getInitials } from '@/lib/utils';
import { getErrorMessage } from '@/lib/error-handler';
import type { User } from '@/types/user.types';

/* ============================================================================
   CONSTANTES — RÔLES
   ============================================================================ */

const ROLE_CONFIG: Record<
  string,
  {
    label: string;
    icon: any;
    color: string;
    badge: string;
  }
> = {
  ADMINISTRATEUR: {
    label: 'Administrateur',
    icon: Shield,
    color: 'text-red-600',
    badge: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  },
  STAFF_ODC: {
    label: 'Staff ODC',
    icon: UsersIcon,
    color: 'text-orange-600',
    badge:
      'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400',
  },
  FORMATEUR: {
    label: 'Formateur',
    icon: GraduationCap,
    color: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  },
  PARTICIPANT: {
    label: 'Participant',
    icon: UserIcon,
    color: 'text-green-600',
    badge:
      'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  },
  PARTENAIRE: {
    label: 'Partenaire',
    icon: Building2,
    color: 'text-purple-600',
    badge:
      'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400',
  },
};

/* ============================================================================
   TYPES
   ============================================================================ */

type SortField = 'nom' | 'email' | 'createdAt' | 'role';
type SortOrder = 'asc' | 'desc';

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function UsersTable() {
  const router = useRouter();
  const qc = useQueryClient();
  const searchParams = useSearchParams();

  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  /* -------------------- Filtres -------------------- */
  const filters = {
    page: Number(searchParams.get('page')) || 1,
    limit: 10,
    q: searchParams.get('q') ?? undefined,
    roleId: searchParams.get('roleId') ?? undefined,
    actif: searchParams.get('actif') ?? undefined,
  };

  /* -------------------- Query -------------------- */
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: async () => {
      const { data } = await api.get('/admin/users', { params: filters });
      return data;
    },
  });

  /* -------------------- Mutations -------------------- */
  const toggleActifMutation = useMutation({
    mutationFn: async ({ id, actif }: { id: string; actif: boolean }) => {
      await api.put(`/admin/users/${id}/actif`, { actif });
    },
    onSuccess: (_, vars) => {
      toast.success(
        vars.actif ? 'Utilisateur activé' : 'Utilisateur désactivé',
      );
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/users/${id}`);
    },
    onSuccess: () => {
      toast.success('Utilisateur supprimé');
      setDeleteTarget(null);
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => api.delete(`/admin/users/${id}`)));
    },
    onSuccess: () => {
      toast.success(`${selectedIds.length} utilisateur(s) supprimé(s)`);
      setSelectedIds([]);
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

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
    if (!data?.data) return;
    if (selectedIds.length === data.data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.data.map((u: User) => u.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  /* -------------------- Loading -------------------- */
  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      </Card>
    );
  }

  /* -------------------- Tri des données -------------------- */
  const users = [...(data?.data ?? [])].sort((a: User, b: User) => {
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
      <Card>
        <EmptyState
          icon={UserX}
          title="Aucun utilisateur"
          description="Aucun utilisateur ne correspond à vos filtres."
        />
      </Card>
    );
  }

  /* -------------------- Rendu -------------------- */
  return (
    <>
      {/* Barre d'actions groupées */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-odc-primary-soft/40 border border-odc-primary/30">
          <span className="text-sm font-medium text-odc-primary">
            {selectedIds.length} utilisateur(s) sélectionné(s)
          </span>
          <div className="flex gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => bulkDeleteMutation.mutate(selectedIds)}
              disabled={bulkDeleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
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

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              {/* Sélection */}
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedIds.length === users.length && users.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                  aria-label="Tout sélectionner"
                />
              </TableHead>

              {/* Utilisateur */}
              <TableHead
                className="cursor-pointer select-none hover:text-odc-primary"
                onClick={() => handleSort('nom')}
              >
                <span className="inline-flex items-center gap-1.5">
                  Utilisateur
                  {getSortIcon('nom')}
                </span>
              </TableHead>

              {/* Rôle */}
              <TableHead
                className="hidden md:table-cell cursor-pointer select-none hover:text-odc-primary"
                onClick={() => handleSort('role')}
              >
                <span className="inline-flex items-center gap-1.5">
                  Rôle
                  {getSortIcon('role')}
                </span>
              </TableHead>

              {/* Inscription */}
              <TableHead
                className="hidden lg:table-cell cursor-pointer select-none hover:text-odc-primary"
                onClick={() => handleSort('createdAt')}
              >
                <span className="inline-flex items-center gap-1.5">
                  Inscrit le
                  {getSortIcon('createdAt')}
                </span>
              </TableHead>

              {/* Statut */}
              <TableHead>Statut</TableHead>

              {/* Actions */}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((user: User) => {
              const roleConfig =
                ROLE_CONFIG[user.role?.nom] ?? ROLE_CONFIG.PARTICIPANT;
              const RoleIcon = roleConfig.icon;
              const isSelected = selectedIds.includes(user.id);

              return (
                <TableRow
                  key={user.id}
                  data-state={isSelected ? 'selected' : undefined}
                  className="hover:bg-odc-surface-alt/50"
                >
                  {/* Checkbox */}
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelectOne(user.id)}
                      aria-label={`Sélectionner ${user.prenom} ${user.nom}`}
                    />
                  </TableCell>

                  {/* Utilisateur */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.photoUrl ?? undefined} />
                        <AvatarFallback className="bg-odc-primary-soft text-odc-primary text-xs font-medium">
                          {getInitials(user.nom, user.prenom)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">
                          {user.prenom} {user.nom}
                        </p>
                        <p className="text-xs text-odc-muted truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Rôle */}
                  <TableCell className="hidden md:table-cell">
                    <Badge
                      variant="outline"
                      className={`${roleConfig.badge} border-transparent gap-1.5`}
                    >
                      <RoleIcon className="h-3 w-3" />
                      {roleConfig.label}
                    </Badge>
                  </TableCell>

                  {/* Date */}
                  <TableCell className="hidden lg:table-cell text-sm text-odc-muted">
                    {formatDate(user.createdAt)}
                  </TableCell>

                  {/* Statut */}
                  <TableCell>
                    {user.actif ? (
                      <Badge className="bg-odc-success-bg text-odc-success hover:bg-odc-success-bg gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-odc-success" />
                        Actif
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-odc-muted gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-odc-muted" />
                        Inactif
                      </Badge>
                    )}
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-52">
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/admin/utilisateurs/${user.id}`)
                          }
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir le profil
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/admin/utilisateurs/${user.id}?edit=true`,
                            )
                          }
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/admin/utilisateurs/${user.id}?role=true`,
                            )
                          }
                        >
                          <ShieldCheck className="h-4 w-4 mr-2" />
                          Changer le rôle
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          onClick={() =>
                            toggleActifMutation.mutate({
                              id: user.id,
                              actif: !user.actif,
                            })
                          }
                        >
                          {user.actif ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Désactiver
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activer
                            </>
                          )}
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                          className="text-odc-error focus:text-odc-error"
                          onClick={() => setDeleteTarget(user)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
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

        {/* Pagination */}
        {data?.pagination?.totalPages > 1 && (
          <div className="p-4 border-t border-odc-border">
            <Pagination
              currentPage={data.pagination.page}
              totalPages={data.pagination.totalPages}
            />
          </div>
        )}
      </Card>

      {/* Dialog suppression */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer cet utilisateur ?</DialogTitle>
            <DialogDescription>
              Cette action est réversible (soft delete). L&apos;utilisateur{' '}
              <strong>
                {deleteTarget?.prenom} {deleteTarget?.nom}
              </strong>{' '}
              ne pourra plus se connecter.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteTarget && deleteMutation.mutate(deleteTarget.id)
              }
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Suppression…' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}