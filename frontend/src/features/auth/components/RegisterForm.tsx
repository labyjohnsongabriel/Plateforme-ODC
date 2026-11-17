'use client';

import Link from 'next/link';
import { Lock, Mail, Phone, User } from 'lucide-react';
import { useRegister } from '../hooks/useRegister';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';

export function RegisterForm() {
  const { form, loading, onSubmit } = useRegister();
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Card padding="lg" className="mx-auto w-full max-w-lg">
      <div className="mb-8 text-center">
        <h1 className="font-heading mb-2 text-3xl font-bold">Créer un compte</h1>
        <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
          Rejoignez la communauté ODC
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Prénom"
            placeholder="Jean"
            icon={<User size={16} />}
            error={errors.prenom?.message}
            autoComplete="given-name"
            required
            {...register('prenom')}
          />
          <Input
            label="Nom"
            placeholder="Rakoto"
            icon={<User size={16} />}
            error={errors.nom?.message}
            autoComplete="family-name"
            required
            {...register('nom')}
          />
        </div>
        <Input
          label="Adresse email"
          type="email"
          placeholder="vous@exemple.mg"
          icon={<Mail size={16} />}
          error={errors.email?.message}
          autoComplete="email"
          required
          {...register('email')}
        />
        <Input
          label="Téléphone (optionnel)"
          type="tel"
          placeholder="+261 34 12 345 67"
          icon={<Phone size={16} />}
          error={errors.telephone?.message}
          autoComplete="tel"
          {...register('telephone')}
        />
        <div>
          <label htmlFor="roleNom" className="mb-2 block text-sm font-medium">
            Type de compte
          </label>
          <select
            id="roleNom"
            className="w-full rounded-lg border border-odc-border-light bg-white px-4 py-3 dark:border-odc-border-dark dark:bg-odc-surface-dark"
            {...register('roleNom')}
          >
            <option value="PARTICIPANT">Participant</option>
            <option value="PARTENAIRE">Partenaire</option>
          </select>
          {errors.roleNom?.message && (
            <p className="mt-1 text-xs text-odc-error">{errors.roleNom.message}</p>
          )}
        </div>
        <Input
          label="Mot de passe"
          type="password"
          placeholder="8 caractères minimum"
          icon={<Lock size={16} />}
          error={errors.motDePasse?.message}
          autoComplete="new-password"
          required
          {...register('motDePasse')}
        />
        <Input
          label="Confirmer le mot de passe"
          type="password"
          placeholder="Répétez votre mot de passe"
          icon={<Lock size={16} />}
          error={errors.confirmMotDePasse?.message}
          autoComplete="new-password"
          required
          {...register('confirmMotDePasse')}
        />
        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" className="mt-1" {...register('acceptTerms')} />
          <span>
            J&apos;accepte les conditions d&apos;utilisation et la politique de confidentialité.
          </span>
        </label>
        {errors.acceptTerms?.message && (
          <p className="text-xs text-odc-error">{errors.acceptTerms.message}</p>
        )}
        <Button type="submit" fullWidth size="lg" loading={loading}>
          Créer mon compte
        </Button>
      </form>

      <p className="mt-6 text-center text-sm">
        Vous avez déjà un compte ?{' '}
        <Link href="/connexion" className="font-semibold text-odc-primary hover:underline">
          Se connecter
        </Link>
      </p>
    </Card>
  );
}
