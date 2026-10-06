import Link from 'next/link';
import { Calendar, MapPin, Clock, ArrowRight, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/* ============================================================================
   DONNÉES (à remplacer par un fetch API)
   ============================================================================ */
interface Event {
  id: string;
  title: string;
  slug: string;
  date: string;
  time: string;
  location: string;
  category: string;
  spots: number;
  spotsLeft: number;
}

const MOCK_EVENTS: Event[] = [
  {
    id: '1',
    title: 'Bootcamp React & Node.js',
    slug: 'bootcamp-react-node',
    date: '2025-02-15',
    time: '09:00',
    location: 'ODC Antananarivo',
    category: 'Développement Web',
    spots: 30,
    spotsLeft: 8,
  },
  {
    id: '2',
    title: 'Introduction à la Data Science',
    slug: 'intro-data-science',
    date: '2025-02-22',
    time: '14:00',
    location: 'ODC Antananarivo',
    category: 'Data',
    spots: 25,
    spotsLeft: 12,
  },
  {
    id: '3',
    title: 'Atelier UX/UI Design',
    slug: 'atelier-ux-ui',
    date: '2025-03-01',
    time: '10:00',
    location: 'En ligne',
    category: 'Design',
    spots: 40,
    spotsLeft: 22,
  },
];

function formatEventDate(date: string) {
  const d = new Date(date);
  return {
    day: d.toLocaleDateString('fr-FR', { day: '2-digit' }),
    month: d.toLocaleDateString('fr-FR', { month: 'short' }).toUpperCase(),
  };
}

export function UpcomingEvents() {
  return (
    <section
      className="container-page py-20 md:py-28"
      aria-labelledby="events-title"
    >
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
        <div>
          <span className="inline-block rounded-full bg-odc-primary-soft text-odc-primary px-4 py-1.5 text-sm font-medium mb-4">
            📅 Agenda
          </span>
          <h2
            id="events-title"
            className="font-display text-3xl md:text-5xl font-bold mb-3"
          >
            Sessions à venir
          </h2>
          <p className="text-odc-muted text-lg max-w-2xl">
            Réservez votre place pour les prochaines formations et événements de
            l&apos;ODC.
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link href="/sessions">
            Voir toutes les sessions
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </div>

      {/* Grille */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_EVENTS.map((event, index) => {
          const { day, month } = formatEventDate(event.date);
          const fillPercent = Math.round(
            ((event.spots - event.spotsLeft) / event.spots) * 100,
          );

          return (
            <Card
              key={event.id}
              className="group overflow-hidden hover:shadow-odc-lg transition-all animate-fade-in"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <CardContent className="p-0">
                {/* Bandeau date */}
                <div className="flex items-center gap-4 p-5 border-b border-odc-border bg-gradient-to-r from-odc-50 to-transparent dark:from-odc-950">
                  <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-odc-primary text-white shrink-0">
                    <span className="font-display text-2xl font-bold leading-none">
                      {day}
                    </span>
                    <span className="text-xs font-medium">{month}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <Badge variant="outline" className="mb-2">
                      {event.category}
                    </Badge>
                    <h3 className="font-display font-semibold line-clamp-2 group-hover:text-odc-primary transition-colors">
                      {event.title}
                    </h3>
                  </div>
                </div>

                {/* Détails */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-odc-secondary">
                    <Clock className="h-4 w-4 text-odc-primary shrink-0" />
                    {event.time}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-odc-secondary">
                    <MapPin className="h-4 w-4 text-odc-primary shrink-0" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-odc-secondary">
                    <Users className="h-4 w-4 text-odc-primary shrink-0" />
                    {event.spotsLeft} places restantes sur {event.spots}
                  </div>

                  {/* Barre de remplissage */}
                  <div className="pt-2">
                    <div className="h-1.5 rounded-full bg-odc-surface-alt overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-odc-500 to-odc-700 transition-all duration-500"
                        style={{ width: `${fillPercent}%` }}
                      />
                    </div>
                  </div>

                  <Button variant="odc" className="w-full mt-3" asChild>
                    <Link href={`/formations/${event.slug}`}>
                      S&apos;inscrire
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}