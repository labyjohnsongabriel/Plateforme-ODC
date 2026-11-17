// src/app/(auth)/reset-password/components/ResetPasswordForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Check, X, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

const schema = z
  .object({
    nouveauMotDePasse: z
      .string()
      .min(8, 'Au moins 8 caractères')
      .regex(/[A-Z]/, 'Au moins une majuscule')
      .regex(/[a-z]/, 'Au moins une minuscule')
      .regex(/[0-9]/, 'Au moins un chiffre'),
    confirmation: z.string(),
  })
  .refine((d) => d.nouveauMotDePasse === d.confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmation'],
  });

type FormData = z.infer<typeof schema>;

const PASSWORD_RULES = [
  { label: '8 caractères minimum', test: (p: string) => p.length >= 8 },
  { label: 'Une majuscule', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Une minuscule', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Un chiffre', test: (p: string) => /[0-9]/.test(p) },
];

interface Props {
  token: string;
}

export function ResetPasswordForm({ token }: Props) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post('/auth/reset-password', {
        token,
        nouveauMotDePasse: data.nouveauMotDePasse,
      });
      setSuccess(true);
      toast.success('Mot de passe réinitialisé avec succès');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  if (success) {
    return (
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="py-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-950/40">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>

          <h2 className="mb-2 font-display text-xl font-bold text-slate-900 dark:text-slate-50">
            Mot de passe réinitialisé
          </h2>

          <p className="mx-auto mb-6 max-w-sm text-sm text-slate-600 dark:text-slate-400">
            Votre mot de passe a été modifié avec succès. Vous pouvez maintenant
            vous connecter avec vos nouveaux identifiants.
          </p>

          <Button
            size="lg"
            className="w-full bg-slate-900 text-white shadow-md hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
            onClick={() => router.push('/connexion')}
          >
            Se connecter
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <Label htmlFor="nouveauMotDePasse" className="text-sm font-medium text-slate-900 dark:text-slate-50">
          Nouveau mot de passe
        </Label>
        <div className="relative mt-1.5">
          <Input
            id="nouveauMotDePasse"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
            autoFocus
            disabled={isSubmitting}
            {...register('nouveauMotDePasse', {
              onChange: (e) => setPasswordValue(e.target.value),
            })}
            className="h-11 pr-10"
            aria-invalid={!!errors.nouveauMotDePasse}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            aria-label={showPassword ? 'Masquer' : 'Afficher'}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {passwordValue && (
          <ul className="mt-2 grid grid-cols-2 gap-1.5">
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(passwordValue);
              return (
                <li
                  key={rule.label}
                  className={cn(
                    'flex items-center gap-1.5 text-xs',
                    ok ? 'text-green-600 dark:text-green-400' : 'text-slate-500 dark:text-slate-400',
                  )}
                >
                  {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  {rule.label}
                </li>
              );
            })}
          </ul>
        )}

        {errors.nouveauMotDePasse && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
            {errors.nouveauMotDePasse.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="confirmation" className="text-sm font-medium text-slate-900 dark:text-slate-50">
          Confirmer le mot de passe
        </Label>
        <div className="relative mt-1.5">
          <Input
            id="confirmation"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isSubmitting}
            {...register('confirmation')}
            className="h-11 pr-10"
            aria-invalid={!!errors.confirmation}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            tabIndex={-1}
            aria-label={showConfirm ? 'Masquer' : 'Afficher'}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmation && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
            {errors.confirmation.message}
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
        Réinitialiser le mot de passe
      </Button>
    </form>
  );
}