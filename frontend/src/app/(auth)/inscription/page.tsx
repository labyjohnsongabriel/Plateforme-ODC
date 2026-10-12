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
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">
          Créer votre compte
        </h1>
        <p className="text-odc-muted">
          Rejoignez la communauté ODC en quelques secondes
        </p>
      </div>

      {/* Formulaire */}
      <RegisterForm />

      {/* Liens */}
      <p className="mt-8 text-center text-sm text-odc-muted">
        Vous avez déjà un compte ?{' '}
        <Link href="/connexion" className="link-odc">
          Se connecter
        </Link>
      </p>

      <p className="mt-6 text-center text-xs text-odc-muted">
        En créant un compte, vous acceptez nos{' '}
        <Link href="/cgu" className="link-odc">
          CGU
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