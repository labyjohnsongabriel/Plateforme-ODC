'use client';

import { BookOpen } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Formation } from '@/hooks/useFormations';

interface FormationProgramCardProps {
  formation: Formation;
}

export function FormationProgramCard({
  formation,
}: FormationProgramCardProps) {
  if (!formation.programme) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-odc-primary" />
            Programme détaillé
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm italic text-odc-text-muted">
            Aucun programme renseigné.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-odc-primary" />
          Programme détaillé
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm text-odc-text-secondary">
          {formation.programme}
        </div>
      </CardContent>
    </Card>
  );
}