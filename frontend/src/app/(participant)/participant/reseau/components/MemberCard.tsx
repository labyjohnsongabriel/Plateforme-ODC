// src/app/(participant)/participant/reseau/annuaire/components/MemberCard.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Building2,
  UserPlus,
  Check,
  Loader2,
  MessageSquare,
  ExternalLink,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

interface DirectoryUser {
  id: string;
  prenom?: string | null;
  nom?: string | null;
  photoUrl?: string | null;
  ville?: string | null;
  entreprise?: string | null;
  role?: { nom?: string; libelle?: string } | null;
  isConnected?: boolean;
  hasPendingRequest?: boolean;
}

interface Props {
  user: DirectoryUser;
  onConnect: () => void;
  isConnecting: boolean;
}

export function MemberCard({ user: u, onConnect, isConnecting }: Props) {
  const [imageError, setImageError] = useState(false);
  const roleLabel = u.role?.libelle ?? u.role?.nom ?? 'Membre';
  const initials = getInitials(u.nom ?? '', u.prenom ?? '');

  return (
    <Card className="group flex flex-col overflow-hidden text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <CardContent className="flex flex-1 flex-col p-5">
        <Avatar className="mx-auto mb-3 h-16 w-16 ring-2 ring-background">
          {u.photoUrl && !imageError ? (
            <AvatarImage
              src={u.photoUrl}
              alt=""
              onError={() => setImageError(true)}
            />
          ) : null}
          <AvatarFallback className="bg-primary/10 font-display font-bold text-primary dark:bg-primary/15">
            {initials}
          </AvatarFallback>
        </Avatar>

        <h3 className="mb-1 line-clamp-1 font-display font-semibold text-foreground">
          {u.prenom ?? ''} {u.nom ?? ''}
        </h3>
        <Badge variant="outline" className="mx-auto mb-3 text-[10px] font-medium">
          {roleLabel}
        </Badge>

        <div className="mb-4 space-y-1 text-xs text-muted-foreground">
          {u.entreprise && (
            <div className="flex items-center justify-center gap-1.5">
              <Building2 className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{u.entreprise}</span>
            </div>
          )}
          {u.ville && (
            <div className="flex items-center justify-center gap-1.5">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{u.ville}</span>
            </div>
          )}
        </div>

        <div className="mt-auto flex gap-2">
          {u.isConnected ? (
            <Button variant="outline" size="sm" className="flex-1" disabled>
              <Check className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Connecté
            </Button>
          ) : u.hasPendingRequest ? (
            <Button variant="outline" size="sm" className="flex-1" disabled>
              <Loader2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              En attente
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={onConnect}
              disabled={isConnecting}
            >
              {isConnecting ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <UserPlus className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              )}
              {isConnecting ? 'Envoi…' : 'Se connecter'}
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:bg-primary/10 hover:text-primary"
            asChild
            aria-label={`Voir le profil de ${u.prenom ?? ''} ${u.nom ?? ''}`}
          >
            <Link href={`/participant/reseau/profil/${u.id}`}>
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}