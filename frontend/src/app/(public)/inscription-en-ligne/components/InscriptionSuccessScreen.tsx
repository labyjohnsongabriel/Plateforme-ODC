'use client';

import { CheckCircle2, Clock, Mail, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  onClose?: () => void;
  variant?: 'page' | 'modal';
}

export function InscriptionSuccessScreen({ onClose, variant = 'modal' }: Props) {
  return (
    <Card className="border-0 shadow-none">
      <CardContent className={variant === 'modal' ? 'py-4 text-center' : 'py-12 text-center'}>
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-odc-success/20" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-odc-success-soft">
            <CheckCircle2 className="h-10 w-10 text-odc-success" />
          </div>
        </div>

        <h2 className="mb-3 font-display text-2xl font-bold text-odc-text-primary">
          Inscription envoyée !
        </h2>

        <p className="mx-auto mb-6 max-w-md text-sm text-odc-text-secondary">
          Votre demande a bien été reçue. Vous recevrez un email de confirmation
          avec les prochaines étapes.
        </p>

        <div className="mx-auto mb-8 max-w-md rounded-lg border border-odc-border bg-odc-surface-alt/30 p-4 text-left">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-odc-text-muted">
            Prochaines étapes
          </p>
          <ul className="space-y-2 text-sm text-odc-text-secondary">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-odc-success" />
              <span>Email de confirmation envoyé</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-odc-info" />
              <span>Examen de votre dossier (48–72 h)</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-odc-primary" />
              <span>Notification de la décision</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          {onClose && (
            <Button variant="odc" onClick={onClose}>
              Fermer
            </Button>
          )}
          <Button variant={onClose ? 'outline' : 'odc'} asChild>
            <a href="/formations">
              Voir d'autres formations
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href="/participant/inscriptions">Mes inscriptions</a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}