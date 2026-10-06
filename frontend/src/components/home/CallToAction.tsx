import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CallToAction() {
  return (
    <section className="container-page py-20 md:py-28">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-odc-500 via-odc-600 to-odc-700 text-white shadow-odc-xl">
        {/* Décoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-white/10 blur-3xl" />

        {/* Contenu */}
        <div className="relative px-6 py-16 md:px-16 md:py-24 text-center max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 px-4 py-1.5 text-sm font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Rejoignez-nous dès aujourd&apos;hui
          </span>

          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Prêt à transformer
            <br />
            votre avenir numérique ?
          </h2>

          <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Inscrivez-vous gratuitement et accédez à toutes nos formations, notre
            communauté et nos ressources pédagogiques.
          </p>

          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-white text-odc-600 hover:bg-odc-50 shadow-lg"
            >
              <Link href="/inscription">
                Créer mon compte gratuit
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              <Link href="/formations">Explorer les formations</Link>
            </Button>
          </div>

          {/* Points forts */}
          <div className="mt-12 pt-8 border-t border-white/20 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-white/85">
            <span>✓ Formation 100% gratuite</span>
            <span>✓ Attestations numériques</span>
            <span>✓ Communauté active</span>
            <span>✓ Accompagnement personnalisé</span>
          </div>
        </div>
      </div>
    </section>
  );
}