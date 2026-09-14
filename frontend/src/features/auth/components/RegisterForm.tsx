import { Link } from 'react-router-dom';
import { Controller } from 'react-hook-form';
import {
  Mail, Lock, User, Phone, ArrowRight, Check, X,
  AlertCircle, Eye, EyeOff, CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';

import { useRegister } from '../hooks/useRegister';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/common/Input';
import { Checkbox } from '@/components/common/Checkbox';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Alert } from '@/components/common/Alert';
import { cn } from '@/utils/cn';

// ============================================================================
//  CONFIG
// ============================================================================

const STRENGTH_COLORS = [
  'bg-odc-border-light dark:bg-odc-border-dark',
  'bg-odc-error',
  'bg-odc-error',
  'bg-odc-warning',
  'bg-odc-info',
  'bg-odc-success',
] as const;

const STRENGTH_LABELS = ['', 'Très faible', 'Faible', 'Moyen', 'Bon', 'Excellent'] as const;

const STRENGTH_TEXT_COLORS = [
  'text-odc-text-muted-light',
  'text-odc-error',
  'text-odc-error',
  'text-odc-warning',
  'text-odc-info',
  'text-odc-success',
] as const;

interface PasswordCheck {
  key: string;
  check: boolean;
  label: string;
}

function getPasswordChecks(password: string): PasswordCheck[] {
  return [
    { key: 'length', check: password.length >= 8, label: '8 caractères' },
    { key: 'uppercase', check: /[A-Z]/.test(password), label: '1 majuscule' },
    { key: 'lowercase', check: /[a-z]/.test(password), label: '1 minuscule' },
    { key: 'number', check: /[0-9]/.test(password), label: '1 chiffre' },
  ];
}

// ============================================================================
//  REGISTER FORM
// ============================================================================

