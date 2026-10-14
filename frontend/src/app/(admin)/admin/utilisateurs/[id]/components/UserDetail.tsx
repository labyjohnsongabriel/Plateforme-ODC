'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { RoleSelector } from '../../components/RoleSelectorInline';
import { api } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/formatters';
import { getInitials } from '@/lib/utils';
import type { User } from '@/types/user.types';

interface Props {
  userId: string;
}

export function UserDetail({ userId }: Props) {
  const router = useRouter();
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['admin', 'user', userId],
    queryFn: async () => {
      const { data } = await api.get(`/admin/users/${userId}`);
      return data.data;
    },
  });

  if (isLoading || !user) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Retour
      </Button>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Sidebar profil */}
        <Card>
          <CardContent className="p-6 text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarImage src={user.photoUrl ?? undefined} />
              <AvatarFallback className="bg-odc-primary-soft text-odc-primary text-2xl font-display font-bold">
                {getInitials(user.nom, user.prenom)}
              </AvatarFallback>
            </Avatar>

            <h2 className="font-display text-xl font-semibold mb-1">
              {user.prenom} {user.nom}
            </h2>
            <p className="text-sm text-odc-muted mb-4">{user.email}</p>

            <Badge variant="outline" className="mb-4">
              {user.role.libelle}
            </Badge>

            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setRoleModalOpen(true)}
              >
                <Shield className="h-4 w-4 mr-2" />
                Changer le rôle
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                asChild
              >
                <a href={`mailto:${user.email}`}>
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer un email
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informations */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <InfoRow label="Nom" value={user.nom} />
              <InfoRow label="Prénom" value={user.prenom} />
              <InfoRow label="Email" value={user.email} icon={Mail} />
              <InfoRow
                label="Téléphone"
                value={user.telephone ?? '—'}
                icon={Phone}
              />
              <InfoRow
                label="Ville"
                value={user.ville ?? '—'}
                icon={MapPin}
              />
              <InfoRow
                label="Entreprise"
                value={user.entreprise ?? '—'}
              />
              <InfoRow label="Poste" value={user.poste ?? '—'} />
              <InfoRow
                label="Inscrit le"
                value={formatDate(user.createdAt)}
                icon={Calendar}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Métadonnées</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              <InfoRow
                label="Dernière connexion"
                value={
                  user.derniereConnexion
                    ? formatDateTime(user.derniereConnexion)
                    : 'Jamais'
                }
              />
              <InfoRow
                label="Email vérifié"
                value={user.emailVerifie ? 'Oui' : 'Non'}
              />
              <InfoRow
                label="Profil public"
                value={user.profilPublic ? 'Oui' : 'Non'}
              />
              <InfoRow
                label="Statut"
                value={user.actif ? 'Actif' : 'Inactif'}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <RoleSelector
        userId={user.id}
        currentRole={user.role.nom}
        open={roleModalOpen}
        onOpenChange={setRoleModalOpen}
      />
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
}) {
  return (
    <div>
      <p className="text-xs text-odc-muted mb-1 flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <p className="font-medium text-sm">{value}</p>
    </div>
  );
}