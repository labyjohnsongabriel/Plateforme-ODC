import { useState } from 'react';
import { Search, Download, Edit, TrendingUp, Award, Users } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { StatCard } from '@/components/charts/StatCard';
import { EvaluationService } from '../services/evaluation.service';
import { useDebounce } from '@/hooks/useDebounce';
import type { Evaluation, Note } from '../types/evaluation.types';

interface NoteTableProps {
  evaluation: Evaluation;
  notes: Note[];
  loading?: boolean;
  onEdit?: (note: Note) => void;
  onExport?: () => void;
}

export function NoteTable({
  evaluation,
  notes,
  loading,
  onEdit,
  onExport,
}: NoteTableProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const filtered = notes.filter(
    (n) =>
      !debouncedSearch ||
      n.participant?.nom.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      n.participant?.prenom.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const stats = EvaluationService.calculerStats(notes, evaluation.noteMax);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Moyenne"
          value={`${stats.moyenne}/${evaluation.noteMax}`}
          icon={<TrendingUp size={22} />}
          variant="primary"
        />
        <StatCard
          label="Médiane"
          value={`${stats.mediane}/${evaluation.noteMax}`}
          icon={<Award size={22} />}
          variant="info"
        />
        <StatCard
          label="Réussite"
          value={stats.reussite}
          icon={<Users size={22} />}
          variant="success"
          subtitle={`${Math.round((stats.reussite / notes.length) * 100)}%`}
        />
        <StatCard
          label="Échec"
          value={stats.echec}
          icon={<Users size={22} />}
          variant="error"
        />
      </div>

      {/* Header */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
          <div>
            <h3 className="font-heading font-bold text-lg text-odc-text-light dark:text-odc-text-dark">
              Notes des participants
            </h3>
            <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
              {notes.length} note(s) • Max {evaluation.noteMax} pts
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={onExport}
          >
            Export CSV
          </Button>
        </div>

        <Input
          placeholder="Rechercher un participant..."
          icon={<Search size={16} />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Card>

      {/* Liste */}
      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Award size={48} />}
          title="Aucune note"
          description="Aucune note enregistrée pour cette évaluation"
        />
      ) : (
        <div className="space-y-2">
          {filtered.map((note) => {
            const variant = EvaluationService.getNoteColor(note.note, evaluation.noteMax);

            return (
              <Card key={note.id} padding="sm">
                <div className="flex items-center gap-4">
                  <Avatar
                    src={note.participant?.photoUrl}
                    name={`${note.participant?.prenom} ${note.participant?.nom}`}
                    size="md"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-odc-text-light dark:text-odc-text-dark truncate">
                      {note.participant?.prenom} {note.participant?.nom}
                    </div>
                    <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark truncate">
                      {note.participant?.email}
                    </div>
                    {note.commentaire && (
                      <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mt-1 line-clamp-1">
                        💬 {note.commentaire}
                      </div>
                    )}
                  </div>

                  <Badge variant={variant as any} size="lg">
                    <Award size={14} />
                    {note.note} / {evaluation.noteMax}
                  </Badge>

                  {onEdit && (
                    <button
                      onClick={() => onEdit(note)}
                      className="p-2 rounded-lg hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20 transition-colors"
                    >
                      <Edit size={16} className="text-odc-primary" />
                    </button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}