export function RegisterForm() {
  const { form, loading, onSubmit } = useRegister();
  const { error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    watch,
    control,
    formState: { errors },
  } = form;

  const motDePasse = watch('motDePasse') ?? '';
  const confirmMotDePasse = watch('confirmMotDePasse') ?? '';
  const passwordsMatch = motDePasse && confirmMotDePasse && motDePasse === confirmMotDePasse;

  const passwordChecks = getPasswordChecks(motDePasse);
  const passwordStrength = passwordChecks.filter((c) => c.check).length;
  const strengthColor = STRENGTH_COLORS[passwordStrength] ?? STRENGTH_COLORS[0];
  const strengthLabel = STRENGTH_LABELS[passwordStrength] ?? '';
  const strengthTextColor = STRENGTH_TEXT_COLORS[passwordStrength] ?? STRENGTH_TEXT_COLORS[0];

  return (
    <div className="w-full max-w-lg mx-auto">
      <Card
        padding="lg"
        className="animate-fade-in shadow-2xl border-odc-border-light/50 dark:border-odc-border-dark/50 backdrop-blur-sm"
      >
        {/* ============================================================ */}
        {/* HEADER                                                        */}
        {/* ============================================================ */}
        <div className="text-center mb-8">
          <div className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-odc-primary via-odc-primary to-odc-primary-dark items-center justify-center text-white font-bold text-3xl shadow-odc-lg mb-5 relative overflow-hidden group">
            <span className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative z-10">ODC</span>
          </div>

          <h1 className="font-heading text-3xl font-bold text-odc-text-light dark:text-odc-text-dark mb-2">
            Créer un compte
          </h1>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark max-w-xs mx-auto">
            Rejoignez la communauté ODC en 2 minutes
          </p>
        </div>

        {/* ============================================================ */}
        {/* ERREUR GLOBALE                                                */}
        {/* ============================================================ */}
        {authError && (
          <Alert variant="error" className="mb-5">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{authError}</span>
            </div>
          </Alert>
        )}

        {/* ============================================================ */}
        {/* FORMULAIRE                                                    */}
        {/* ============================================================ */}
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {/* ============================================ */}
          {/* SECTION 1 : Identité                          */}
          {/* ============================================ */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-odc-text-muted-light dark:text-odc-text-muted-dark uppercase tracking-wider">
              <div className="w-1 h-4 bg-odc-primary rounded-full" />
              Votre identité
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                placeholder="Dupont"
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
              placeholder="jean@odc.mg"
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
              helper="Format malgache : +261 ou 034..."
              autoComplete="tel"
              {...register('telephone')}
            />
          </div>

          {/* ============================================ */}
          {/* SECTION 2 : Sécurité                          */}
          {/* ============================================ */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-odc-text-muted-light dark:text-odc-text-muted-dark uppercase tracking-wider">
              <div className="w-1 h-4 bg-odc-primary rounded-full" />
              Sécurité
            </div>

            {/* Mot de passe */}
            <div>
              <Input
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={<Lock size={16} />}
                error={errors.motDePasse?.message}
                autoComplete="new-password"
                required
                {...register('motDePasse')}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-odc-text-muted-light hover:text-odc-primary transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              {/* Indicateur de force */}
              {motDePasse && (
                <div className="mt-3 space-y-2.5">
                  {/* Barres */}
                  <div className="flex gap-1.5">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1.5 flex-1 rounded-full transition-all duration-300',
                          i < passwordStrength
                            ? strengthColor
                            : 'bg-odc-border-light dark:bg-odc-border-dark'
                        )}
                      />
                    ))}
                  </div>

                  {/* Label */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
                      Force du mot de passe
                    </span>
                    <span className={cn('text-xs font-bold', strengthTextColor)}>
                      {strengthLabel}
                    </span>
                  </div>

                  {/* Checklist */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {passwordChecks.map((item) => (
                      <div
                        key={item.key}
                        className={cn(
                          'flex items-center gap-1.5 text-xs transition-colors',
                          item.check
                            ? 'text-odc-success'
                            : 'text-odc-text-muted-light dark:text-odc-text-muted-dark'
                        )}
                      >
                        <div
                          className={cn(
                            'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors',
                            item.check
                              ? 'bg-odc-success text-white'
                              : 'bg-odc-border-light dark:bg-odc-border-dark'
                          )}
                        >
                          {item.check ? <Check size={10} strokeWidth={3} /> : <X size={10} />}
                        </div>
                        {item.label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirmation */}
            <div>
              <Input
                label="Confirmer le mot de passe"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                icon={<Lock size={16} />}
                error={errors.confirmMotDePasse?.message}
                autoComplete="new-password"
                required
                {...register('confirmMotDePasse')}
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="text-odc-text-muted-light hover:text-odc-primary transition-colors p-1"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              {/* Indicateur de correspondance */}
              {confirmMotDePasse && (
                <div className="mt-2 flex items-center gap-1.5 text-xs">
                  {passwordsMatch ? (
                    <>
                      <CheckCircle2 size={14} className="text-odc-success" />
                      <span className="text-odc-success font-medium">
                        Les mots de passe correspondent
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={14} className="text-odc-error" />
                      <span className="text-odc-error font-medium">
                        Les mots de passe ne correspondent pas
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ============================================ */}
          {/* SECTION 3 : Termes                            */}
          {/* ============================================ */}
          <div className="pt-2 space-y-2">
            <Controller
              name="acceptTerms"
              control={control}
              defaultValue={false}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    field.onChange(e.target.checked)
                  }
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  error={!!errors.acceptTerms}
                  label={
                    <span className="text-xs leading-relaxed">
                      J'accepte les{' '}
                      <Link
                        to="/terms"
                        target="_blank"
                        rel="noreferrer"
                        className="text-odc-primary hover:underline font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        conditions d'utilisation
                      </Link>{' '}
                      et la{' '}
                      <Link
                        to="/privacy"
                        target="_blank"
                        rel="noreferrer"
                        className="text-odc-primary hover:underline font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        politique de confidentialité
                      </Link>
                    </span>
                  }
                />
              )}
            />

            {errors.acceptTerms && (
              <p role="alert" className="flex items-center gap-1.5 text-xs text-odc-error">
                <AlertCircle size={12} />
                {errors.acceptTerms.message}
              </p>
            )}
          </div>

          {/* ============================================ */}
          {/* Submit                                        */}
          {/* ============================================ */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            icon={<ArrowRight size={18} />}
            className="mt-2 shadow-odc-md"
          >
            {loading ? 'Création du compte...' : 'Créer mon compte'}
          </Button>
        </form>

        {/* ============================================================ */}
        {/* SÉPARATEUR                                                    */}
        {/* ============================================================ */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-odc-border-light dark:border-odc-border-dark" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white dark:bg-odc-surface-dark text-odc-text-muted-light dark:text-odc-text-muted-dark font-medium">
              DÉJÀ INSCRIT ?
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* LIEN LOGIN                                                    */}
        {/* ============================================================ */}
        <Link
          to="/login"
          className="block text-center text-sm text-odc-primary hover:underline font-semibold group"
        >
          Se connecter à mon compte
          <ArrowRight size={14} className="inline ml-1 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </Card>
    </div>
  );
}

export default RegisterForm;