'use client';

import { Check, X, Loader2, MapPin, Building2, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/formatters';

interface Props {
  request: any;
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
  const user = request.expediteur;

  return (
    <Card className="hover:shadow-odc-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14 shrink-0">
            <AvatarImage src={user?.photoUrl ?? undefined} />
            <AvatarFallback className="bg-odc-primary-soft text-odc-primary font-display font-bold">
              {user ? getInitials(user.nom, user.prenom) : '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold mb-0.5">
              {user?.prenom} {user?.nom}
            </h3>
            <p className="text-xs text-odc-muted mb-2">
              {user?.role?.libelle ?? user?.role?.nom}
            </p>

            <div className="flex flex-wrap gap-3 text-xs text-odc-muted mb-3">
              {user?.ville && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {user.ville}
                </span>
              )}
              {user?.entreprise && (
                <span className="flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {user.entreprise}
                </span>
              )}
            </div>

            {request.message && (
              <p className="text-sm text-odc-secondary italic line-clamp-2 p-3 rounded bg-odc-surface-alt">
                « {request.message} »
              </p>
            )}

            <p className="text-[10px] text-odc-muted mt-2">
              Reçue {formatRelativeTime(request.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            variant="odc"
            className="flex-1"
            onClick={onAccept}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Accepter
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={onRefuse}
            disabled={isLoading}
          >
            <X className="h-4 w-4 mr-2" />
            Refuser
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}