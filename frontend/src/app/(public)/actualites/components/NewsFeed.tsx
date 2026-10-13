'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Calendar, ArrowRight, Newspaper } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate } from '@/lib/formatters';

const MOCK_NEWS = [
  {
    id: '1',
    title: 'Lancement de la nouvelle saison de formations 2025',
    excerpt:
      "L'ODC ouvre une nouvelle saison avec plus de 50 formations dans les domaines du numérique.",
    slug: 'nouvelle-saison-2025',
    date: '2025-01-20',
    category: 'Annonce',
    image: '/images/hero/slide-1.jpg',
  },
  {
    id: '2',
    title: 'Retour sur le Hackathon Y2C : 15 projets innovants',
    excerpt:
      'Le hackathon organisé par la communauté Y2C a rassemblé plus de 80 jeunes développeurs.',
    slug: 'hackathon-y2c-retour',
    date: '2025-01-15',
    category: 'Événement',
    image: '/images/hero/slide-2.jpg',
  },
  {
    id: '3',
    title: 'Partenariat avec Orange Madagascar',
    excerpt:
      'Un nouveau partenariat stratégique permet de financer 500 places de formation supplémentaires.',
    slug: 'partenariat-orange-madagascar',
    date: '2025-01-10',
    category: 'Partenariat',
    image: '/images/hero/slide-3.jpg',
  },
];

export function NewsFeed() {
  const news = MOCK_NEWS;

  if (!news.length) {
    return (
      <EmptyState
        icon={Newspaper}
        title="Aucune actualité"
        description="Les actualités seront publiées prochainement."
      />
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map((item, i) => (
        <Card
          key={item.id}
          className="group overflow-hidden hover:-translate-y-1 hover:shadow-odc-lg transition-all animate-fade-in"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <Link href={`/actualites/${item.slug}`}>
            <div className="relative aspect-[16/10] overflow-hidden bg-odc-surface-alt">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <Badge className="absolute top-3 left-3 bg-odc-primary text-white">
                {item.category}
              </Badge>
            </div>

            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-xs text-odc-muted mb-3">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(item.date)}
              </div>

              <h3 className="font-display font-semibold mb-2 line-clamp-2 group-hover:text-odc-primary transition-colors">
                {item.title}
              </h3>

              <p className="text-sm text-odc-muted line-clamp-3 mb-4">
                {item.excerpt}
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
  );
}