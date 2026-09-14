import { useState } from 'react';
import { FileText, Plus, Search, Edit, Trash2, Award, Users, Calendar } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { useEvaluations } from '../hooks/useEvaluations';
import { EvaluationService } from '../services/evaluation.service';
import { formatDate } from '@/utils/formatDate';
import { TypeEvaluation } from '../types/evaluation.types';
import { cn } from '@/utils/cn';

interface EvaluationListProps {
  sessionId: string;
  onCreate?: () => void;
  onEdit?: (evaluation: any) => void;
  onView?: (evaluation: any) => void;
}

export function EvaluationList({
  sessionId,
  onCreate,
  onEdit,
  onView,
}: EvaluationListProps) {
  const { evaluations, loading, remove } = useEvaluations(sessionId);
  const [search, setSearch] = useState('');

  const filtered = evaluations.filter(
    (e) =>
      !search || e.titre.toLowerCase().includes(search.toLowerCase())
  );

  const typeColors: Record<TypeEvaluation, any> = {
    QUIZ: 'info',
    EXAMEN: 'error',
    PROJET: 'primary',
    TP: 'success',
    ORAL: 'warning',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="font-heading font-bold text-lg text-odc-text-light dark:text-odc-text-dark">
            Évaluations
          </h3>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
            {evaluations.length} évaluation(s)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onCreate && (
            <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={onCreate}>
              Nouvelle évaluation
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      {evaluations.length > 0 && (
        <Input
          placeholder="Rechercher une évaluation..."
          icon={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {/* Liste */}
      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText size={48} />}
          title="Aucune évaluation"
          description="Créez votre première évaluation pour cette session"
          action={
            onCreate && (
              <Button variant="primary" icon={<Plus size={16} />} onClick={onCreate}>
                Créer une évaluation
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((evaluation) => (
            <Card
              key={evaluation.id}
              hover
              className={cn(
                'relative group cursor-pointer',
                'border-l-4'
              )}
              style={
                {
                  borderLeftColor:
                    typeColors[evaluation.type] === 'error'
                      ? '#C62828'
                      : typeColors[evaluation.type] === 'info'
                      ? '#0277BD'
                      : typeColors[evaluation.type] === 'success'
                      ? '#2E7D32'
                      : typeColors[evaluation.type] === 'warning'
                      ? '#F57C00'
                      : '#FF7900',
                } as any
              }
              onClick={() => onView?.(evaluation)}
            >
              {/* Actions */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                {onEdit && (
                  <button
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onEdit(evaluation);
                    }}
                    className="p-1.5 rounded-lg bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark hover:bg-odc-primary-soft transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                )}
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    remove(evaluation.id);
                  }}
                  className="p-1.5 rounded-lg bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark hover:bg-odc-error-bg text-odc-error transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-odc-primary-soft dark:bg-odc-primary-soft/20 flex items-center justify-center text-odc-primary-dark flex-shrink-0">
                  <Award size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-heading font-semibold text-odc-text-light dark:text-odc-text-dark line-clamp-2 pr-16">
                    {evaluation.titre}
                  </h4>
                  <Badge variant={typeColors[evaluation.type]} size="xs" className="mt-1">
                    {EvaluationService.formatType(evaluation.type)}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              {evaluation.description && (
                <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark line-clamp-2 mb-3">
                  {evaluation.description}
                </p>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
                <span className="flex items-center gap-1">
                  <Award size={11} />
                  {evaluation.noteMax} pts
                </span>
                <span className="flex items-center gap-1">
                  <Users size={11} />
                  {evaluation.nbNotes || evaluation.notes?.length || 0} note(s)
                </span>
                {evaluation.dateEvaluation && (
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    {formatDate(evaluation.dateEvaluation)}
                  </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}