// src/app/(participant)/participant/reseau/profil/[id]/components/ProfileHeader.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Building2,
  Briefcase,
  MessageSquare,
  UserPlus,
  UserCheck,
  Clock,
  Loader2,
  Globe,
  Linkedin,
  ExternalLink,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { ProfileUser } from './ProfileDetail';

interface Props {
  profile: ProfileUser;
  onMessage: () => void;
  onConnect: () => void;
  isMessagePending: boolean;
  isConnectPending: boolean;
}

export function ProfileHeader({
  profile,
  onMessage,
  onConnect,
  isMessagePending,
  isConnectPending,
}: Props) {
  const [imageError, setImageError] = useState(false);
  const roleLabel = profile.role?.libelle ?? profile.role?.nom ?? 'Membre';
  const initials = getInitials(profile.nom ?? '', profile.prenom ?? '');
  const fullName =
    `${profile.prenom ?? ''} ${profile.nom ?? ''}`.trim() || 'Utilisateur';

  return (
    <Card className="overflow-hidden">
      {/* Bandeau gradient top */}
      <div className="h-24 bg-gradient-to-r from-primary via-primary/80 to-primary/60" />

      <div className="px-6 pb-6">
        {/* Avatar + nom + actions */}
        <div className="-mt-12 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-end gap-4">
            <Avatar className="h-24 w-24 shrink-0 ring-4 ring-background shadow-md">
              {profile.photoUrl && !imageError ? (
                <AvatarImage
                  src={profile.photoUrl}
                  alt=""
                  onError={() => setImageError(true)}
                />
              ) : null}
              <AvatarFallback className="bg-primary/10 font-display text-2xl font-bold text-primary dark:bg-primary/15">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="pb-2">
              <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                {fullName}
              </h1>
              <Badge variant="outline" className="mt-1.5 text-xs font-medium">
                {roleLabel}
              </Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 pb-2">
            {/* Badge "Connecté" */}
            {profile.isConnected && (
              <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
                <UserCheck className="mr-1 h-3 w-3" aria-hidden="true" />
                Connecté
              </Badge>
            )}

            {/* Bouton Message (toujours visible) */}
            <Button
              variant="outline"
              onClick={onMessage}
              disabled={isMessagePending}
            >
              {isMessagePending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <MessageSquare className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              Message
            </Button>

            {/* Bouton Se connecter OU "En attente" OU lien vers demandes */}
            {!profile.isConnected && !profile.hasPendingRequest && (
              <Button
                onClick={onConnect}
                disabled={isConnectPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isConnectPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <UserPlus className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                Se connecter
              </Button>
            )}

            {/* ⭐ NOUVEAU : bouton "En attente" (désactivé) + lien vers demandes */}
            {!profile.isConnected && profile.hasPendingRequest && (
              <>
                <Button variant="outline" disabled>
                  <Clock className="mr-2 h-4 w-4" aria-hidden="true" />
                  En attente
                </Button>
                <Button variant="ghost" size="sm" asChild>
                  <Link
                    href="/participant/reseau/demandes?tab=envoyees"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Voir mes demandes
                    <ExternalLink
                      className="ml-1.5 h-3.5 w-3.5"
                      aria-hidden="true"
                    />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Meta info */}
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
          {profile.poste && (
            <span className="inline-flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" aria-hidden="true" />
              {profile.poste}
            </span>
          )}
          {profile.entreprise && (
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
              {profile.entreprise}
            </span>
          )}
          {profile.ville && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              {profile.ville}
              {profile.pays && `, ${profile.pays}`}
            </span>
          )}
          {profile.siteWeb && (
            <a
              href={profile.siteWeb}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <Globe className="h-3.5 w-3.5" aria-hidden="true" />
              Site web
            </a>
          )}
          {profile.linkedinUrl && (
            <a
              href={profile.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
            >
              <Linkedin className="h-3.5 w-3.5" aria-hidden="true" />
              LinkedIn
            </a>
          )}
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {profile.bio}
          </p>
        )}

        {/* Compétences */}
        {profile.competences && profile.competences.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {profile.competences.slice(0, 8).map((c) => (
              <Badge
                key={c}
                variant="outline"
                className="text-[11px] font-medium"
              >
                {c}
              </Badge>
            ))}
            {profile.competences.length > 8 && (
              <Badge variant="outline" className="text-[11px]">
                +{profile.competences.length - 8}
              </Badge>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}