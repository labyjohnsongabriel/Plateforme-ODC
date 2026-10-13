'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, Info } from 'lucide-react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { useSessionsPublic } from '@/hooks/queries/useSessions';
import { formatDate } from '@/lib/formatters';

const schema = z.object({
  sessionId: z.string().uuid('Veuillez sélectionner une session'),
  nom: z.string().trim().min(2, 'Nom requis').max(100),
  prenom: z.string().trim().min(2, 'Prénom requis').max(100),
  email: z.string().trim().toLowerCase().email('Email invalide'),
  telephone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s().-]{6,20}$/, 'Téléphone invalide')
    .optional()
    .or(z.literal('')),
  motivation: z.string().trim().max(1000).optional(),
});

type FormData = z.infer<typeof schema>;

export function PublicInscriptionForm() {
  const searchParams = useSearchParams();
  const preSelectedSessionId = searchParams.get('session');
  const [success, setSuccess] = useState(false);

  const { data: sessionsData, isLoading: loadingSessions } = useSessionsPublic({
    page: 1,
    limit: 50,
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { sessionId: preSelectedSessionId ?? '' },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/public/inscriptions', data);
      toast.success('Inscription envoyée avec succès !');
      setSuccess(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (success) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>

          <h2 className="font-display text-2xl font-bold mb-3">Inscription envoyée !</h2>
          <p className="text-odc-muted mb-6 max-w-md mx-auto">
            Votre demande d&apos;inscription a bien été reçue. Vous recevrez un email
            de confirmation avec les prochaines étapes.
          </p>

          <Button variant="odc" asChild>
            <a href="/formations">Découvrir d&apos;autres formations</a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const sessions = sessionsData?.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulaire d&apos;inscription</CardTitle>
        <CardDescription>
          Tous les champs marqués d&apos;un <span className="text-odc-error">*</span>{' '}
          sont obligatoires.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="sessionId">
              Session souhaitée <span className="text-odc-error">*</span>
            </Label>

            {loadingSessions ? (
              <div className="h-10 rounded-md bg-odc-surface-alt animate-pulse mt-1.5" />
            ) : sessions.length === 0 ? (
              <div className="flex items-center gap-2 text-sm text-odc-warning mt-1.5">
                <Info className="h-4 w-4" />
                Aucune session ouverte actuellement
              </div>
            ) : (
              <Select
                defaultValue={preSelectedSessionId ?? ''}
                onValueChange={(v) => setValue('sessionId', v)}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Sélectionnez une session" />
                </SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.codeSession} — {s.formation?.titre} —{' '}
                      {formatDate(s.dateDebut)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {errors.sessionId && (
              <p className="text-odc-error text-xs mt-1">{errors.sessionId.message}</p>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nom">
                Nom <span className="text-odc-error">*</span>
              </Label>
              <Input id="nom" {...register('nom')} className="mt-1.5" />
              {errors.nom && (
                <p className="text-odc-error text-xs mt-1">{errors.nom.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="prenom">
                Prénom <span className="text-odc-error">*</span>
              </Label>
              <Input id="prenom" {...register('prenom')} className="mt-1.5" />
              {errors.prenom && (
                <p className="text-odc-error text-xs mt-1">{errors.prenom.message}</p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">
                Email <span className="text-odc-error">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                className="mt-1.5"
              />
              {errors.email && (
                <p className="text-odc-error text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="telephone">Téléphone</Label>
              <Input
                id="telephone"
                type="tel"
                {...register('telephone')}
                className="mt-1.5"
              />
              {errors.telephone && (
                <p className="text-odc-error text-xs mt-1">
                  {errors.telephone.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="motivation">Motivation (optionnel)</Label>
            <Textarea
              id="motivation"
              rows={4}
              placeholder="Pourquoi souhaitez-vous participer à cette formation ?"
              {...register('motivation')}
              className="mt-1.5"
            />
          </div>

          <Button
            type="submit"
            variant="odc"
            size="lg"
            disabled={isSubmitting || sessions.length === 0}
            className="w-full"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Envoyer ma demande
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}