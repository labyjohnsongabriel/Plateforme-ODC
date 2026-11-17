// src/app/(admin)/admin/domaines/[id]/components/DomaineDetails.tsx
'use client';

import * as React from 'react';
import {
  Globe,
  Palette,
  Hash,
  Power,
  Eye,
  EyeOff,
  Calendar,
  ListOrdered,
  FileText,
  Sparkles,
  Pencil,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Domaine } from '../hooks/useDomaines';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface DomaineDetailsProps {
  domaine: Domaine;
  onEdit?: () => void;
  onBack?: () => void;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════════ */

function DomaineDetails({ domaine, onEdit, onBack }: DomaineDetailsProps) {
  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl shadow-odc-md ring-1 ring-odc-border/60"
            style={{ backgroundColor: `${domaine.couleur}20` }}
          >
            {domaine.icone ? (
              <span aria-hidden>{domaine.icone}</span>
            ) : (
              <Sparkles className="h-7 w-7" style={{ color: domaine.couleur }} aria-hidden />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold tracking-tight text-odc-text-primary">
                {domaine.nom}
              </h1>
              {domaine.estPubliee ? (
                <Badge className="bg-odc-success-soft text-odc-success-dark hover:bg-odc-success-soft">
                  <Eye className="mr-1 h-3 w-3" aria-hidden />
                  Publié
                </Badge>
              ) : (
                <Badge variant="outline" className="text-odc-text-muted">
                  <EyeOff className="mr-1 h-3 w-3" aria-hidden />
                  Brouillon
                </Badge>
              )}
              {domaine.actif ? (
                <Badge className="bg-odc-info-soft text-odc-info-dark hover:bg-odc-info-soft">
                  <Power className="mr-1 h-3 w-3" aria-hidden />
                  Actif
                </Badge>
              ) : (
                <Badge variant="outline" className="text-odc-text-muted">
                  <Power className="mr-1 h-3 w-3" aria-hidden />
                  Inactif
                </Badge>
              )}
            </div>
            <p className="flex items-center gap-1.5 font-mono text-sm text-odc-text-muted">
              <Globe className="h-3.5 w-3.5" aria-hidden />/{domaine.slug}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden />
              Retour
            </Button>
          )}
          {onEdit && (
            <Button variant="odc" size="sm" onClick={onEdit}>
              <Pencil className="mr-1.5 h-4 w-4" aria-hidden />
              Modifier
            </Button>
          )}
        </div>
      </div>

      {/* ─── Grille de détails ───────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-odc-primary" aria-hidden />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              {domaine.description ? (
                <p className="whitespace-pre-line leading-relaxed text-odc-text-secondary">
                  {domaine.description}
                </p>
              ) : (
                <p className="italic text-odc-text-muted">
                  Aucune description renseignée.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ListOrdered className="h-4 w-4 text-odc-primary" aria-hidden />
                Métadonnées
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <DetailRow icon={Hash} label="Slug URL" value={domaine.slug} mono />
                <DetailRow
                  icon={ListOrdered}
                  label="Ordre d'affichage"
                  value={String(domaine.ordreAffichage ?? 0)}
                />
                <DetailRow
                  icon={Calendar}
                  label="Créé le"
                  value={formatDate(domaine.createdAt)}
                />
                <DetailRow
                  icon={Calendar}
                  label="Modifié le"
                  value={formatDate(domaine.updatedAt)}
                />
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4 text-odc-primary" aria-hidden />
                Apparence
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-odc-text-muted">
                  Couleur
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 shrink-0 rounded-lg ring-1 ring-odc-border/60"
                    style={{ backgroundColor: domaine.couleur }}
                    aria-hidden
                  />
                  <code className="rounded-md bg-odc-surface-alt px-2 py-1 font-mono text-sm text-odc-text-primary">
                    {domaine.couleur}
                  </code>
                </div>
              </div>

              <Separator />

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-odc-text-muted">
                  Icône
                </p>
                {domaine.icone ? (
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-odc-surface-alt text-2xl">
                      {domaine.icone}
                    </span>
                    <span className="text-sm text-odc-text-secondary">
                      Emoji personnalisé
                    </span>
                  </div>
                ) : (
                  <p className="text-sm italic text-odc-text-muted">Aucune icône</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-odc-primary" aria-hidden />
                Aperçu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="rounded-xl border-2 p-4"
                style={{
                  borderColor: `${domaine.couleur}40`,
                  backgroundColor: `${domaine.couleur}10`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-xl"
                    style={{ backgroundColor: `${domaine.couleur}30` }}
                  >
                    {domaine.icone || '📚'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold" style={{ color: domaine.couleur }}>
                      {domaine.nom}
                    </p>
                    <p className="truncate text-xs text-odc-text-muted">/{domaine.slug}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SOUS-COMPOSANTS
   ═══════════════════════════════════════════════════════════════════════════ */

interface DetailRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}

function DetailRow({ icon: Icon, label, value, mono }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-odc-surface-alt">
        <Icon className="h-4 w-4 text-odc-text-muted" aria-hidden />
      </div>
      <div className="min-w-0">
        <dt className="text-xs font-semibold uppercase tracking-wider text-odc-text-muted">
          {label}
        </dt>
        <dd
          className={cn(
            'mt-0.5 truncate text-sm text-odc-text-primary',
            mono && 'font-mono',
          )}
        >
          {value}
        </dd>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function formatDate(date?: string | Date | null): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   ✅ DOUBLE EXPORT — résout l'erreur "Unsupported Server Component"
   ═══════════════════════════════════════════════════════════════════════════ */

export default DomaineDetails;
export { DomaineDetails };