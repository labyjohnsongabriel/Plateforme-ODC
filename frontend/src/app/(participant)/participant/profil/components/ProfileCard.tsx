'use client';

import { useQuery } from '@tanstack/react-query';
import { Mail, Phone, MapPin, Briefcase, Linkedin, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { getInitials } from '@/lib/utils';
import { PhotoUploader } from './PhotoUploader';

export function ProfileCard() {
  const { data: me, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data.data;
    },
  });

  if (isLoading || !me) {
    return <Skeleton className="h-96" />;
  }

  return (
    <Card>
      <CardContent className="p-6 text-center">
        <PhotoUploader currentPhotoUrl={me.photoUrl} />

        <h2 className="font-display text-xl font-semibold mt-4 mb-1">
          {me.prenom} {me.nom}
        </h2>

        <Badge variant="outline" className="mb-4">
          {me.role?.libelle ?? me.role?.nom}
        </Badge>

        {me.bio && (
          <p className="text-sm text-odc-muted mb-4 italic line-clamp-3">
            {me.bio}
          </p>
        )}

        <ul className="space-y-2 text-left text-sm">
          {me.email && (
            <li className="flex items-center gap-2 text-odc-muted">
              <Mail className="h-3.5 w-3.5 text-odc-primary shrink-0" />
              <span className="truncate">{me.email}</span>
            </li>
          )}
          {me.telephone && (
            <li className="flex items-center gap-2 text-odc-muted">
              <Phone className="h-3.5 w-3.5 text-odc-primary shrink-0" />
              <span>{me.telephone}</span>
            </li>
          )}
          {me.ville && (
            <li className="flex items-center gap-2 text-odc-muted">
              <MapPin className="h-3.5 w-3.5 text-odc-primary shrink-0" />
              <span>{me.ville}</span>
            </li>
          )}
          {me.entreprise && (
            <li className="flex items-center gap-2 text-odc-muted">
              <Briefcase className="h-3.5 w-3.5 text-odc-primary shrink-0" />
              <span className="truncate">{me.entreprise}</span>
            </li>
          )}
          {me.linkedin && (
            <li>
              <a
                href={me.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-odc-primary hover:underline"
              >
                <Linkedin className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">LinkedIn</span>
              </a>
            </li>
          )}
          {me.siteWeb && (
            <li>
              <a
                href={me.siteWeb}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-odc-primary hover:underline"
              >
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Site web</span>
              </a>
            </li>
          )}
        </ul>

        {me.competences && me.competences.length > 0 && (
          <div className="mt-4 pt-4 border-t border-odc-border">
            <p className="text-xs text-odc-muted mb-2 text-left">Compétences</p>
            <div className="flex flex-wrap gap-1.5">
              {me.competences.slice(0, 6).map((c: string) => (
                <Badge key={c} variant="secondary" className="text-xs">
                  {c}
                </Badge>
              ))}
              {me.competences.length > 6 && (
                <Badge variant="secondary" className="text-xs">
                  +{me.competences.length - 6}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}