// src/app/(auth)/mot-de-passe-oublie/components/ForgotPasswordForm.tsx
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
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

const schema = z.object({
  email: z.string().trim().toLowerCase().email('Adresse email invalide'),
});
type FormData = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      setSentEmail(data.email);
      setSent(true);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (sent) {
    return (
      <div className="animate-fade-in rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-md dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
          <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>

        <h2 className="mb-2 font-display text-xl font-bold text-slate-900 dark:text-slate-50">
          Email envoyé !
        </h2>

        <p className="mx-auto mb-6 max-w-sm text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          Si un compte existe pour <strong className="text-slate-900 dark:text-slate-50">{sentEmail}</strong>,
          un lien de réinitialisation vous a été envoyé. Vérifiez votre boîte de réception
          (et le dossier spam).
        </p>

        <div className="space-y-3">
          <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
            Renvoyer l'email
          </Button>
          <Button variant="ghost" className="w-full" asChild>
            <Link href="/connexion">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
              Retour à la connexion
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
          Le lien est valide pendant 1 heure.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="email" className="text-sm font-medium text-slate-900 dark:text-slate-50">
          Adresse email
        </Label>
        <div className="relative mt-1.5">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.mg"
            autoComplete="email"
            autoFocus
            disabled={isSubmitting}
            {...register('email')}
            className="h-11 pl-10"
            aria-invalid={!!errors.email}
          />
        </div>
        {errors.email && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="h-11 w-full bg-slate-900 text-white shadow-md hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Envoyer le lien de réinitialisation
      </Button>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        Vous vous souvenez de votre mot de passe ?{' '}
        <Link href="/connexion" className="font-medium text-orange-600 hover:underline dark:text-orange-400">
          Se connecter
        </Link>
      </p>
    </form>
  );
}