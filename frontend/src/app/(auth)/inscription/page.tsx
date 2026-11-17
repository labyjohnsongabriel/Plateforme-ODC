import type { Metadata } from 'next';
import Link from 'next/link';
import { RegisterForm } from './components/RegisterForm';

export const metadata: Metadata = {
  title: 'Créer un compte',
  description: 'Inscrivez-vous sur la plateforme ODC',
};

export default function RegisterPage() {
  return (
    <div className="animate-fade-in">
      {/* En-tête */}
      <header className="mb-8 text-center">
        <h1 className="mb-2 font-display text-3xl font-bold leading-tight tracking-tight text-odc-text-primary">
          Créer votre compte
        </h1>
        <p className="text-sm text-odc-text-secondary">
          Rejoignez la communauté ODC en quelques secondes
        </p>
      </header>

      {/* Formulaire */}
      <RegisterForm />

      {/* Liens */}
      <p className="mt-8 text-center text-sm text-odc-text-secondary">
        Vous avez déjà un compte ?{' '}
        <Link href="/connexion" className="font-medium text-odc-primary hover:underline">
          Se connecter
        </Link>
      </p>

      <p className="mt-6 text-center text-xs leading-relaxed text-odc-text-muted">
        En créant un compte, vous acceptez nos{' '}
        <Link href="/cgu" className="font-medium text-odc-primary hover:underline">CGU</Link>{' '}
        et notre{' '}
        <Link href="/politique-confidentialite" className="font-medium text-odc-primary hover:underline">
          Politique de confidentialité
        </Link>
        .
      </p>
    </div>
  );
}