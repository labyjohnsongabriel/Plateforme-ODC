// src/app/(public)/a-propos/components/TeamSection.tsx
'use client';

import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Linkedin, Mail, Users, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface TeamMember {
  id: string;
  nom: string;
  prenom: string;
  email?: string;
  photoUrl?: string | null;
  poste?: string | null;
  bio?: string | null;
  linkedin?: string | null;
  role?: {
    nom: string;
    libelle: string;
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function extractTeam(data: any): TeamMember[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (typeof data === 'object') {
    for (const key of ['team', 'users', 'data', 'items', 'members']) {
      if (Array.isArray(data[key])) return data[key];
    }
  }
  return [];
}

function getInitials(prenom?: string, nom?: string): string {
  const p = (prenom ?? '').charAt(0).toUpperCase();
  const n = (nom ?? '').charAt(0).toUpperCase();
  return `${p}${n}` || '?';
}

/* ═══════════════════════════════════════════════════════════════════════════
   SQUELETTE
   ═══════════════════════════════════════════════════════════════════════════ */

function TeamSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-square w-full" />
          <CardContent className="p-5 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function TeamSection() {
  const { data, isLoading, isError, error } = useQuery<TeamMember[]>({
    queryKey: ['public', 'team'],
    queryFn: async () => {
      const response = await api.get('/public/team', {
        params: { limit: 12 },
      });
      return extractTeam(response.data?.data ?? response.data);
    },
    staleTime: 5 * 60_000,
  });

  const team = data ?? [];

  return (
    <section
      id="equipe"
      aria-labelledby="team-title"
      className="relative py-16 md:py-24 overflow-hidden"
    >
      {/* Décoration de fond */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        aria-hidden
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, #FF7900 0%, transparent 40%), radial-gradient(circle at 80% 80%, #E65100 0%, transparent 40%)',
        }}
      />

      <div className="relative container mx-auto px-4">
        {/* En-tête */}
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 px-4 py-1.5 text-sm font-semibold mb-4 ring-1 ring-orange-200 dark:ring-orange-900">
            <Users className="h-4 w-4" aria-hidden />
            Notre équipe
          </span>
          <h2
            id="team-title"
            className="font-display text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent"
          >
            Les visages de l'ODC
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            Une équipe passionnée et engagée au service de la réussite de chaque
            apprenant.
          </p>
        </div>

        {/* Loading */}
        {isLoading && <TeamSkeleton />}

        {/* Erreur */}
        {isError && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-6 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="font-semibold text-destructive">
                  Impossible de charger l'équipe
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {error instanceof Error ? error.message : 'Erreur inconnue'}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vide */}
        {!isLoading && !isError && team.length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" aria-hidden />
              <p className="text-muted-foreground">
                Aucun membre de l'équipe n'est publié pour le moment.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Grille */}
        {!isLoading && !isError && team.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, index) => (
              <Card
                key={member.id}
                className="group overflow-hidden border-0 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                {/* Photo avec overlay orange */}
                <div className="relative aspect-square bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-950 dark:to-orange-900 overflow-hidden">
                  {member.photoUrl ? (
                    <Image
                      src={member.photoUrl}
                      alt={`${member.prenom} ${member.nom}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-400">
                      <span className="font-display text-5xl font-bold text-white/90">
                        {getInitials(member.prenom, member.nom)}
                      </span>
                    </div>
                  )}

                  {/* Overlay au hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-orange-900/80 via-orange-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end justify-center pb-4">
                    <div className="flex gap-2">
                      {member.linkedin && (
                        <Button
                          asChild
                          variant="secondary"
                          size="icon"
                          className="h-9 w-9 rounded-full bg-white/90 hover:bg-white text-orange-600"
                          aria-label={`LinkedIn de ${member.prenom} ${member.nom}`}
                        >
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Linkedin className="h-4 w-4" aria-hidden />
                          </a>
                        </Button>
                      )}
                      {member.email && (
                        <Button
                          asChild
                          variant="secondary"
                          size="icon"
                          className="h-9 w-9 rounded-full bg-white/90 hover:bg-white text-orange-600"
                          aria-label={`Email de ${member.prenom} ${member.nom}`}
                        >
                          <a href={`mailto:${member.email}`}>
                            <Mail className="h-4 w-4" aria-hidden />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Infos */}
                <CardContent className="p-5">
                  <h3 className="font-display font-bold text-base mb-1 line-clamp-1 text-foreground">
                    {member.prenom} {member.nom}
                  </h3>
                  <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2 line-clamp-1">
                    {member.poste ?? member.role?.libelle ?? 'Membre ODC'}
                  </p>
                  {member.bio && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {member.bio}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}