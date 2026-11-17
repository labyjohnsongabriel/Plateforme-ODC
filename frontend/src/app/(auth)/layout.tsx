// src/app/(auth)/layout.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Shield, Users, Award, ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2 xl:grid-cols-[1.15fr_1fr]">
      {/* ═══════════════════════════════════════════════════════════════════
          COLONNE GAUCHE — Branding premium
          ═══════════════════════════════════════════════════════════════════ */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-10 text-white lg:flex xl:p-14">
        {/* Grille */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
          aria-hidden
        />

        {/* Radial orange */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,121,0,0.3),transparent_55%)]"
          aria-hidden
        />

        {/* Halos */}
        <div
          className="pointer-events-none absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-orange-500/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-orange-500/10 blur-3xl"
          aria-hidden
        />

        {/* Cercles outline */}
        <div
          className="pointer-events-none absolute -right-20 top-20 h-64 w-64 rounded-full border border-white/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-10 top-40 h-96 w-96 rounded-full border border-white/5"
          aria-hidden
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link
            href="/"
            className="group inline-flex items-center gap-3 rounded-xl transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            aria-label="Retour à l'accueil"
          >
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105">
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
          <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-400" />
            </span>
            Rejoignez la communauté
          </span>

          <h1 className="mb-5 font-display text-[2.5rem] font-bold leading-[1.05] tracking-tight text-white xl:text-[3rem]">
            Formez-vous
            <br />
            aux métiers du{' '}
            <span className="relative inline-block">
              <span className="relative z-10 text-white">numérique</span>
              <span className="absolute inset-x-0 bottom-1 z-0 h-2 bg-orange-500/40" aria-hidden />
            </span>
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

      {/* ═══════════════════════════════════════════════════════════════════
          COLONNE DROITE — Formulaire
          ═══════════════════════════════════════════════════════════════════ */}
      <main className="relative flex flex-col bg-slate-50 dark:bg-slate-950">
        {/* Décoration */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-bl-full bg-gradient-to-br from-orange-500/5 to-transparent"
          aria-hidden
        />

        {/* Header mobile */}
        <header className="relative flex items-center justify-between border-b border-slate-200 bg-white/60 p-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/60 lg:hidden">
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
        <div className="relative flex flex-1 items-center justify-center px-4 py-8 sm:px-6 lg:py-12">
          <div className="w-full max-w-md animate-fade-in">{children}</div>
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

/* ═══════════════════════════════════════════════════════════════════════════
   FEATURE ITEM
   ═══════════════════════════════════════════════════════════════════════════ */

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
    <li className="group flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/10 shadow-sm backdrop-blur-md transition-all duration-300 group-hover:scale-105 group-hover:bg-white/20">
        <Icon className="h-4 w-4 text-orange-300" aria-hidden />
      </div>
      <div className="pt-0.5">
        <p className="text-sm font-semibold leading-snug text-white">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-white/70">{description}</p>
      </div>
    </li>
  );
}