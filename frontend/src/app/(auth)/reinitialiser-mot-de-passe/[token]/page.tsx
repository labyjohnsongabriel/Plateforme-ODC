import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ResetPasswordForm } from './components/ResetPasswordForm';

export const metadata: Metadata = {
  title: 'Réinitialiser le mot de passe',
  description: 'Définissez un nouveau mot de passe pour votre compte ODC',
};

interface Props {
  params: { token: string };
}

export default function ResetPasswordPage({ params }: Props) {
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
          Nouveau mot de passe
        </h1>
        <p className="text-odc-muted">
          Choisissez un mot de passe sécurisé pour votre compte
        </p>
      </div>

      <ResetPasswordForm token={params.token} />
    </div>
  );
}