import Image from 'next/image';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
      'L\'ODC ouvre une nouvelle saison avec plus de 50 formations dans les domaines du numérique. Découvrez le programme complet.',
    slug: 'nouvelle-saison-2025',
    date: '2025-01-20',
    category: 'Annonce',
    image: '/images/hero/slide-1.jpg',
  },
  {
    id: '2',
    title: 'Retour sur le Hackathon Y2C : 15 projets innovants',
    excerpt:
      'Le hackathon organisé par la communauté Y2C a rassemblé plus de 80 jeunes développeurs pendant 48 heures.',
    slug: 'hackathon-y2c-retour',
    date: '2025-01-15',
    category: 'Événement',
    image: '/images/hero/slide-2.jpg',
  },
  {
    id: '3',
    title: 'Partenariat avec Orange Madagascar pour la formation',
    excerpt:
      'Un nouveau partenariat stratégique permet de financer 500 places de formation supplémentaires en 2025.',
    slug: 'partenariat-orange-madagascar',
    date: '2025-01-10',
    category: 'Partenariat',
    image: '/images/hero/slide-3.jpg',
  },
];

function formatNewsDate(date: string) {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function LatestNews() {
  return (
    <section
      className="container-page py-20 md:py-28 bg-odc-surface-alt/40 rounded-3xl"
      aria-labelledby="news-title"
    >
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
        <div>
          <span className="inline-block rounded-full bg-odc-primary-soft text-odc-primary px-4 py-1.5 text-sm font-medium mb-4">
            📰 Actualités
          </span>
          <h2
            id="news-title"
            className="font-display text-3xl md:text-5xl font-bold mb-3"
          >
            Dernières actualités
          </h2>
          <p className="text-odc-muted text-lg max-w-2xl">
            Suivez la vie de l&apos;ODC : événements, partenariats, succès de nos
            apprenants.
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link href="/actualites">
            Toutes les actualités
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>

      {/* Grille */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_NEWS.map((news, index) => (
          <Card
            key={news.id}
            className="group overflow-hidden hover:shadow-odc-lg transition-all animate-fade-in"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <Link href={`/actualites/${news.slug}`}>
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden bg-odc-surface-alt">
                <Image
                  src={news.image}
                  alt={news.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-odc-primary text-white hover:bg-odc-primary">
                    {news.category}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm text-odc-muted mb-3">
                  <Calendar className="h-4 w-4" />
                  {formatNewsDate(news.date)}
                </div>

                <h3 className="font-display text-lg font-semibold mb-3 line-clamp-2 group-hover:text-odc-primary transition-colors">
                  {news.title}
                </h3>

                <p className="text-sm text-odc-muted leading-relaxed line-clamp-3 mb-4">
                  {news.excerpt}
                </p>

                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-odc-primary group-hover:gap-2.5 transition-all">
                  Lire la suite
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  );
}