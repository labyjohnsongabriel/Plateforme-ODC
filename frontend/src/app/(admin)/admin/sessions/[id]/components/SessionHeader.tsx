'use client';

import {
  Edit,
  Eye,
  EyeOff,
  ExternalLink,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import {
  useTogglePublishSession,
  useChangeSessionStatut,
  STATUTS_SESSION,
  STATUTS_SESSION_LABELS,
  type Session,
  type StatutSession,
} from '@/hooks/useSessions';

/* ============================================================================
   CONFIGURATION
   ============================================================================ */

const STATUT_COLORS: Record<StatutSession, string> = {
  PLANIFIEE: 'bg-blue-50 text-blue-700 ring-blue-200',
  OUVERTE: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  EN_COURS:
    'bg-odc-primary-soft text-odc-primary-active ring-odc-primary-light/40',
  TERMINEE: 'bg-odc-surface-alt text-odc-text-secondary ring-odc-border',
  ANNULEE: 'bg-odc-error-soft text-odc-error-dark ring-odc-error/30',
};

/* ============================================================================
   TYPES
   ============================================================================ */

interface SessionHeaderProps {
  session: Session;
  onEdit: () => void;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function SessionHeader({ session, onEdit }: SessionHeaderProps) {
  const togglePublish = useTogglePublishSession();
  const changeStatut = useChangeSessionStatut();

  const handleTogglePublish = () => {
    togglePublish.mutate({
      id: session.id,
      estPubliee: !session.estPubliee,
    });
  };

  const handleChangeStatut = (statut: StatutSession) => {
    changeStatut.mutate({ id: session.id, statut });
  };

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-odc-border bg-odc-surface p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Titre + badges */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-odc-text-primary md:text-3xl">
              {session.formation?.titre ?? 'Session'}
            </h1>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {/* Code session */}
            <span className="inline-flex items-center gap-1.5 rounded-md bg-odc-surface-alt px-2.5 py-1 font-mono text-xs font-medium text-odc-text-secondary">
              {session.codeSession}
            </span>

            {/* Statut */}
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
                STATUT_COLORS[session.statut],
              )}
            >
              {STATUTS_SESSION_LABELS[session.statut]}
            </span>

            {/* Publication */}
            {session.estPubliee ? (
              <Badge className="bg-odc-success-soft text-odc-success-dark hover:bg-odc-success-soft">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-odc-success" />
                Publiée
              </Badge>
            ) : (
              <Badge variant="outline" className="text-odc-text-muted">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-odc-text-muted" />
                Brouillon
              </Badge>
            )}

            {/* Présence */}
            {session.presenceOuverte && (
              <Badge className="bg-odc-primary-soft text-odc-primary-active hover:bg-odc-primary-soft">
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-odc-primary animate-pulse" />
                Présence ouverte
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 flex-wrap gap-2">
          {/* Changer statut */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Clock className="mr-2 h-4 w-4" />
                Statut
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Changer le statut</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {STATUTS_SESSION.map((s) => (
                <DropdownMenuItem
                  key={s}
                  onClick={() => handleChangeStatut(s)}
                  disabled={s === session.statut || changeStatut.isPending}
                  className={cn(
                    s === session.statut && 'font-semibold',
                  )}
                >
                  {s === 'OUVERTE' && <PlayCircle className="mr-2 h-4 w-4" />}
                  {s === 'EN_COURS' && <PlayCircle className="mr-2 h-4 w-4" />}
                  {s === 'TERMINEE' && (
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                  )}
                  {s === 'ANNULEE' && <XCircle className="mr-2 h-4 w-4" />}
                  {s === 'PLANIFIEE' && <Clock className="mr-2 h-4 w-4" />}
                  {STATUTS_SESSION_LABELS[s]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Publier / Dépublier */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleTogglePublish}
            disabled={togglePublish.isPending}
            leftIcon={
              session.estPubliee ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )
            }
          >
            {session.estPubliee ? 'Dépublier' : 'Publier'}
          </Button>

          {/* Voir la page publique */}
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ExternalLink className="h-4 w-4" />}
            onClick={() =>
              window.open(`/sessions/${session.codeSession}`, '_blank')
            }
          >
            Voir la page
          </Button>

          {/* Modifier */}
          <Button
            variant="odc"
            size="sm"
            leftIcon={<Edit className="h-4 w-4" />}
            onClick={onEdit}
          >
            Modifier
          </Button>
        </div>
      </div>
    </div>
  );
}