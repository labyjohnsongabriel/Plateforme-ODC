import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Lock,
  KeyRound,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  X,
} from 'lucide-react';

import { useAuthActions } from '../hooks/useAuth';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Alert } from '@/components/common/Alert';
import { cn } from '@/utils/cn';

// ✅ VALEUR (schéma Zod) → import normal
import { resetPasswordSchema } from '../types/auth.types';

// ✅ TYPE pur → import type
import type { ResetPasswordFormData } from '../types/auth.types';

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

const STRENGTH_LABELS = [
  '',
  'Très faible',
  'Faible',
  'Moyen',
  'Bon',
  'Excellent',
] as const;

const STRENGTH_TEXT_COLORS = [
  'text-odc-text-muted-light',
  'text-odc-error',
  'text-odc-error',
  'text-odc-warning',
  'text-odc-info',
  'text-odc-success',
] as const;

// ============================================================================
//  RESET PASSWORD FORM
// ============================================================================

export function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loading, error, resetPassword } = useAuthActions();

  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const token = searchParams.get('token') || '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const motDePasse = watch('motDePasse') ?? '';
  const confirmMotDePasse = watch('confirmMotDePasse') ?? '';
  const passwordsMatch =
    motDePasse && confirmMotDePasse && motDePasse === confirmMotDePasse;

  // ========================================================================
  //  Calcul de la force du mot de passe
  // ========================================================================

  const passwordChecks = [
    { key: 'length', check: motDePasse.length >= 8, label: '8 caractères' },
    { key: 'uppercase', check: /[A-Z]/.test(motDePasse), label: '1 majuscule' },
    { key: 'lowercase', check: /[a-z]/.test(motDePasse), label: '1 minuscule' },
    { key: 'number', check: /[0-9]/.test(motDePasse), label: '1 chiffre' },
  ];

  const passwordStrength = passwordChecks.filter((c) => c.check).length;
  const strengthColor = STRENGTH_COLORS[passwordStrength] ?? STRENGTH_COLORS[0];
  const strengthLabel = STRENGTH_LABELS[passwordStrength] ?? '';
  const strengthTextColor = STRENGTH_TEXT_COLORS[passwordStrength] ?? STRENGTH_TEXT_COLORS[0];

  // ========================================================================
  //  Soumission
  // ========================================================================

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword(token, data.motDePasse);
      setSuccess(true);
    } catch {
      // Erreur gérée par useAuthActions
    }
  };

  // ========================================================================
  //  Compte à rebours après succès
  // ========================================================================

  useEffect(() => {
    if (!success) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [success, navigate]);

  // ========================================================================
  //  ÉTAT 1 — Token manquant
  // ========================================================================
  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card
          padding="lg"
          className="text-center animate-fade-in shadow-2xl"
        >
          <div className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-odc-error/20 to-odc-error/10 items-center justify-center mb-5">
            <ShieldCheck size={40} className="text-odc-error" />
          </div>

          <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark mb-2">
            Lien invalide
          </h1>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark mb-6 max-w-xs mx-auto leading-relaxed">
            Ce lien de réinitialisation est invalide ou a expiré. Demandez-en
            un nouveau.
          </p>

          <Link to="/forgot-password">
            <Button variant="primary" icon={<ArrowRight size={16} />}>
              Demander un nouveau lien
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // ========================================================================
  //  ÉTAT 2 — Succès
  // ========================================================================
  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card
          padding="lg"
          className="text-center animate-fade-in shadow-2xl"
        >
          <div className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-odc-success/20 to-odc-success/10 items-center justify-center mb-5">
            <CheckCircle size={40} className="text-odc-success" />
          </div>

          <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark mb-2">
            Mot de passe modifié ! 🔐
          </h1>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark mb-6">
            Vous allez être redirigé vers la page de connexion dans{' '}
            <strong className="text-odc-primary">{countdown}s</strong>...
          </p>

          {/* Barre de progression */}
          <div className="w-full h-1.5 bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark rounded-full overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-odc-primary to-odc-primary-dark rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${((3 - countdown) / 3) * 100}%` }}
            />
          </div>

          <Link to="/login">
            <Button variant="primary" icon={<ArrowRight size={16} />}>
              Se connecter maintenant
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // ========================================================================
  //  ÉTAT 3 — Formulaire
  // ========================================================================
  return (
    <div className="w-full max-w-md mx-auto">
      <Card
        padding="lg"
        className="animate-fade-in shadow-2xl border-odc-border-light/50 dark:border-odc-border-dark/50 backdrop-blur-sm"
      >
        {/* ============================================================== */}
        {/* HEADER                                                          */}
        {/* ============================================================== */}
        <div className="text-center mb-8">
          <div className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-odc-primary via-odc-primary to-odc-primary-dark items-center justify-center text-white shadow-odc-lg mb-5 relative overflow-hidden group">
            <span className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <KeyRound size={32} className="relative z-10" />
          </div>

          <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark mb-2">
            Nouveau mot de passe
          </h1>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark max-w-xs mx-auto leading-relaxed">
            Choisissez un mot de passe sécurisé pour protéger votre compte.
          </p>
        </div>

        {/* ============================================================== */}
        {/* ERREUR                                                          */}
        {/* ============================================================== */}
        {error && (
          <Alert variant="error" className="mb-5">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          </Alert>
        )}

        {/* ============================================================== */}
        {/* FORMULAIRE                                                      */}
        {/* ============================================================== */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          {/* Mot de passe */}
          <div>
            <Input
              label="Nouveau mot de passe"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={<Lock size={18} />}
              error={errors.motDePasse?.message}
              autoComplete="new-password"
              autoFocus
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

                <div className="flex items-center justify-between">
                  <span className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
                    Force du mot de passe
                  </span>
                  <span className={cn('text-xs font-bold', strengthTextColor)}>
                    {strengthLabel}
                  </span>
                </div>

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
                        {item.check ? (
                          <Check size={10} strokeWidth={3} />
                        ) : (
                          <X size={10} />
                        )}
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
              icon={<Lock size={18} />}
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
                    <CheckCircle size={14} className="text-odc-success" />
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

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading || isSubmitting}
            icon={<ArrowRight size={18} />}
            className="shadow-odc-md"
          >
            {loading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
          </Button>
        </form>

        {/* ============================================================== */}
        {/* RETOUR                                                          */}
        {/* ============================================================== */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-odc-border-light dark:border-odc-border-dark" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white dark:bg-odc-surface-dark text-odc-text-muted-light dark:text-odc-text-muted-dark font-medium">
              OU
            </span>
          </div>
        </div>

        <Link
          to="/login"
          className="block text-center text-sm text-odc-primary hover:underline font-semibold"
        >
          Retour à la connexion
        </Link>
      </Card>
    </div>
  );
}

export default ResetPasswordForm;