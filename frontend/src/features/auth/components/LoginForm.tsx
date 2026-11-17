'use client';

import Link from 'next/link';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { useLogin } from '../hooks/useLogin';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';

export function LoginForm() {
  const { form, loading, onSubmit } = useLogin();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Card padding="lg" className="mx-auto w-full max-w-md">
      <div className="mb-8 text-center">
        <h1 className="font-heading mb-2 text-3xl font-bold">Bienvenue</h1>
        <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
          Connectez-vous à votre espace personnel
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Input
          label="Adresse email"
          type="email"
          placeholder="vous@exemple.mg"
          autoComplete="email"
          icon={<Mail size={18} />}
          error={errors.email?.message}
          required
          {...register('email')}
        />
        <Input
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          icon={<Lock size={18} />}
          error={errors.motDePasse?.message}
          required
          {...register('motDePasse')}
        />
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register('remember')} />
            Se souvenir de moi
          </label>
          <Link href="/mot-de-passe-oublie" className="text-sm text-odc-primary hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
        <Button type="submit" fullWidth size="lg" loading={loading} icon={<ArrowRight size={18} />}>
          Se connecter
        </Button>
      </form>

      <p className="mt-6 text-center text-sm">
        Pas encore de compte ?{' '}
        <Link href="/inscription" className="font-semibold text-odc-primary hover:underline">
          S&apos;inscrire
        </Link>
      </p>
    </Card>
  );
}
