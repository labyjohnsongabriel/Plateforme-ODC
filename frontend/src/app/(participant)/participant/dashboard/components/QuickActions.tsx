import Link from 'next/link';
import { QrCode, Award, Users, BookOpen, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ACTIONS = [
  {
    icon: QrCode,
    title: 'Scanner un QR',
    description: 'Enregistrer ma présence',
    href: '/participant/presences/scanner',
    color: 'text-odc-primary',
    bg: 'bg-odc-primary-soft',
  },
  {
    icon: Award,
    title: 'Mes attestations',
    description: 'Télécharger mes diplômes',
    href: '/participant/attestations',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-950',
  },
  {
    icon: Users,
    title: 'Annuaire',
    description: 'Découvrir la communauté',
    href: '/participant/reseau/annuaire',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-950',
  },
  {
    icon: BookOpen,
    title: 'Catalogue',
    description: 'Nouvelles formations',
    href: '/formations',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-950',
  },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Accès rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.href}
                href={a.href}
                className="group flex flex-col gap-2 p-4 rounded-lg border border-odc-border hover:border-odc-primary hover:bg-odc-primary-soft/40 transition-all"
              >
                <div className={`w-10 h-10 rounded-lg ${a.bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${a.color}`} />
                </div>
                <div>
                  <p className="font-medium text-sm">{a.title}</p>
                  <p className="text-xs text-odc-muted mt-0.5">{a.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 self-end text-odc-muted group-hover:text-odc-primary group-hover:translate-x-1 transition-all" />
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}