'use client';

import Link from 'next/link';
import { ArrowRight, Share2, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useSessionsByFormation } from '@/hooks/queries/useSessions';
import { formatDate } from '@/lib/formatters';
import type { Formation } from '@/types/formation.types';

interface Props {
  formation: Formation;
}

export function InscriptionCta({ formation }: Props) {
  const { data: sessions = [] } = useSessionsByFormation(formation.id);

  const openSessions = sessions.filter(
    (s) => s.statut === 'OUVERTE' || s.statut === 'PLANIFIEE',
  );

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: formation.titre,
          text: formation.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Lien copié dans le presse-papier');
      }
    } catch {
      /* annulé par l'utilisateur */
    }
  };

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <Card className="border-odc-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Prêt à vous inscrire ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {openSessions.length === 0 ? (
            <>
              <p className="text-sm text-odc-muted">
                Aucune session ouverte pour le moment. Revenez bientôt ou
                contactez-nous pour être informé.
              </p>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/contact">Nous contacter</Link>
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-3">
                {openSessions.slice(0, 3).map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-odc-surface-alt"
                  >
                    <div>
                      <p className="text-xs font-mono text-odc-muted">
                        {s.codeSession}
                      </p>
                      <p className="text-sm font-medium">{formatDate(s.dateDebut)}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {s.capacite} places
                    </Badge>
                  </div>
                ))}
              </div>

              <Button variant="odc" className="w-full" size="lg" asChild>
                <Link href={`/inscription-en-ligne?formation=${formation.id}`}>
                  S&apos;inscrire maintenant
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </>
          )}

          <Separator />

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={share} className="flex-1">
              <Share2 className="h-4 w-4 mr-1.5" />
              Partager
            </Button>
            <Button variant="ghost" size="sm" className="flex-1">
              <Heart className="h-4 w-4 mr-1.5" />
              Sauvegarder
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-odc-muted">Durée</span>
            <span className="font-medium">{formation.dureeHeures}h</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-odc-muted">Places max</span>
            <span className="font-medium">{formation.nbParticipantsMax}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-odc-muted">Prix</span>
            <span className="font-medium">
              {formation.prix === 0 || !formation.prix
                ? 'Gratuit'
                : `${formation.prix} Ar`}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}