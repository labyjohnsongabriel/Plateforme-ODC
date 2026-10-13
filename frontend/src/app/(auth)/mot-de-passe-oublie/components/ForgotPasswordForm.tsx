'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

const schema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email requis')
    .email('Adresse email invalide'),
});

type FormData = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSentEmail(data.email);
      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  /* -------------------------------------------------------------------- */
  /* ÉTAT 2 : EMAIL ENVOYÉ                                                */
  /* -------------------------------------------------------------------- */
  if (sent) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>

          <h2 className="font-display text-xl font-semibold mb-2">
            Email envoyé !
          </h2>

          <p className="text-sm text-odc-muted mb-6 max-w-sm mx-auto">
            Si un compte existe pour <strong>{sentEmail}</strong>, un lien de
            réinitialisation vous a été envoyé. Vérifiez votre boîte de réception
            (et le dossier spam).
          </p>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setSent(false)}
            >
              Renvoyer l&apos;email
            </Button>

            <Button variant="ghost" className="w-full" asChild>
              <Link href="/connexion">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la connexion
              </Link>
            </Button>
          </div>

          <p className="mt-6 text-xs text-odc-muted">
            Le lien est valide pendant 1 heure.
          </p>
        </CardContent>
      </Card>
    );
  }

  /* -------------------------------------------------------------------- */
  /* ÉTAT 1 : FORMULAIRE                                                  */
  /* -------------------------------------------------------------------- */
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="email">Adresse email</Label>
        <div className="relative mt-1.5">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-odc-muted pointer-events-none" />
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.mg"
            autoComplete="email"
            autoFocus
            disabled={isSubmitting}
            {...register('email')}
            className="pl-10"
            aria-invalid={!!errors.email}
          />
        </div>
        {errors.email && (
          <p className="text-odc-error text-xs mt-1.5" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        variant="odc"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Envoyer le lien de réinitialisation
      </Button>

      <p className="text-center text-xs text-odc-muted">
        Vous vous souvenez de votre mot de passe ?{' '}
        <Link href="/connexion" className="link-odc">
          Se connecter
        </Link>
      </p>
    </form>
  );
}