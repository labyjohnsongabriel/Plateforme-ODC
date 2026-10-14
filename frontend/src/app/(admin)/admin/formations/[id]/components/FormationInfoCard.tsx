'use client';

import {
  Clock,
  Users,
  DollarSign,
  Calendar,
  Info,
  BookOpen,
  Target,
  GraduationCap,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Formation } from '@/hooks/useFormations';

interface FormationInfoCardProps {
  formation: Formation;
}

export function FormationInfoCard({ formation }: FormationInfoCardProps) {
  const prix = formation.prix ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5 text-odc-primary" />
          Informations générales
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Statistiques */}
        <div className="grid gap-4 sm:grid-cols-3">
          <InfoItem
            icon={Clock}
            label="Durée"
            value={`${formation.dureeHeures}h`}
          />
          <InfoItem
            icon={Users}
            label="Places max"
            value={formation.nbParticipantsMax?.toString() ?? '—'}
          />
          <InfoItem
            icon={DollarSign}
            label="Prix"
            value={prix === 0 ? 'Gratuit' : `${prix.toLocaleString('fr-FR')} Ar`}
          />
        </div>

        {/* Slug */}
        <div className="rounded-lg bg-odc-surface-alt/50 p-3">
          <p className="text-xs font-medium text-odc-text-muted">Slug URL</p>
          <code className="mt-1 block font-mono text-sm text-odc-text-primary">
            {formation.slug}
          </code>
        </div>

        {/* Objectifs */}
        {formation.objectifs.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-odc-text-primary">
              <Target className="h-4 w-4 text-odc-primary" />
              Objectifs
            </h4>
            <ul className="space-y-1.5">
              {formation.objectifs.map((o, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-odc-text-secondary"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-odc-primary" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Prérequis */}
        {formation.prerequis.length > 0 && (
          <div>
            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-odc-text-primary">
              <GraduationCap className="h-4 w-4 text-odc-primary" />
              Prérequis
            </h4>
            <ul className="space-y-1.5">
              {formation.prerequis.map((p, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-odc-text-secondary"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-odc-text-muted" />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ============================================================================
   SOUS-COMPOSANT
   ============================================================================ */

interface InfoItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
}

function InfoItem({ icon: Icon, label, value }: InfoItemProps) {
  return (
    <div className="rounded-lg border border-odc-border p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-odc-text-muted" />
        <p className="text-xs font-medium text-odc-text-muted">{label}</p>
      </div>
      <p className="mt-1 font-display text-lg font-bold text-odc-text-primary">
        {value}
      </p>
    </div>
  );
}