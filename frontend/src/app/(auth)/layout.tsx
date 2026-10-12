import Link from 'next/link';
import { ArrowLeft, Sparkles, Shield, Users, Award } from 'lucide-react';
import { Logo } from '@/components/shared/Logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ====================================================================
          COLONNE GAUCHE — Branding (desktop)
          ==================================================================== */}
      <aside className="hidden lg:flex relative flex-col justify-between p-12 bg-gradient-to-br from-odc-500 via-odc-600 to-odc-700 text-white overflow-hidden">
        {/* Décorations */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/10 blur-3xl" />

        {/* Contenu */}
        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 group"
            aria-label="Retour à l'accueil"
          >
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-sm border border-white/25 flex items-center justify-center font-display font-bold">
              ODC
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold">Orange Digital Center</span>
              <span className="text-xs opacity-80">Madagascar</span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-3 py-1.5 text-xs font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Rejoignez la communauté
          </div>

          <h1 className="font-display text-4xl font-bold leading-tight mb-4">
            Formez-vous aux métiers du numérique
          </h1>

          <p className="text-white/85 text-lg leading-relaxed mb-8">
            Accédez à plus de 120 formations gratuites, à un suivi personnalisé
            et à un réseau professionnel actif à Madagascar.
          </p>

          {/* Points forts */}
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Attestations numériques</p>
                <p className="text-sm text-white/75">
                  Vérifiables par QR code, valorisables auprès des recruteurs
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Communauté active</p>
                <p className="text-sm text-white/75">
                  Réseautage avec les anciens et nouveaux apprenants
                </p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Données sécurisées</p>
                <p className="text-sm text-white/75">
                  Vos informations sont protégées et confidentielles
                </p>
              </div>
            </li>
          </ul>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-white/70">
          <p>© {new Date().getFullYear()} ODC Madagascar</p>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="hover:text-white transition-colors">
              Mentions légales
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </aside>

      {/* ====================================================================
          COLONNE DROITE — Formulaire
          ==================================================================== */}
      <main className="flex flex-col bg-background">
        {/* Header mobile */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-odc-border">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-odc-500 to-odc-700 flex items-center justify-center text-white font-display font-bold text-sm">
              ODC
            </div>
            <span className="font-display font-bold">ODC Platform</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-odc-muted hover:text-odc-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Accueil
          </Link>
        </header>

        {/* Contenu du formulaire */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <div className="w-full max-w-md">{children}</div>
        </div>

        {/* Footer mobile */}
        <footer className="lg:hidden p-4 border-t border-odc-border text-center">
          <p className="text-xs text-odc-muted">
            © {new Date().getFullYear()} ODC Madagascar
          </p>
        </footer>
      </main>
    </div>
  );
}