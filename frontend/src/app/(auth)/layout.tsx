// src/app/(auth)/layout.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Shield, Users, Award, ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ═══════════ Colonne gauche — Branding ═══════════ */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white lg:flex xl:p-14">
        {/* Fond décoratif simple */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.25),transparent_60%)]"
          aria-hidden
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-xl transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            aria-label="Retour à l'accueil"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-white/20">
              <Image
                src="/images/brand/logo-odc.png"
                alt="Orange Digital Center Madagascar"
                fill
                sizes="48px"
                priority
                className="object-contain p-1.5"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-display text-base font-bold text-white">
                Orange Digital Center
              </span>
              <span className="text-xs font-medium tracking-wide text-white/80">
                Madagascar
              </span>
            </div>
          </Link>
        </div>

        {/* Contenu */}
        <div className="relative z-10 max-w-md">
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white">
            <Sparkles className="h-3 w-3 text-orange-300" aria-hidden />
            Rejoignez la communauté
          </span>

          <h1 className="mb-5 font-display text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
            Formez-vous
            <br />
            aux métiers du <span className="text-orange-400">numérique</span>
          </h1>

          <p className="mb-10 text-base leading-relaxed text-white/80 xl:text-lg">
            Accédez à plus de{' '}
            <strong className="font-semibold text-white">120 formations gratuites</strong>,
            à un suivi personnalisé et à un réseau professionnel actif à Madagascar.
          </p>

          <ul className="space-y-4">
            <FeatureItem
              icon={Award}
              title="Attestations numériques"
              description="Vérifiables par QR code, valorisables auprès des recruteurs"
            />
            <FeatureItem
              icon={Users}
              title="Communauté active"
              description="Réseautage avec les anciens et nouveaux apprenants"
            />
            <FeatureItem
              icon={Shield}
              title="Données sécurisées"
              description="Vos informations sont protégées et confidentielles"
            />
          </ul>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-xs text-white/60">
          <p>© {new Date().getFullYear()} ODC Madagascar</p>
          <div className="flex gap-4">
            <Link href="/mentions-legales" className="transition-colors hover:text-white">
              Mentions légales
            </Link>
            <Link href="/contact" className="transition-colors hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </aside>

      {/* ═══════════ Colonne droite — Formulaire ═══════════ */}
      <main className="flex flex-col bg-slate-50 dark:bg-slate-950">
        {/* Header mobile */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/60 p-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/60 lg:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
              <Image
                src="/images/brand/logo-odc.png"
                alt="Orange Digital Center"
                fill
                sizes="36px"
                priority
                className="object-contain p-0.5"
              />
            </div>
            <span className="font-display text-sm font-bold text-slate-900 dark:text-slate-50">
              ODC Platform
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Accueil
          </Link>
        </header>

        {/* Contenu */}
        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:py-12">
          <div className="w-full max-w-md">{children}</div>
        </div>

        {/* Footer mobile */}
        <footer className="border-t border-slate-200 p-4 text-center dark:border-slate-800 lg:hidden">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} ODC Madagascar
          </p>
        </footer>
      </main>
    </div>
  );
}

/* ═══════════ Feature Item ═══════════ */
function FeatureItem({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <li className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10">
        <Icon className="h-4 w-4 text-orange-300" aria-hidden />
      </div>
      <div className="pt-0.5">
        <p className="text-sm font-semibold leading-snug text-white">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-white/70">{description}</p>
      </div>
    </li>
  );
}