import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

interface OrgNode {
  id: string;
  role: string;
  name?: string;
  level: number;
}

const ORGANIGRAMME: OrgNode[] = [
  { id: 'direction', role: 'Direction Générale', name: 'Direction ODC', level: 0 },
  { id: 'programmes', role: 'Responsable Programmes', level: 1 },
  { id: 'formations', role: 'Pôle Formations', level: 1 },
  { id: 'partenariats', role: 'Pôle Partenariats', level: 1 },
  { id: 'technique', role: 'Pôle Technique', level: 2 },
  { id: 'pedagogique', role: 'Pôle Pédagogique', level: 2 },
  { id: 'admin', role: 'Pôle Administratif', level: 2 },
];

export function OrganigrammeSection() {
  return (
    <section id="organigramme" aria-labelledby="org-title">
      <div className="text-center mb-12">
        <span className="inline-block rounded-full bg-odc-primary-soft text-odc-primary px-4 py-1.5 text-sm font-medium mb-4">
          Organisation
        </span>
        <h2
          id="org-title"
          className="font-display text-3xl md:text-4xl font-bold mb-4"
        >
          Notre organigramme
        </h2>
        <p className="text-odc-muted max-w-2xl mx-auto">
          Une organisation structurée pour répondre efficacement aux besoins de
          nos bénéficiaires.
        </p>
      </div>

      {/* Organigramme visuel simplifié */}
      <div className="max-w-5xl mx-auto">
        {/* Niveau 0 — Direction */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <Card className="min-w-[240px] border-2 border-odc-primary shadow-odc-lg">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-odc-500 to-odc-700 text-white flex items-center justify-center mx-auto mb-3">
                  <span className="font-display font-bold text-lg">ODC</span>
                </div>
                <h3 className="font-display font-semibold text-lg">
                  Direction Générale
                </h3>
              </CardContent>
            </Card>
            {/* Ligne verticale vers le bas */}
            <div className="absolute left-1/2 -bottom-8 w-0.5 h-8 bg-odc-border-strong transform -translate-x-1/2" />
          </div>
        </div>

        {/* Niveau 1 — Pôles principaux */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 relative">
          {/* Ligne horizontale */}
          <div className="hidden md:block absolute top-0 left-[16.66%] right-[16.66%] h-0.5 bg-odc-border-strong" />

          {ORGANIGRAMME.filter((n) => n.level === 1).map((node) => (
            <Card key={node.id} className="relative mt-0">
              {/* Ligne verticale haut */}
              <div className="hidden md:block absolute -top-8 left-1/2 w-0.5 h-8 bg-odc-border-strong transform -translate-x-1/2" />
              <CardContent className="p-5 text-center">
                <h3 className="font-display font-semibold">{node.role}</h3>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Niveau 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ORGANIGRAMME.filter((n) => n.level === 2).map((node) => (
            <Card key={node.id} className="bg-odc-surface-alt">
              <CardContent className="p-4 text-center">
                <p className="text-sm font-medium text-odc-muted">
                  {node.role}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}