import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ForgotPasswordForm } from './components/ForgotPasswordForm';

export const metadata: Metadata = {
  title: 'Mot de passe oublié',
  description: 'Réinitialisez votre mot de passe ODC',
};

export default function ForgotPasswordPage() {
  return (
    <div className="animate-fade-in">
      <Link
        href="/connexion"
        className="inline-flex items-center gap-1.5 text-sm text-odc-muted hover:text-odc-primary transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la connexion
      </Link>

      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-bold mb-2">
          Mot de passe oublié ?
        </h1>
        <p className="text-odc-muted">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>

      <ForgotPasswordForm />
    </div>
  );
}