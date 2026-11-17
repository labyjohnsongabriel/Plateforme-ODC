// src/app/(participant)/participant/reseau/demandes/components/ConnectionRequestCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Check,
  X,
  Loader2,
  MapPin,
  Building2,
  ExternalLink,
  MessageSquare,
  Clock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/formatters';

interface ConnectionRequest {
  id: string;
  message?: string | null;
  createdAt: string;
  expediteur?: {
    id: string;
    prenom?: string | null;
    nom?: string | null;
    photoUrl?: string | null;
    ville?: string | null;
    entreprise?: string | null;
    role?: { nom?: string; libelle?: string } | null;
  } | null;
}

interface Props {
  request: ConnectionRequest;
  onAccept: () => void;
  onRefuse: () => void;
  isLoading: boolean;
}

export function ConnectionRequestCard({
  request,
  onAccept,
  onRefuse,
  isLoading,
}: Props) {
  const [imageError, setImageError] = useState(false);
  const user = request.expediteur;
  const initials = user
    ? getInitials(user.nom ?? '', user.prenom ?? '')
    : '?';
  const roleLabel = user?.role?.libelle ?? user?.role?.nom ?? 'Membre';

  return (
    <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <CardContent className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-1">
            <Avatar className="h-14 w-14 shrink-0 ring-2 ring-background">
              {user?.photoUrl && !imageError ? (
                <AvatarImage
                  src={user.photoUrl}
                  alt=""
                  onError={() => setImageError(true)}
                />
              ) : null}
              <AvatarFallback className="bg-primary/10 font-display font-bold text-primary dark:bg-primary/15">
                {initials}
              </AvatarFallback>
            </Avatar>
            {/* Indicateur nouveau (moins de 24h) */}
            {isRecent(request.createdAt) && (
              <Badge className="border border-amber-200 bg-amber-50 text-[9px] text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                Nouveau
              </Badge>
            )}
          </div>

          {/* Infos */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="mb-0.5 line-clamp-1 font-display font-semibold text-foreground">
                  {user?.prenom ?? ''} {user?.nom ?? ''}
                </h3>
                <Badge variant="outline" className="text-[10px] font-medium">
                  {roleLabel}
                </Badge>
              </div>

              {/* Actions rapides (profil / message) */}
              {user?.id && (
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    asChild
                    aria-label={`Voir le profil de ${user.prenom ?? ''} ${user.nom ?? ''}`}
                  >
                    <Link href={`/participant/reseau/profil/${user.id}`}>
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
              {user?.ville && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" aria-hidden="true" />
                  {user.ville}
                </span>
              )}
              {user?.entreprise && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" aria-hidden="true" />
                  {user.entreprise}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        {request.message && (
          <div className="mt-3 rounded-lg border border-border bg-muted/30 p-3">
            <p className="line-clamp-2 text-sm italic text-muted-foreground">
              « {request.message} »
            </p>
          </div>
        )}

        {/* Date */}
        <p className="mt-3 flex items-center gap-1 text-[10px] tabular-nums text-muted-foreground">
          <Clock className="h-2.5 w-2.5" aria-hidden="true" />
          Reçue {formatRelativeTime(request.createdAt)}
        </p>

        {/* Actions */}
        <div className="mt-auto flex gap-2 pt-4">
          <Button
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={onAccept}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
            )}
            Accepter
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={onRefuse}
            disabled={isLoading}
          >
            <X className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Refuser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPER
   ═══════════════════════════════════════════════════════════════════════════ */

function isRecent(date: string): boolean {
  try {
    const diff = Date.now() - new Date(date).getTime();
    return diff < 24 * 60 * 60 * 1000; // 24h
  } catch {
    return false;
  }
}