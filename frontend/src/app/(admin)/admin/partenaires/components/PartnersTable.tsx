// src/app/(admin)/admin/partenaires/components/PartnersTable.tsx
'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Building2,
  Globe,
  Mail,
  Phone,
  ExternalLink,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { cn } from '@/lib/utils';
import {
  usePartenaires,
  useTogglePublishPartenaire,
  type Partenaire,
} from '@/hooks/usePartenaires';
import { PartnerFormModal } from './PartnerFormModal';
import { DeletePartnerDialog } from './DeletePartnerDialog';

/* ============================================================================
   SQUELETTE
   ============================================================================ */

function TableSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="divide-y divide-odc-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-12 w-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function PartnersTable() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filters = {
    page: Number(searchParams.get('page')) || 1,
    limit: 10,
    statut:
      (searchParams.get('statut') as 'all' | 'published' | 'draft') ?? 'all',
  };

  const { data, isLoading, isError } = usePartenaires(filters);
  const togglePublish = useTogglePublishPartenaire();

  const [editingPartenaire, setEditingPartenaire] =
    React.useState<Partenaire | null>(null);
  const [deletingPartenaire, setDeletingPartenaire] =
    React.useState<Partenaire | null>(null);
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);

  if (isLoading) return <TableSkeleton />;

  if (isError) {
    return (
      <Card>
        <EmptyState
          icon={Building2}
          title="Erreur de chargement"
          description="Impossible de charger les partenaires."
          action={
            <Button variant="outline" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          }
        />
      </Card>
    );
  }

  const partenaires = data?.data ?? [];

  if (!partenaires.length) {
    return (
      <>
        <Card>
          <EmptyState
            icon={Building2}
            title="Aucun partenaire"
            description="Ajoutez votre premier partenaire pour enrichir l'écosystème ODC."
            action={
              <Button variant="odc" onClick={() => setIsCreateOpen(true)}>
                <Building2 className="mr-2 h-4 w-4" />
                Ajouter un partenaire
              </Button>
            }
          />
        </Card>

        <PartnerFormModal
          mode="create"
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
        />
      </>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[35%]">Partenaire</TableHead>
              <TableHead className="hidden md:table-cell">Secteur</TableHead>
              <TableHead className="hidden lg:table-cell">Contact</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {partenaires.map((p) => (
              <TableRow
                key={p.id}
                className="group transition-colors hover:bg-odc-surface-hover"
              >
                {/* Partenaire */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    {p.logoUrl ? (
                      <img
                        src={p.logoUrl}
                        alt=""
                        className="h-11 w-11 shrink-0 rounded-lg bg-odc-surface-alt object-contain ring-1 ring-odc-border"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-odc-primary-soft">
                        <Building2 className="h-5 w-5 text-odc-primary" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-odc-text-primary">
                        {p.nom}
                      </p>
                      <p className="truncate font-mono text-xs text-odc-text-muted">
                        {p.slug}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Secteur */}
                <TableCell className="hidden md:table-cell text-sm">
                  {p.secteur ? (
                    <span className="inline-flex items-center rounded-full bg-odc-surface-alt px-2.5 py-0.5 text-xs font-medium text-odc-text-secondary">
                      {p.secteur}
                    </span>
                  ) : (
                    <span className="text-xs text-odc-text-muted">—</span>
                  )}
                </TableCell>

                {/* Contact */}
                <TableCell className="hidden lg:table-cell">
                  <div className="space-y-1 text-xs">
                    {p.contactEmail && (
                      <div className="flex items-center gap-1.5 text-odc-text-secondary">
                        <Mail className="h-3 w-3 shrink-0 text-odc-text-muted" />
                        <span className="truncate">{p.contactEmail}</span>
                      </div>
                    )}
                    {p.contactTel && (
                      <div className="flex items-center gap-1.5 text-odc-text-secondary">
                        <Phone className="h-3 w-3 shrink-0 text-odc-text-muted" />
                        <span className="truncate">{p.contactTel}</span>
                      </div>
                    )}
                    {!p.contactEmail && !p.contactTel && (
                      <span className="text-odc-text-muted">—</span>
                    )}
                  </div>
                </TableCell>

                {/* Statut */}
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {p.estPubliee ? (
                      <Badge className="bg-odc-success-soft text-odc-success-dark hover:bg-odc-success-soft">
                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-odc-success" />
                        Publié
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-odc-text-muted">
                        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-odc-text-muted" />
                        Brouillon
                      </Badge>
                    )}
                    {!p.actif && (
                      <span className="text-[10px] font-medium text-odc-error">
                        Inactif
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Actions */}
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
                        onClick={() => setEditingPartenaire(p)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Modifier
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          togglePublish.mutate({
                            id: p.id,
                            estPubliee: !p.estPubliee,
                          })
                        }
                        disabled={togglePublish.isPending}
                      >
                        {p.estPubliee ? (
                          <>
                            <EyeOff className="mr-2 h-4 w-4" />
                            Dépublier
                          </>
                        ) : (
                          <>
                            <Eye className="mr-2 h-4 w-4" />
                            Publier
                          </>
                        )}
                      </DropdownMenuItem>

                      {p.siteWeb && (
                        <DropdownMenuItem
                          onClick={() =>
                            window.open(p.siteWeb, '_blank', 'noopener')
                          }
                        >
                          <Globe className="mr-2 h-4 w-4" />
                          Visiter le site
                          <ExternalLink className="ml-auto h-3 w-3" />
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        className="text-odc-error focus:bg-odc-error-soft focus:text-odc-error"
                        onClick={() => setDeletingPartenaire(p)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modales */}
      <PartnerFormModal
        mode="create"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />

      <PartnerFormModal
        mode="edit"
        id={editingPartenaire?.id}
        open={!!editingPartenaire}
        onOpenChange={(open) => !open && setEditingPartenaire(null)}
      />

      <DeletePartnerDialog
        partenaire={deletingPartenaire}
        open={!!deletingPartenaire}
        onOpenChange={(open) => !open && setDeletingPartenaire(null)}
      />
    </>
  );
}