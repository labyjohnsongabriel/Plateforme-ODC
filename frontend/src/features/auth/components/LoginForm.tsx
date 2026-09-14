import { Link } from 'react-router-dom';
import { Mail, Lock, Sparkles, ArrowRight, Shield, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { useLogin } from '../hooks/useLogin';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/common/Input';
import { Checkbox } from '@/components/common/Checkbox';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Alert } from '@/components/common/Alert';

// ============================================================================
//  DEMO ACCOUNTS
// ============================================================================

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@odc.mg', password: 'Password123' },
  { role: 'Participant', email: 'participant@odc.mg', password: 'Password123' },
] as const;

const SHOW_DEMO_ACCOUNTS = import.meta.env.DEV;

// ============================================================================
//  LOGIN FORM — Design professionnel
// ============================================================================

export function LoginForm() {
  const { form, loading, onSubmit } = useLogin();
  const { error: authError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    setValue,
    formState: { errors },
  } = form;

  const handleFillDemo = (email: string, password: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('motDePasse', password, { shouldValidate: true });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* ================================================================ */}
      {/* Card                                                              */}
      {/* ================================================================ */}
      <Card
        padding="lg"
        className="animate-fade-in shadow-2xl border-odc-border-light/50 dark:border-odc-border-dark/50 backdrop-blur-sm"
      >
        {/* ============================================================ */}
        {/* HEADER                                                        */}
        {/* ============================================================ */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-odc-primary via-odc-primary to-odc-primary-dark items-center justify-center text-white font-bold text-3xl shadow-odc-lg mb-5 relative overflow-hidden group">
            {/* Effet shimmer */}
            <span className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative z-10">ODC</span>
          </div>

          <h1 className="font-heading text-3xl font-bold text-odc-text-light dark:text-odc-text-dark mb-2">
            Bienvenue 👋
          </h1>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark max-w-xs mx-auto leading-relaxed">
            Connectez-vous à votre espace personnel
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
          {/* Email */}
          <div className="space-y-1">
            <Input
              label="Adresse email"
              type="email"
              placeholder="votre.email@odc.mg"
              icon={<Mail size={18} />}
              error={errors.email?.message}
              autoComplete="email"
              autoFocus
              required
              {...register('email')}
            />
          </div>

          {/* Mot de passe */}
          <div className="space-y-1">
            <Input
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              icon={<Lock size={18} />}
              error={errors.motDePasse?.message}
              autoComplete="current-password"
              required
              {...register('motDePasse')}
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-odc-text-muted-light hover:text-odc-primary transition-colors p-1"
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Checkbox
              label={<span className="text-sm">Se souvenir de moi</span>}
              {...register('remember')}
            />
            <Link
              to="/forgot-password"
              className="text-xs text-odc-primary hover:underline font-semibold transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            icon={<ArrowRight size={18} />}
            className="mt-2 shadow-odc-md"
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
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
              OU
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* LIEN INSCRIPTION                                              */}
        {/* ============================================================ */}
        <p className="text-center text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
          Pas encore de compte ?{' '}
          <Link
            to="/register"
            className="text-odc-primary hover:underline font-semibold inline-flex items-center gap-1 group"
          >
            S'inscrire gratuitement
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </p>

        {/* ============================================================ */}
        {/* BADGE SÉCURITÉ                                                */}
        {/* ============================================================ */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
          <Shield size={12} className="text-odc-success" />
          <span>Connexion sécurisée SSL</span>
        </div>
      </Card>

    </div>
  );
}

export default LoginForm;