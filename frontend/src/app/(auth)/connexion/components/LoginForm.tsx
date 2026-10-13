'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { ROLE_DASHBOARD } from '@/lib/routes';
import { getErrorMessage } from '@/lib/error-handler';

/* ============================================================================
   SCHÉMA
   ============================================================================ */
const schema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email requis')
    .email('Adresse email invalide'),
  motDePasse: z.string().min(1, 'Mot de passe requis'),
  remember: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

/* ============================================================================
   COMPOSANT
   ============================================================================ */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      remember: true,
    },
  });

  const remember = watch('remember');

  /* -------------------------------------------------------------------- */
  /* SOUMISSION                                                          */
  /* -------------------------------------------------------------------- */
  const onSubmit = async (data: FormData) => {
    try {
      const { data: res } = await api.post('/auth/login', {
        email: data.email,
        motDePasse: data.motDePasse,
      });

      const auth = res.data;

      // Persistance du token
      setAuth({
        user: auth.user,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
      });

      toast.success(`Bienvenue ${auth.user.prenom} !`);

      // Redirection
      const next = searchParams.get('next');
      const dashboard = ROLE_DASHBOARD[auth.user.role.nom] ?? '/';
      router.push(next ?? dashboard);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* -------- Email -------- */}
      <div>
        <Label htmlFor="email">Adresse email</Label>
        <Input
          id="email"
          type="email"
          placeholder="vous@exemple.mg"
          autoComplete="email"
          autoFocus
          disabled={isSubmitting}
          {...register('email')}
          className="mt-1.5"
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="text-odc-error text-xs mt-1.5" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* -------- Mot de passe -------- */}
      <div>
        <Label htmlFor="motDePasse">Mot de passe</Label>
        <div className="relative mt-1.5">
          <Input
            id="motDePasse"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isSubmitting}
            {...register('motDePasse')}
            className="pr-10"
            aria-invalid={!!errors.motDePasse}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-odc-muted hover:text-odc-primary transition-colors"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.motDePasse && (
          <p className="text-odc-error text-xs mt-1.5" role="alert">
            {errors.motDePasse.message}
          </p>
        )}
      </div>

      {/* -------- Se souvenir -------- */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="remember"
          checked={remember}
          onCheckedChange={(v) => setValue('remember', !!v)}
          disabled={isSubmitting}
        />
        <Label
          htmlFor="remember"
          className="text-sm text-odc-secondary cursor-pointer"
        >
          Se souvenir de moi
        </Label>
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
        Se connecter
      </Button>
    </form>
  );
}