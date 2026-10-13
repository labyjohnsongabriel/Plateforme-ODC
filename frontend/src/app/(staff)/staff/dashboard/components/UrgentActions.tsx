import Link from 'next/link';
import {
  UserCheck, CalendarPlus, Award, FolderOpen, QrCode, BookOpen, ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ACTIONS = [
  {
    icon: UserCheck,
    title: 'Sélectionner des candidats',
    description: 'Valider les inscriptions en attente',
    href: '/staff/selections',
  },
  {
    icon: CalendarPlus,
    title: 'Créer une session',
    description: 'Planifier une nouvelle session',
    href: '/staff/sessions/nouveau',
  },
  {
    icon: QrCode,
    title: 'Gérer les présences',
    description: 'Ouvrir un QR code de présence',
    href: '/staff/presences',
  },
  {
    icon: Award,
    title: 'Générer des attestations',
    description: 'Pour les sessions terminées',
    href: '/staff/attestations',
  },
  {
    icon: BookOpen,
    title: 'Créer une formation',
    description: 'Ajouter au catalogue',
    href: '/staff/formations/nouveau',
  },
  {
    icon: FolderOpen,
    title: 'Ajouter une ressource',
    description: 'Uploader un support',
    href: '/staff/ressources',
  },
];

export function UrgentActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Actions rapides</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIONS.map((a) => {
            const Icon = a.icon;
            return (
              <Link
                key={a.href}
                href={a.href}
                className="group flex flex-col gap-2 p-4 rounded-lg border border-odc-border hover:border-odc-primary hover:bg-odc-primary-soft/40 transition-all"
              >
                <Icon className="h-6 w-6 text-odc-primary" />
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