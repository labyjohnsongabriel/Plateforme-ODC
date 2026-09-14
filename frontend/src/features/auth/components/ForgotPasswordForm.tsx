import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react';

import { useAuthActions } from '../hooks/useAuth';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Alert } from '@/components/common/Alert';

// ✅ VALEUR (schéma Zod) → import normal
import { forgotPasswordSchema } from '../types/auth.types';

// ✅ TYPE pur → import type
import type { ForgotPasswordFormData } from '../types/auth.types';

// ============================================================================
//  FORGOT PASSWORD FORM
// ============================================================================

export function ForgotPasswordForm() {
  const { loading, error, success, forgotPassword } = useAuthActions();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    await forgotPassword(data.email);
  };

  // ========================================================================
  //  ÉTAT 1 — Succès
  // ========================================================================
  if (success) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card
          padding="lg"
          className="text-center animate-fade-in shadow-2xl border-odc-border-light/50 dark:border-odc-border-dark/50"
        >
          <div className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-odc-success/20 to-odc-success/10 items-center justify-center mb-5">
            <CheckCircle size={40} className="text-odc-success" />
          </div>

          <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark mb-2">
            Email envoyé ! ✉️
          </h1>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark mb-6 max-w-xs mx-auto leading-relaxed">
            Si un compte existe avec cet email, vous recevrez un lien de
            réinitialisation dans quelques instants.
          </p>

          {/* Info check spam */}
          <div className="p-3 rounded-lg bg-odc-info/10 border border-odc-info/20 mb-6">
            <p className="text-xs text-odc-info font-medium">
              💡 Pensez à vérifier vos spams si vous ne voyez pas l'email.
            </p>
          </div>

          <Link to="/login">
            <Button variant="primary" icon={<ArrowLeft size={16} />}>
              Retour à la connexion
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // ========================================================================
  //  ÉTAT 2 — Formulaire
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
            <Mail size={32} className="relative z-10" />
          </div>

          <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark mb-2">
            Mot de passe oublié ?
          </h1>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark max-w-xs mx-auto leading-relaxed">
            Pas de panique ! Entrez votre email et nous vous enverrons un lien
            de réinitialisation.
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
          <Input
            label="Adresse email"
            type="email"
            placeholder="votre.email@odc.mg"
            icon={<Mail size={18} />}
            error={errors.email?.message}
            autoComplete="email"
            autoFocus
            required
            helper="Nous ne partagerons jamais votre email."
            {...register('email')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading || isSubmitting}
            icon={<Send size={18} />}
            className="shadow-odc-md"
          >
            {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
          </Button>
        </form>

        {/* ============================================================== */}
        {/* SÉPARATEUR                                                      */}
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

        {/* ============================================================== */}
        {/* RETOUR LOGIN                                                    */}
        {/* ============================================================== */}
        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm text-odc-primary hover:underline font-semibold group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          Retour à la connexion
        </Link>
      </Card>
    </div>
  );
}

export default ForgotPasswordForm;