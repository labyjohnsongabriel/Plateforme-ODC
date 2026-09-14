import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

// ============================================================================
//  PRIVACY PAGE
// ============================================================================

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-odc-bg-light dark:bg-odc-bg-dark py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Retour */}
        <div className="mb-6">
          <Link to="/register">
            <Button variant="ghost" icon={<ArrowLeft size={16} />}>
              Retour
            </Button>
          </Link>
        </div>

        <Card padding="lg">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-odc-border-light dark:border-odc-border-dark">
            <div className="inline-flex w-12 h-12 rounded-xl bg-odc-primary-soft items-center justify-center text-odc-primary-dark">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark">
                Politique de confidentialité
              </h1>
              <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
                Dernière mise à jour : Janvier 2026
              </p>
            </div>
          </div>

          {/* Contenu */}
          <div className="space-y-6 text-odc-text-light dark:text-odc-text-dark">
            <section>
              <h2 className="font-heading text-lg font-semibold mb-2">
                1. Données collectées
              </h2>
              <p className="text-sm leading-relaxed text-odc-text-muted-light dark:text-odc-text-muted-dark">
                Nous collectons les données que vous fournissez lors de votre
                inscription : nom, prénom, email, téléphone, ainsi que les
                données liées à votre activité sur la plateforme (formations,
                présences, évaluations).
              </p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold mb-2">
                2. Finalité du traitement
              </h2>
              <p className="text-sm leading-relaxed text-odc-text-muted-light dark:text-odc-text-muted-dark">
                Vos données sont utilisées pour :
              </p>
              <ul className="text-sm leading-relaxed text-odc-text-muted-light dark:text-odc-text-muted-dark list-disc pl-5 space-y-1 mt-2">
                <li>Gérer votre compte et vos inscriptions aux formations</li>
                <li>Suivre votre progression et générer vos attestations</li>
                <li>Vous envoyer des notifications relatives à la plateforme</li>
                <li>Améliorer nos services</li>
              </ul>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold mb-2">
                3. Conservation des données
              </h2>
              <p className="text-sm leading-relaxed text-odc-text-muted-light dark:text-odc-text-muted-dark">
                Vos données sont conservées pendant la durée de votre compte,
                puis archivées pendant 3 ans pour des raisons légales et
                statistiques.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold mb-2">
                4. Partage des données
              </h2>
              <p className="text-sm leading-relaxed text-odc-text-muted-light dark:text-odc-text-muted-dark">
                Vos données ne sont jamais vendues. Elles peuvent être
                partagées avec les formateurs et le personnel ODC dans le
                cadre de votre parcours de formation, ou avec les partenaires
                uniquement après votre consentement explicite.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold mb-2">
                5. Vos droits
              </h2>
              <p className="text-sm leading-relaxed text-odc-text-muted-light dark:text-odc-text-muted-dark">
                Vous disposez des droits suivants : accès, rectification,
                suppression, portabilité et opposition. Pour les exercer,
                contactez-nous à{' '}
                <a
                  href="mailto:dpo@odc.mg"
                  className="text-odc-primary hover:underline font-medium"
                >
                  dpo@odc.mg
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold mb-2">
                6. Cookies
              </h2>
              <p className="text-sm leading-relaxed text-odc-text-muted-light dark:text-odc-text-muted-dark">
                La plateforme utilise uniquement des cookies essentiels au
                fonctionnement (authentification, préférences linguistiques,
                thème). Aucun cookie publicitaire n'est utilisé.
              </p>
            </section>

            <section>
              <h2 className="font-heading text-lg font-semibold mb-2">
                7. Sécurité
              </h2>
              <p className="text-sm leading-relaxed text-odc-text-muted-light dark:text-odc-text-muted-dark">
                Nous mettons en œuvre des mesures techniques et
                organisationnelles pour protéger vos données : chiffrement
                HTTPS, hachage des mots de passe, contrôles d'accès stricts.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-odc-border-light dark:border-odc-border-dark flex justify-between items-center">
            <Link
              to="/terms"
              className="text-sm text-odc-primary hover:underline font-medium"
            >
              ← Conditions d'utilisation
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