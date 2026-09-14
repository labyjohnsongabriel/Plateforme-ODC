import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-odc-bg-light dark:bg-odc-bg-dark py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link to="/register">
            <Button variant="ghost" icon={<ArrowLeft size={16} />}>
              Retour
            </Button>
          </Link>
        </div>

        <Card padding="lg">
          {/* Titre */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-odc-border-light dark:border-odc-border-dark">
            <div className="inline-flex w-12 h-12 rounded-xl bg-odc-primary-soft items-center justify-center text-odc-primary-dark">
              <FileText size={24} />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark">
                Conditions d'utilisation
              </h1>
              <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
                Dernière mise à jour : Janvier 2026
              </p>
            </div>
          </div>

          {/* Contenu */}
          <div className="prose prose-sm max-w-none text-odc-text-light dark:text-odc-text-dark space-y-6">
            <section>
              <h2 className="font-heading text-lg font-semibold mb-2">
                1. Objet
              </h2>
              <p className="text-sm leading-relaxed text-odc-text-muted-light dark:text-odc-text-muted-dark">
                Les présentes conditions régissent l'utilisation de la plateforme
                ODC (Orange Digital Center) destinée à la gestion et au suivi des
                formations, ainsi qu'au réseautage entre ses membres.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold mb-2">
                2. Accès à la plateforme
              </h2>
              <p className="text-sm leading-relaxed text-odc-text-muted-light dark:text-odc-text-muted-dark">
                L'accès à la plateforme est réservé aux utilisateurs disposant
                d'un compte valide. Vous vous engagez à fournir des informations
                exactes lors de votre inscription et à maintenir la
                confidentialité de vos identifiants.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold mb-2">
                3. Utilisation acceptable
              </h2>
              <ul className="text-sm leading-relaxed text-odc-text-muted-light dark:text-odc-text-muted-dark list-disc pl-5 space-y-1">
                <li>Ne pas usurper l'identité d'un tiers.</li>
                <li>Ne pas publier de contenu illégal, diffamatoire ou offensant.</li>
                <li>Ne pas tenter de contourner les mesures de sécurité.</li>
                <li>Respecter les autres utilisateurs et le personnel ODC.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold mb-2">
                4. Données personnelles
              </h2>
              <p className="text-sm leading-relaxed text-odc-text-muted-light dark:text-odc-text-muted-dark">
                Vos données sont traitées conformément à notre{' '}
                <Link
                  to="/privacy"
                  className="text-odc-primary hover:underline font-medium"
                >
                  politique de confidentialité
                </Link>
                . Vous disposez d'un droit d'accès, de rectification et de
                suppression de vos données.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold mb-2">
                5. Propriété intellectuelle
              </h2>
              <p className="text-sm leading-relaxed text-odc-text-muted-light dark:text-odc-text-muted-dark">
                L'ensemble des contenus pédagogiques, marques et logos présents
                sur la plateforme sont la propriété exclusive d'Orange Digital
                Center ou de leurs ayants droit.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold mb-2">
                6. Modification des conditions
              </h2>
              <p className="text-sm leading-relaxed text-odc-text-muted-light dark:text-odc-text-muted-dark">
                ODC se réserve le droit de modifier ces conditions à tout moment.
                Les utilisateurs seront informés des changements majeurs par
                email ou via la plateforme.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold mb-2">
                7. Contact
              </h2>
              <p className="text-sm leading-relaxed text-odc-text-muted-light dark:text-odc-text-muted-dark">
                Pour toute question relative à ces conditions, contactez-nous à{' '}
                <a
                  href="mailto:contact@odc.mg"
                  className="text-odc-primary hover:underline font-medium"
                >
                  contact@odc.mg
                </a>
                .
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-odc-border-light dark:border-odc-border-dark flex justify-between items-center">
            <Link
              to="/privacy"
              className="text-sm text-odc-primary hover:underline font-medium"
            >
              Politique de confidentialité →
            </Link>
            <Link to="/register">
              <Button variant="secondary" size="sm">
                Retour à l'inscription
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}