import type { Metadata } from 'next';
import Link from 'next/link';
import { LoginForm } from './components/LoginForm';
import { SocialLogin } from './components/SocialLogin';

export const metadata: Metadata = {
  title: 'Connexion',
  description: 'Connectez-vous à votre espace ODC',
};

export default function LoginPage() {
  return (
    <div className="animate-fade-in">
      {/* En-tête */}
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">Bon retour 👋</h1>
        <p className="text-odc-muted">
          Connectez-vous pour accéder à votre espace personnel
        </p>
      </div>

      {/* Séparateur social */}
      <SocialLogin />

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-odc-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-3 text-odc-muted">
            OU par email
          </span>
        </div>
      </div>

      {/* Formulaire */}
      <LoginForm />

      {/* Liens */}
      <div className="mt-6 flex items-center justify-between text-sm">
        <Link
          href="/mot-de-passe-oublie"
          className="text-odc-primary font-medium hover:underline"
        >
          Mot de passe oublié ?
        </Link>
        <Link href="/inscription" className="text-odc-muted hover:text-odc-primary">
          Créer un compte
        </Link>
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-odc-muted">
        En vous connectant, vous acceptez nos{' '}
        <Link href="/cgu" className="link-odc">
          Conditions d&apos;utilisation
        </Link>{' '}
        et notre{' '}
        <Link href="/politique-confidentialite" className="link-odc">
          Politique de confidentialité
        </Link>
        .
      </p>
    </div>
  );
}