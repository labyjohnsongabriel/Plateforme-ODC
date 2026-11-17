// src/app/(public)/components/LatestNews.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  category: string;
  image: string;
}

const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Lancement de la nouvelle saison de formations 2025',
    excerpt:
      "L'ODC ouvre une nouvelle saison avec plus de 50 formations dans les domaines du numérique.",
    slug: 'nouvelle-saison-2025',
    date: '2025-01-20',
    category: 'Annonce',
    image:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    title: 'Retour sur le Hackathon Y2C : 15 projets innovants',
    excerpt:
      'Le hackathon organisé par la communauté Y2C a rassemblé plus de 80 jeunes développeurs.',
    slug: 'hackathon-y2c-retour',
    date: '2025-01-15',
    category: 'Événement',
    image:
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    title: 'Partenariat avec Orange Madagascar pour la formation',
    excerpt:
      'Un nouveau partenariat stratégique permet de financer 500 places de formation supplémentaires.',
    slug: 'partenariat-orange-madagascar',
    date: '2025-01-10',
    category: 'Partenariat',
    image:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=80',
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function formatNewsDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function LatestNews() {
  return (
    <section
      className="container-page py-20 md:py-28"
      aria-labelledby="news-title"
    >
      {/* En-tête */}
      <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-700 ring-1 ring-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:ring-orange-900">
            <Newspaper className="h-3.5 w-3.5" aria-hidden />
            Actualités
          </span>
          <h2
            id="news-title"
            className="mb-3 font-display text-3xl font-bold text-foreground md:text-5xl"
          >
            Dernières actualités
          </h2>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Suivez la vie de l&apos;ODC : événements, partenariats, succès de
            nos apprenants.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/actualites">
            Toutes les actualités
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>

      {/* Grille */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MOCK_NEWS.map((news, index) => (
          <Card
            key={news.id}
            className="group animate-fade-in overflow-hidden border-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <Link href={`/actualites/${news.slug}`}>
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <Image
                  src={news.image}
                  alt={news.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized
                />

                {/* Overlay */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                  aria-hidden
                />

                {/* Badge catégorie */}
                <div className="absolute left-4 top-4">
                  <Badge className="bg-orange-500 text-white shadow-lg hover:bg-orange-600">
                    {news.category}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Date */}
                <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Calendar className="h-4 w-4" aria-hidden />
                  {formatNewsDate(news.date)}
                </div>

                {/* Titre */}
                <h3 className="mb-3 line-clamp-2 font-display text-lg font-bold text-foreground transition-colors group-hover:text-orange-600 dark:group-hover:text-orange-400">
                  {news.title}
                </h3>

                {/* Extrait */}
                <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                  {news.excerpt}
                </p>

                {/* Lien */}
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 transition-all group-hover:gap-2.5 dark:text-orange-400">
                  Lire la suite
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}