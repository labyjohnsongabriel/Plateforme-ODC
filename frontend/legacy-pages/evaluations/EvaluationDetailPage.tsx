import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { evaluationApi } from '@/services/evaluation.api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Loader } from '@/components/common/Loader';
import { NoteTable } from '@/features/evaluations';

export default function EvaluationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: evaluation, loading } = useFetch(
    () => (id ? fetch(`/api/evaluations/${id}`).then((r) => r.json()).then((d) => d.data) : Promise.resolve(null)),
    [id]
  );

  if (loading) return <Loader fullScreen />;
  if (!evaluation) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
        Retour
      </Button>

      <Card>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-odc-primary to-odc-primary-dark flex items-center justify-center text-white">
            <Award size={26} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark">
              {evaluation.titre}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="primary">{evaluation.type}</Badge>
              <Badge variant="info">Max {evaluation.noteMax} pts</Badge>
            </div>
          </div>
        </div>
      </Card>

      <NoteTable
        evaluation={evaluation}
        notes={evaluation.notes || []}
        onEdit={() => {}}
      />
    </div>
  );
}