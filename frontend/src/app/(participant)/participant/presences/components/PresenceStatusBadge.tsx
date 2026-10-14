// src/app/(participant)/participant/presences/components/PresenceDetailModal.tsx
'use client';

import {
  Calendar,
  MapPin,
  Clock,
  User,
  QrCode,
  Keyboard,
  Award,
  FileText,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { PresenceStatusBadge } from './PresenceStatusBadge';

interface PresenceDetailModalProps {
  presence: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PresenceDetailModal({
  presence,
  open,
  onOpenChange,
}: PresenceDetailModalProps) {
  if (!presence) return null;

  const isQrCode = presence.methode === 'QR_CODE';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0">
        {/* En-tête */}
        <DialogHeader className="shrink-0 border-b border-odc-border bg-odc-surface px-6 py-5">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-odc-primary-soft">
              <Clock className="h-6 w-6 text-odc-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="font-display text-lg font-bold">
                Détail de la présence
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-sm">
                {presence.session?.formation?.titre ??
                  'Session de formation'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Contenu */}
        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-5">
            {/* Statut */}
            <div className="flex items-center gap-2">
              <PresenceStatusBadge
                statut={presence.statut}
                size="md"
              />
              <Badge variant="outline" className="text-xs">
                {isQrCode ? (
                  <>
                    <QrCode className="mr-1 h-3 w-3" />
                    QR Code
                  </>
                ) : (
                  <>
                    <Keyboard className="mr-1 h-3 w-3" />
                    Saisie manuelle
                  </>
                )}
              </Badge>
            </div>

            {/* Info card */}
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem
                icon={Calendar}
                label="Date de présence"
                value={formatDate(presence.datePresence)}
              />
              {presence.scanneLe && (
                <InfoItem
                  icon={Clock}
                  label="Enregistré le"
                  value={formatDateTime(presence.scanneLe)}
                />
              )}
              {presence.session?.codeSession && (
                <InfoItem
                  icon={FileText}
                  label="Code session"
                  value={presence.session.codeSession}
                  mono
                />
              )}
              {presence.session?.lieu && (
                <InfoItem
                  icon={MapPin}
                  label="Lieu"
                  value={presence.session.lieu}
                />
              )}
            </div>

            {/* Formateur */}
            {presence.session?.formateur && (
              <>
                <Separator />
                <div className="rounded-lg border border-odc-border p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-odc-text-muted">
                    Formateur
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-odc-primary-soft text-sm font-bold text-odc-primary">
                      {presence.session.formateur.prenom?.charAt(0)}
                      {presence.session.formateur.nom?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {presence.session.formateur.prenom}{' '}
                        {presence.session.formateur.nom}
                      </p>
                      <p className="truncate text-xs text-odc-text-muted">
                        {presence.session.formateur.email}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Score */}
            {presence.scoreSelection !== undefined &&
              presence.scoreSelection !== null && (
                <>
                  <Separator />
                  <div className="rounded-lg border border-odc-border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-odc-primary" />
                        <p className="text-sm font-medium">
                          Score de présence
                        </p>
                      </div>
                      <span className="font-display text-lg font-bold text-odc-primary">
                        {presence.scoreSelection}
                      </span>
                    </div>
                  </div>
                </>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================================
   SOUS-COMPOSANT
   ============================================================================ */

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  mono?: boolean;
}

function InfoItem({ icon: Icon, label, value, mono }: InfoItemProps) {
  return (
    <div className="rounded-lg border border-odc-border p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-odc-text-muted" />
        <p className="text-xs font-medium text-odc-text-muted">
          {label}
        </p>
      </div>
      <p
        className={cn(
          'mt-1 font-semibold text-odc-text-primary',
          mono ? 'font-mono text-xs' : 'text-sm',
        )}
      >
        {value}
      </p>
    </div>
  );
}