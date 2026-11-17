// src/app/(auth)/connexion/components/LoginForm.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { ROLE_DASHBOARD } from '@/lib/routes';
import { getErrorMessage } from '@/lib/error-handler';

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
    defaultValues: { remember: true },
  });

  const remember = watch('remember');

  const onSubmit = async (data: FormData) => {
    try {
      const { data: res } = await api.post('/auth/login', {
        email: data.email,
        motDePasse: data.motDePasse,
      });
      const auth = res.data;

      setAuth({
        user: auth.user,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
      });

      toast.success(`Bienvenue ${auth.user.prenom} !`);
      const next = searchParams.get('next');
      const dashboard = ROLE_DASHBOARD[auth.user.role.nom] ?? '/';
      router.push(next ?? dashboard);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Email */}
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

      {/* Mot de passe */}
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="motDePasse" className="text-sm font-medium text-slate-900 dark:text-slate-50">
            Mot de passe
          </Label>
          <a
            href="/mot-de-passe-oublie"
            className="text-xs font-medium text-orange-600 hover:underline dark:text-orange-400"
          >
            Oublié ?
          </a>
        </div>
        <div className="relative mt-1.5">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="motDePasse"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isSubmitting}
            {...register('motDePasse')}
            className="h-11 pl-10 pr-10"
            aria-invalid={!!errors.motDePasse}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.motDePasse && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
            {errors.motDePasse.message}
          </p>
        )}
      </div>

      {/* Se souvenir */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="remember"
          checked={remember}
          onCheckedChange={(v) => setValue('remember', !!v)}
          disabled={isSubmitting}
        />
        <Label htmlFor="remember" className="cursor-pointer text-sm text-slate-600 dark:text-slate-400">
          Se souvenir de moi
        </Label>
      </div>

      {/* Bouton */}
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="h-11 w-full bg-slate-900 text-white shadow-md hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Se connecter
      </Button>
    </form>
  );
}