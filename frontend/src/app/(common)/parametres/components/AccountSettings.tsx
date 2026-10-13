'use client';

import { useQuery } from '@tanstack/react-query';
import { Mail, Shield, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { formatDate, formatDateTime } from '@/lib/formatters';

export function AccountSettings() {
  const { data: me, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data.data;
    },
  });

  if (isLoading || !me) return <Skeleton className="h-64" />;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-odc-primary" />
          Informations du compte
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <InfoRow label="Nom complet" value={`${me.prenom} ${me.nom}`} />
          <InfoRow
            label="Email"
            value={me.email}
            icon={Mail}
            badge={
              me.emailVerifie ? (
                <Badge className="bg-odc-success-bg text-odc-success text-xs">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Vérifié
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  <XCircle className="h-3 w-3 mr-1" /> Non vérifié
                </Badge>
              )
            }
          />
          <InfoRow label="Rôle" value={me.role?.libelle ?? me.role?.nom} />
          <InfoRow
            label="Compte créé le"
            value={formatDate(me.createdAt)}
            icon={Calendar}
          />
          <InfoRow
            label="Dernière connexion"
            value={
              me.derniereConnexion
                ? formatDateTime(me.derniereConnexion)
                : 'Jamais'
            }
          />
          <InfoRow
            label="Statut"
            value={me.actif ? 'Actif' : 'Inactif'}
            badge={
              me.actif ? (
                <Badge className="bg-odc-success-bg text-odc-success text-xs">
                  Actif
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">Inactif</Badge>
              )
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({
  label,
  value,
  icon: Icon,
  badge,
}: {
  label: string;
  value: string;
  icon?: React.ElementType;
  badge?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs text-odc-muted mb-1 flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        <p className="font-medium text-sm">{value}</p>
        {badge}
      </div>
    </div>
  );
}