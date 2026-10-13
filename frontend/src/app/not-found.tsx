import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      {/* Illustration / Numéro */}
      <div className="relative mb-8">
        <span className="font-display text-[180px] md:text-[240px] font-black leading-none bg-gradient-to-br from-odc-500 to-odc-700 bg-clip-text text-transparent">
          404
        </span>
      </div>

      <h1 className="font-display text-2xl md:text-3xl font-bold mb-3 text-center">
        Page introuvable
      </h1>

      <p className="text-odc-muted mb-8 max-w-md text-center">
        La page que vous recherchez a peut-être été déplacée, supprimée ou
        n'a jamais existé.
      </p>

      <div className="flex flex-wrap gap-3 justify-center">
        <Button asChild variant="odc">
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/formations">
            <Search className="h-4 w-4 mr-2" />
            Voir les formations
          </Link>
        </Button>
      </div>
    </div>
  );
}