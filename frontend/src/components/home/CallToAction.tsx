// src/app/(public)/components/CallToAction.tsx
import Link from 'next/link';
import {
  ArrowRight, Sparkles, CheckCircle2, Rocket, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CallToAction() {
  return (
    <section className="container-page py-20 md:py-28">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 text-white shadow-2xl">
        {/* Décoration de fond */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          aria-hidden
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, white 0%, transparent 40%), radial-gradient(circle at 80% 80%, white 0%, transparent 40%)',
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-white/10 blur-3xl"
          aria-hidden
        />

        <div className="relative mx-auto max-w-4xl px-6 py-16 text-center md:px-16 md:py-24">
          {/* Badge */}
          <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-sm font-semibold backdrop-blur-sm">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Rejoignez-nous dès aujourd&apos;hui
          </span>

          {/* Titre */}
          <h2 className="mb-6 font-display text-3xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Prêt à transformer
            <br />
            votre avenir numérique ?
          </h2>

          {/* Sous-titre */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-white/90 md:text-xl">
            Inscrivez-vous gratuitement et accédez à toutes nos formations, notre
            communauté et nos ressources pédagogiques.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              asChild
              className="bg-white text-orange-600 shadow-xl hover:bg-orange-50 hover:text-orange-700"
            >
              <Link href="/inscription">
                Créer mon compte gratuit
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/40 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
            >
              <Link href="/formations">
                <Rocket className="mr-2 h-4 w-4" aria-hidden />
                Explorer les formations
              </Link>
            </Button>
          </div>

          {/* Points forts */}
          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 border-t border-white/20 pt-8 text-sm text-white/90">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Formation 100% gratuite
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Attestations numériques
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Communauté active
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Accompagnement personnalisé
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}