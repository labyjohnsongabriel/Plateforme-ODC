// src/app/(auth)/inscription/components/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Eye, EyeOff, Loader2, Check, X, User, Building2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

/* ============================================================================
   SCHÉMA
   ============================================================================ */
const schema = z
  .object({
    nom: z.string().trim().min(2, 'Nom requis (2 caractères min.)').max(100),
    prenom: z.string().trim().min(2, 'Prénom requis (2 caractères min.)').max(100),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, 'Email requis')
      .email('Adresse email invalide'),
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

/* ============================================================================
   RÈGLES DE MOT DE PASSE
   ============================================================================ */
const PASSWORD_RULES = [
  { label: '8 caractères minimum', test: (p: string) => p.length >= 8 },
  { label: 'Une majuscule', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Une minuscule', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Un chiffre', test: (p: string) => /[0-9]/.test(p) },
];

/* ============================================================================
   COMPOSANT PRINCIPAL
   ============================================================================ */
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

  /* -------------------------------------------------------------------- */
  /* SOUMISSION                                                          */
  /* -------------------------------------------------------------------- */
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
      {/* ================================================================ */}
      {/* TYPE DE COMPTE                                                    */}
      {/* ================================================================ */}
      <div>
        <Label className="mb-2 block">Je m&apos;inscris en tant que</Label>
        <div className="grid grid-cols-2 gap-3">
          <RoleCard
            icon={User}
            title="Participant"
            description="Suivre des formations"
            active={role === 'PARTICIPANT'}
            onClick={() => {
              setRole('PARTICIPANT');
              setValue('roleNom', 'PARTICIPANT');
            }}
          />
          <RoleCard
            icon={Building2}
            title="Partenaire"
            description="Collaborer avec l'ODC"
            active={role === 'PARTENAIRE'}
            onClick={() => {
              setRole('PARTENAIRE');
              setValue('roleNom', 'PARTENAIRE');
            }}
          />
        </div>
        <input type="hidden" {...register('roleNom')} />
      </div>

      {/* ================================================================ */}
      {/* NOM / PRÉNOM                                                      */}
      {/* ================================================================ */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nom">Nom *</Label>
          <Input
            id="nom"
            autoComplete="family-name"
            disabled={isSubmitting}
            {...register('nom')}
            className="mt-1.5"
            aria-invalid={!!errors.nom}
          />
          {errors.nom && (
            <p className="text-odc-error text-xs mt-1.5" role="alert">
              {errors.nom.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="prenom">Prénom *</Label>
          <Input
            id="prenom"
            autoComplete="given-name"
            disabled={isSubmitting}
            {...register('prenom')}
            className="mt-1.5"
            aria-invalid={!!errors.prenom}
          />
          {errors.prenom && (
            <p className="text-odc-error text-xs mt-1.5" role="alert">
              {errors.prenom.message}
            </p>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* EMAIL / TÉLÉPHONE                                                 */}
      {/* ================================================================ */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
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

        <div>
          <Label htmlFor="telephone">Téléphone</Label>
          <Input
            id="telephone"
            type="tel"
            placeholder="+261 34 12 345 67"
            autoComplete="tel"
            disabled={isSubmitting}
            {...register('telephone')}
            className="mt-1.5"
            aria-invalid={!!errors.telephone}
          />
          {errors.telephone && (
            <p className="text-odc-error text-xs mt-1.5" role="alert">
              {errors.telephone.message}
            </p>
          )}
        </div>
      </div>

      {/* ================================================================ */}
      {/* MOT DE PASSE                                                      */}
      {/* ================================================================ */}
      <div>
        <Label htmlFor="motDePasse">Mot de passe *</Label>
        <div className="relative mt-1.5">
          <Input
            id="motDePasse"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isSubmitting}
            {...register('motDePasse', {
              onChange: (e) => setPasswordValue(e.target.value),
            })}
            className="pr-10"
            aria-invalid={!!errors.motDePasse}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-odc-muted hover:text-odc-primary transition-colors"
            tabIndex={-1}
            aria-label={showPassword ? 'Masquer' : 'Afficher'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {/* Indicateur de robustesse */}
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
                  {ok ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <X className="h-3 w-3" />
                  )}
                  {rule.label}
                </li>
              );
            })}
          </ul>
        )}

        {errors.motDePasse && (
          <p className="text-odc-error text-xs mt-1.5" role="alert">
            {errors.motDePasse.message}
          </p>
        )}
      </div>

      {/* ================================================================ */}
      {/* CONFIRMATION                                                      */}
      {/* ================================================================ */}
      <div>
        <Label htmlFor="confirmation">Confirmer le mot de passe *</Label>
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
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-odc-muted hover:text-odc-primary transition-colors"
            tabIndex={-1}
            aria-label={showConfirm ? 'Masquer' : 'Afficher'}
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

      {/* ================================================================ */}
      {/* CGU                                                               */}
      {/* ================================================================ */}
      <div className="flex items-start gap-2">
        <Checkbox
          id="acceptTerms"
          onCheckedChange={(v) => setValue('acceptTerms', !!v, { shouldValidate: true })}
          disabled={isSubmitting}
        />
        <Label
          htmlFor="acceptTerms"
          className="text-sm text-odc-secondary leading-relaxed cursor-pointer"
        >
          J&apos;accepte les conditions d&apos;utilisation et la politique de
          confidentialité de l&apos;ODC. *
        </Label>
      </div>
      {errors.acceptTerms && (
        <p className="text-odc-error text-xs -mt-3" role="alert">
          {errors.acceptTerms.message}
        </p>
      )}

      {/* ================================================================ */}
      {/* BOUTON                                                            */}
      {/* ================================================================ */}
      <Button
        type="submit"
        variant="odc"
        size="lg"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Créer mon compte
      </Button>
    </form>
  );
}

/* ============================================================================
   COMPOSANT : carte de rôle
   ⚠️ CORRECTION : balise <button> fermée avec </button> (pas </Card>)
   ============================================================================ */
interface RoleCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
}

function RoleCard({
  icon: Icon,
  title,
  description,
  active,
  onClick,
}: RoleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all text-center',
        active
          ? 'border-odc-primary bg-odc-primary-soft/50 shadow-odc-sm'
          : 'border-odc-border hover:border-odc-primary/50 hover:bg-odc-surface-alt',
      )}
      aria-pressed={active}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          active
            ? 'bg-odc-primary text-white'
            : 'bg-odc-surface-alt text-odc-muted',
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-odc-muted">{description}</p>
      </div>
    </button>
  );
}