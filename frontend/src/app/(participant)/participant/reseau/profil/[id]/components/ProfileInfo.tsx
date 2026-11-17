// src/app/(participant)/participant/reseau/profil/[id]/components/ProfileInfo.tsx
'use client';

import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Calendar,
  FileText,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/formatters';
import type { ProfileUser } from './ProfileDetail';

interface Props {
  profile: ProfileUser;
}

export function ProfileInfo({ profile }: Props) {
  const hasContact =
    profile.email || profile.telephone || profile.ville || profile.entreprise;

  return (
    <div className="space-y-6">
      {/* Contact */}
      {hasContact && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Coordonnées</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.email && (
              <InfoRow
                icon={Mail}
                label="Email"
                value={profile.email}
                href={`mailto:${profile.email}`}
              />
            )}
            {profile.telephone && (
              <InfoRow
                icon={Phone}
                label="Téléphone"
                value={profile.telephone}
                href={`tel:${profile.telephone}`}
              />
            )}
            {profile.ville && (
              <InfoRow
                icon={MapPin}
                label="Localisation"
                value={`${profile.ville}${profile.pays ? `, ${profile.pays}` : ''}`}
              />
            )}
            {profile.entreprise && (
              <InfoRow
                icon={Building2}
                label="Entreprise"
                value={profile.entreprise}
              />
            )}
            {profile.poste && (
              <InfoRow
                icon={Briefcase}
                label="Poste"
                value={profile.poste}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Bio (si pas dans le header) */}
      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4 text-primary" aria-hidden="true" />
              À propos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
              {profile.bio}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Compétences détaillées */}
      {profile.competences && profile.competences.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Compétences</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.competences.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-foreground"
                >
                  {c}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Membre depuis */}
      {profile.createdAt && (
        <Card>
          <CardContent className="flex items-center gap-2 p-4 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="tabular-nums">
              Membre depuis le {formatDate(profile.createdAt)}
            </span>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   INFO ROW
   ═══════════════════════════════════════════════════════════════════════════ */

function InfoRow({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 dark:bg-primary/15">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-foreground">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block rounded-lg p-2 transition-colors hover:bg-accent"
      >
        {content}
      </a>
    );
  }

  return <div className="rounded-lg p-2">{content}</div>;
}