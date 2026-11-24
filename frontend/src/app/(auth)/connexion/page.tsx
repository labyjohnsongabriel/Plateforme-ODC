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
      <header className="mb-8 text-center">
  
        <p className="text-sm text-odc-text-secondary">
          Connectez-vous pour accéder à votre espace personnel
        </p>
      </header>

      {/* Social login */}
      <SocialLogin />

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-odc-border" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-odc-background px-3 font-medium uppercase tracking-wider text-odc-text-muted">
            Ou par email
          </span>
        </div>
      </div>

      {/* Formulaire */}
      <LoginForm />

      {/* Liens */}
      <div className="mt-6 flex items-center justify-between text-sm">
        <Link
          href="/mot-de-passe-oublie"
          className="font-medium text-odc-primary transition-colors hover:text-odc-primary-hover"
        >
          Mot de passe oublié ?
        </Link>
        <Link
          href="/inscription"
          className="text-odc-text-muted transition-colors hover:text-odc-primary"
        >
          Créer un compte
        </Link>
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs leading-relaxed text-odc-text-muted">
        En vous connectant, vous acceptez nos{' '}
        <Link href="/cgu" className="font-medium text-odc-primary hover:underline">
          Conditions d'utilisation
        </Link>{' '}
        et notre{' '}
        <Link href="/politique-confidentialite" className="font-medium text-odc-primary hover:underline">
          Politique de confidentialité
        </Link>
        .
      </p>
    </div>
  );
}