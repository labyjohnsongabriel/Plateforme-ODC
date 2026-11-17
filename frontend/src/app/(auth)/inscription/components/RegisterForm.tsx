// src/app/(auth)/inscription/components/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Eye, EyeOff, Loader2, Check, X, User, Building2, Mail, Phone, Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

const schema = z
  .object({
    nom: z.string().trim().min(2, 'Nom requis (2 caractères min.)').max(100),
    prenom: z.string().trim().min(2, 'Prénom requis (2 caractères min.)').max(100),
    email: z.string().trim().toLowerCase().email('Adresse email invalide'),
    telephone: z
      .string()
      .trim()
      .regex(/^\+?[0-9\s().-]{6,20}$/, 'Numéro de téléphone invalide')
      .optional()
      .or(z.literal('')),
    motDePasse: z
      .string()
      .min(8, 'Au moins 8 caractères')
      .regex(/[A-Z]/, 'Au moins une majuscule')
      .regex(/[a-z]/, 'Au moins une minuscule')
      .regex(/[0-9]/, 'Au moins un chiffre'),
    confirmation: z.string(),
    roleNom: z.enum(['PARTICIPANT', 'PARTENAIRE']).default('PARTICIPANT'),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: 'Vous devez accepter les conditions',
    }),
  })
  .refine((d) => d.motDePasse === d.confirmation, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmation'],
  });

type FormData = z.infer<typeof schema>;

const PASSWORD_RULES = [
  { label: '8 caractères min.', test: (p: string) => p.length >= 8 },
  { label: 'Une majuscule', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Une minuscule', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Un chiffre', test: (p: string) => /[0-9]/.test(p) },
];

export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');
  const [role, setRole] = useState<'PARTICIPANT' | 'PARTENAIRE'>('PARTICIPANT');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { roleNom: 'PARTICIPANT', acceptTerms: false },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { data: res } = await api.post('/auth/register', {
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone || undefined,
        motDePasse: data.motDePasse,
        roleNom: data.roleNom,
      });

      const auth = res.data;
      setAuth({
        user: auth.user,
        accessToken: auth.accessToken,
        refreshToken: auth.refreshToken,
      });

      toast.success('Compte créé avec succès ! Bienvenue 🎉');
      router.push(
        data.roleNom === 'PARTENAIRE'
          ? '/partenaire/dashboard'
          : '/participant/dashboard',
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Type de compte */}
      <div>
        <Label className="mb-2 block text-sm font-medium text-slate-900 dark:text-slate-50">
          Je m'inscris en tant que
        </Label>
        <div className="grid grid-cols-2 gap-3">
          <RoleCard
            icon={User}
            title="Participant"
            description="Suivre des formations"
            active={role === 'PARTICIPANT'}
            onClick={() => { setRole('PARTICIPANT'); setValue('roleNom', 'PARTICIPANT'); }}
          />
          <RoleCard
            icon={Building2}
            title="Partenaire"
            description="Collaborer avec l'ODC"
            active={role === 'PARTENAIRE'}
            onClick={() => { setRole('PARTENAIRE'); setValue('roleNom', 'PARTENAIRE'); }}
          />
        </div>
        <input type="hidden" {...register('roleNom')} />
      </div>

      {/* Nom / Prénom */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="nom" className="text-sm font-medium text-slate-900 dark:text-slate-50">
            Nom <span className="text-red-600">*</span>
          </Label>
          <Input
            id="nom"
            autoComplete="family-name"
            disabled={isSubmitting}
            {...register('nom')}
            className="mt-1.5 h-11"
            aria-invalid={!!errors.nom}
          />
          {errors.nom && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
              {errors.nom.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="prenom" className="text-sm font-medium text-slate-900 dark:text-slate-50">
            Prénom <span className="text-red-600">*</span>
          </Label>
          <Input
            id="prenom"
            autoComplete="given-name"
            disabled={isSubmitting}
            {...register('prenom')}
            className="mt-1.5 h-11"
            aria-invalid={!!errors.prenom}
          />
          {errors.prenom && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
              {errors.prenom.message}
            </p>
          )}
        </div>
      </div>

      {/* Email / Téléphone */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="email" className="text-sm font-medium text-slate-900 dark:text-slate-50">
            Email <span className="text-red-600">*</span>
          </Label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
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
        <div>
          <Label htmlFor="telephone" className="text-sm font-medium text-slate-900 dark:text-slate-50">
            Téléphone
          </Label>
          <div className="relative mt-1.5">
            <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              id="telephone"
              type="tel"
              placeholder="+261 34 12 345 67"
              autoComplete="tel"
              disabled={isSubmitting}
              {...register('telephone')}
              className="h-11 pl-10"
              aria-invalid={!!errors.telephone}
            />
          </div>
          {errors.telephone && (
            <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
              {errors.telephone.message}
            </p>
          )}
        </div>
      </div>

      {/* Mot de passe */}
      <div>
        <Label htmlFor="motDePasse" className="text-sm font-medium text-slate-900 dark:text-slate-50">
          Mot de passe <span className="text-red-600">*</span>
        </Label>
        <div className="relative mt-1.5">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="motDePasse"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isSubmitting}
            {...register('motDePasse', { onChange: (e) => setPasswordValue(e.target.value) })}
            className="h-11 pl-10 pr-10"
            aria-invalid={!!errors.motDePasse}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            tabIndex={-1}
            aria-label={showPassword ? 'Masquer' : 'Afficher'}
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

        {errors.motDePasse && (
          <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
            {errors.motDePasse.message}
          </p>
        )}
      </div>

      {/* Confirmation */}
      <div>
        <Label htmlFor="confirmation" className="text-sm font-medium text-slate-900 dark:text-slate-50">
          Confirmer le mot de passe <span className="text-red-600">*</span>
        </Label>
        <div className="relative mt-1.5">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            id="confirmation"
            type={showConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isSubmitting}
            {...register('confirmation')}
            className="h-11 pl-10 pr-10"
            aria-invalid={!!errors.confirmation}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            tabIndex={-1}
            aria-label={showConfirm ? 'Masquer' : 'Afficher'}
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

      {/* CGU */}
      <div className="flex items-start gap-2">
        <Checkbox
          id="acceptTerms"
          onCheckedChange={(v) => setValue('acceptTerms', !!v, { shouldValidate: true })}
          disabled={isSubmitting}
        />
        <Label htmlFor="acceptTerms" className="cursor-pointer text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          J'accepte les{' '}
          <a href="/cgu" className="font-medium text-orange-600 hover:underline dark:text-orange-400">
            conditions d'utilisation
          </a>{' '}
          et la{' '}
          <a href="/politique-confidentialite" className="font-medium text-orange-600 hover:underline dark:text-orange-400">
            politique de confidentialité
          </a>{' '}
          de l'ODC. <span className="text-red-600">*</span>
        </Label>
      </div>
      {errors.acceptTerms && (
        <p className="-mt-3 text-xs text-red-600 dark:text-red-400" role="alert">
          {errors.acceptTerms.message}
        </p>
      )}

      {/* Bouton */}
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="h-11 w-full bg-slate-900 text-white shadow-md hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Créer mon compte
      </Button>
    </form>
  );
}

interface RoleCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}

function RoleCard({ icon: Icon, title, description, active, onClick }: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all',
        active
          ? 'border-slate-900 bg-slate-100 dark:border-slate-50 dark:bg-slate-800'
          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-900',
      )}
      aria-pressed={active}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-lg',
          active
            ? 'bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-900'
            : 'bg-slate-100 text-slate-400 dark:bg-slate-800',
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
      </div>
    </button>
  );
}