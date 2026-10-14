// src/app/(admin)/admin/sessions/[id]/components/SessionPresenceToggle.tsx
'use client';

import * as React from 'react';
import {
  QrCode,
  Lock,
  Unlock,
  AlertCircle,
  RefreshCw,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import {
  useTogglePresenceSession,
  STATUTS_SESSION_LABELS,
  type Session,
} from '@/hooks/useSessions';

/* ============================================================================
   TYPES
   ============================================================================ */

interface SessionPresenceToggleProps {
  /** Session à contrôler */
  session: Session;
  /** Variante visuelle */
  variant?: 'inline' | 'card';
  /** Callback après succès */
  onSuccess?: (ouverte: boolean) => void;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function SessionPresenceToggle({
  session,
  variant = 'inline',
  onSuccess,
}: SessionPresenceToggleProps) {
  const togglePresence = useTogglePresenceSession();
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  /* -------------------- Règles métier -------------------- */
  const canOpen = ['OUVERTE', 'EN_COURS'].includes(session.statut);
  const isOpen = session.presenceOuverte;

  // Message contextuel
  const getHint = () => {
    if (isOpen) {
      return 'Les participants peuvent scanner le QR code pour pointer';
    }
    if (canOpen) {
      return 'Ouvrez pour permettre le pointage par QR code';
    }
    return `Impossible : la session doit être OUVERTE ou EN_COURS (actuel : ${STATUTS_SESSION_LABELS[session.statut]})`;
  };

  /* -------------------- Handlers -------------------- */
  const handleClick = () => {
    // Si on ouvre la présence → demander confirmation
    if (!isOpen && canOpen) {
      setConfirmOpen(true);
      return;
    }
    // Si on ferme → confirmation aussi (action importante)
    if (isOpen) {
      setConfirmOpen(true);
      return;
    }
  };

  const handleConfirm = () => {
    togglePresence.mutate(
      { id: session.id, ouverte: !isOpen },
      {
        onSuccess: () => {
          setConfirmOpen(false);
          onSuccess?.(!isOpen);
        },
        onError: () => {
          setConfirmOpen(false);
        },
      },
    );
  };

  /* -------------------- Rendu compact (inline) -------------------- */
  if (variant === 'inline') {
    return (
      <>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isOpen ? 'outline' : 'odc'}
                size="sm"
                onClick={handleClick}
                disabled={!canOpen || togglePresence.isPending}
                loading={togglePresence.isPending}
                leftIcon={
                  isOpen ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <QrCode className="h-4 w-4" />
                  )
                }
                className="relative"
              >
                {isOpen ? 'Fermer la présence' : 'Ouvrir la présence'}

                {/* Indicateur actif */}
                {isOpen && (
                  <span
                    className="absolute -right-1 -top-1 flex h-3 w-3"
                    aria-hidden="true"
                  >
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-odc-success opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-odc-success" />
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6}>
              {getHint()}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Dialogue de confirmation */}
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          isOpen={isOpen}
          onConfirm={handleConfirm}
          isPending={togglePresence.isPending}
        />
      </>
    );
  }

  /* -------------------- Rendu carte (card) -------------------- */
  return (
    <>
      <div
        className={cn(
          'rounded-lg border-2 p-4 transition-all duration-odc-base',
          isOpen
            ? 'border-odc-success bg-odc-success-soft/30 shadow-odc-sm'
            : 'border-odc-border bg-odc-surface-alt/30',
        )}
      >
        {/* En-tête */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {/* Icône statut */}
              <div
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  isOpen
                    ? 'bg-odc-success-soft'
                    : 'bg-odc-surface-alt',
                )}
              >
                {isOpen ? (
                  <Unlock className="h-4 w-4 text-odc-success" />
                ) : (
                  <Lock className="h-4 w-4 text-odc-text-muted" />
                )}
              </div>

              <div className="min-w-0">
                <p
                  className={cn(
                    'text-sm font-semibold',
                    isOpen
                      ? 'text-odc-success-dark'
                      : 'text-odc-text-primary',
                  )}
                >
                  {isOpen ? 'Présence ouverte' : 'Présence fermée'}
                </p>
                <p className="mt-0.5 text-xs text-odc-text-muted">
                  {isOpen
                    ? 'Les participants peuvent pointer'
                    : canOpen
                      ? 'En attente d\'ouverture'
                      : 'Statut incompatible'}
                </p>
              </div>
            </div>
          </div>

          {/* Indicateur pulsant */}
          {isOpen && (
            <span
              className="relative flex h-3 w-3 shrink-0"
              aria-hidden="true"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-odc-success opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-odc-success" />
            </span>
          )}
        </div>

        {/* Message contextuel */}
        <div className="mt-3 rounded-md bg-odc-surface/60 px-3 py-2">
          <p className="text-xs text-odc-text-secondary">{getHint()}</p>
        </div>

        {/* Bouton principal */}
        <Button
          variant={isOpen ? 'outline' : 'odc'}
          size="default"
          onClick={handleClick}
          disabled={!canOpen && !isOpen}
          loading={togglePresence.isPending}
          loadingText={isOpen ? 'Fermeture…' : 'Ouverture…'}
          className="mt-3 w-full"
          leftIcon={
            isOpen ? (
              <Lock className="h-4 w-4" />
            ) : (
              <QrCode className="h-4 w-4" />
            )
          }
        >
          {isOpen ? 'Fermer la présence' : 'Ouvrir la présence'}
        </Button>

        {/* Avertissement si non autorisé */}
        {!canOpen && !isOpen && (
          <div className="mt-3 flex items-start gap-2 rounded-md bg-odc-warning-soft px-3 py-2">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-odc-warning-dark" />
            <p className="text-xs text-odc-warning-dark">
              Changez le statut de la session en{' '}
              <strong>OUVERTE</strong> ou <strong>EN_COURS</strong> pour
              activer la présence.
            </p>
          </div>
        )}
      </div>

      {/* Dialogue de confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        isOpen={isOpen}
        onConfirm={handleConfirm}
        isPending={togglePresence.isPending}
      />
    </>
  );
}

/* ============================================================================
   DIALOGUE DE CONFIRMATION
   ============================================================================ */

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isOpen: boolean;
  onConfirm: () => void;
  isPending: boolean;
}

function ConfirmDialog({
  open,
  onOpenChange,
  isOpen,
  onConfirm,
  isPending,
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div
            className={cn(
              'mb-2 flex h-12 w-12 items-center justify-center rounded-full',
              isOpen ? 'bg-odc-warning-soft' : 'bg-odc-success-soft',
            )}
          >
            {isOpen ? (
              <Lock className="h-6 w-6 text-odc-warning" />
            ) : (
              <QrCode className="h-6 w-6 text-odc-success" />
            )}
          </div>

          <AlertDialogTitle className="font-display text-lg">
            {isOpen ? 'Fermer la présence ?' : 'Ouvrir la présence ?'}
          </AlertDialogTitle>

          <AlertDialogDescription className="space-y-3 pt-2 text-sm">
            {isOpen ? (
              <p>
                Les participants ne pourront plus scanner le QR code pour
                pointer. Les présences déjà enregistrées sont{' '}
                <strong>conservées</strong>.
              </p>
            ) : (
              <p>
                Le QR code sera généré et les participants pourront pointer
                leur présence pendant toute la durée de la session.
              </p>
            )}

            {/* Info bonus */}
            <div className="flex items-start gap-2 rounded-md bg-odc-surface-alt/60 px-3 py-2">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-odc-text-muted" />
              <p className="text-xs text-odc-text-secondary">
                {isOpen
                  ? 'Vous pourrez la réouvrir à tout moment.'
                  : 'La présence sera automatiquement fermée quand la session sera marquée "Terminée".'}
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <AlertDialogCancel disabled={isPending}>
            Annuler
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isPending}
            className={cn(
              isOpen
                ? 'bg-odc-warning text-white hover:bg-odc-warning-dark'
                : 'bg-odc-success text-white hover:bg-odc-success-dark',
            )}
          >
            {isPending ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                {isOpen ? 'Fermeture…' : 'Ouverture…'}
              </>
            ) : (
              <>
                {isOpen ? (
                  <Lock className="mr-2 h-4 w-4" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                {isOpen ? 'Fermer' : 'Ouvrir'}
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}