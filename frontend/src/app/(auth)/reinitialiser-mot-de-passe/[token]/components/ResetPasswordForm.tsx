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

/* ============================================================================
   SCHÉMA
   ============================================================================ */
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

/* ============================================================================
   COMPOSANT
   ============================================================================ */
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
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  /* -------------------------------------------------------------------- */
  /* SOUMISSION                                                          */
  /* -------------------------------------------------------------------- */
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

  /* -------------------------------------------------------------------- */
  /* ÉTAT 2 : SUCCÈS                                                      */
  /* -------------------------------------------------------------------- */
  if (success) {
    return (
      <Card>
        <CardContent className="py-10 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>

          <h2 className="font-display text-xl font-semibold mb-2">
            Mot de passe réinitialisé
          </h2>

          <p className="text-sm text-odc-muted mb-6 max-w-sm mx-auto">
            Votre mot de passe a été modifié avec succès. Vous pouvez maintenant
            vous connecter avec vos nouveaux identifiants.
          </p>

          <Button
            variant="odc"
            size="lg"
            className="w-full"
            onClick={() => router.push('/connexion')}
          >
            Se connecter
          </Button>
        </CardContent>
      </Card>
    );
  }

  /* -------------------------------------------------------------------- */
  /* ÉTAT 1 : FORMULAIRE                                                  */
  /* -------------------------------------------------------------------- */
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* -------- Nouveau mot de passe -------- */}
      <div>
        <Label htmlFor="nouveauMotDePasse">Nouveau mot de passe</Label>
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
            className="pr-10"
            aria-invalid={!!errors.nouveauMotDePasse}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            aria-label={showPassword ? 'Masquer' : 'Afficher'}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-odc-muted hover:text-odc-primary transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Indicateur robustesse */}
        {passwordValue && (
          <ul className="mt-2 grid grid-cols-2 gap-1.5">
            {PASSWORD_RULES.map((rule) => {
              const ok = rule.test(passwordValue);
              return (
                <li
                  key={rule.label}
                  className={cn(
                    'flex items-center gap-1.5 text-xs',
                    ok ? 'text-odc-success' : 'text-odc-muted',
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
          <p className="text-odc-error text-xs mt-1.5" role="alert">
            {errors.nouveauMotDePasse.message}
          </p>
        )}
      </div>

      {/* -------- Confirmation -------- */}
      <div>
        <Label htmlFor="confirmation">Confirmer le mot de passe</Label>
        <div className="relative mt-1.5">
          <Input
            id="confirmation"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isSubmitting}
            {...register('confirmation')}
            className="pr-10"
            aria-invalid={!!errors.confirmation}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            tabIndex={-1}
            aria-label={showConfirm ? 'Masquer' : 'Afficher'}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-odc-muted hover:text-odc-primary transition-colors"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirmation && (
          <p className="text-odc-error text-xs mt-1.5" role="alert">
            {errors.confirmation.message}
          </p>
        )}
      </div>

      {/* -------- Bouton -------- */}
      <Button
        type="submit"
        variant="odc"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Réinitialiser le mot de passe
      </Button>
    </form>
  );
}