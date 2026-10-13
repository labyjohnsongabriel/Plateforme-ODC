'use client';

import { MapPin, Building2, UserPlus, Mail, Briefcase } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

interface Props {
  user: any;
  onConnect: () => void;
  isConnecting: boolean;
}

export function MemberCard({ user, onConnect, isConnecting }: Props) {
  return (
    <Card className="hover:shadow-odc-lg transition-shadow group">
      <CardContent className="p-5 text-center">
        <Avatar className="h-16 w-16 mx-auto mb-3">
          <AvatarImage src={user.photoUrl ?? undefined} />
          <AvatarFallback className="bg-odc-primary-soft text-odc-primary font-display font-bold">
            {getInitials(user.nom, user.prenom)}
          </AvatarFallback>
        </Avatar>

        <h3 className="font-display font-semibold mb-0.5 group-hover:text-odc-primary transition-colors">
          {user.prenom} {user.nom}
        </h3>

        <p className="text-xs text-odc-muted mb-3">
          {user.role?.libelle ?? user.role?.nom}
        </p>

        <div className="space-y-1.5 text-xs text-odc-muted mb-4 min-h-[3rem]">
          {user.ville && (
            <div className="flex items-center justify-center gap-1.5">
              <MapPin className="h-3 w-3" />
              {user.ville}
            </div>
          )}
          {user.entreprise && (
            <div className="flex items-center justify-center gap-1.5">
              <Building2 className="h-3 w-3" />
              {user.entreprise}
            </div>
          )}
          {user.poste && (
            <div className="flex items-center justify-center gap-1.5">
              <Briefcase className="h-3 w-3" />
              {user.poste}
            </div>
          )}
        </div>

        {user.competences && user.competences.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center mb-4">
            {user.competences.slice(0, 3).map((c: string) => (
              <Badge key={c} variant="secondary" className="text-[10px]">
                {c}
              </Badge>
            ))}
          </div>
        )}

        <Button
          variant="odc"
          size="sm"
          className="w-full"
          onClick={onConnect}
          disabled={isConnecting}
        >
          <UserPlus className="h-3.5 w-3.5 mr-1.5" />
          Se connecter
        </Button>
      </CardContent>
    </Card>
  );
}