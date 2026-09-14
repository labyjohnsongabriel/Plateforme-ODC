import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FileText, Plus } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { sessionApi } from '@/services/session.api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { EmptyState } from '@/components/common/EmptyState';
import { EvaluationList } from '@/features/evaluations';

export default function EvaluationsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState(searchParams.get('session') || '');

  const { data: sessionsData } = useFetch(() => sessionApi.list({ limit: 100 }), []);
  const sessions = sessionsData?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark">
          Évaluations
        </h1>
        {sessionId && (
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={() => navigate(`/evaluations/create?session=${sessionId}`)}
          >
            Nouvelle évaluation
          </Button>
        )}
      </div>

      <Card>
        <Select
          label="Session"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          options={sessions.map((s: any) => ({ value: s.id, label: s.formation?.titre }))}
          placeholder="Sélectionnez une session"
        />
      </Card>

      {sessionId ? (
        <EvaluationList
          sessionId={sessionId}
          onCreate={() => navigate(`/evaluations/create?session=${sessionId}`)}
          onEdit={(e) => navigate(`/evaluations/${e.id}/edit`)}
          onView={(e) => navigate(`/evaluations/${e.id}`)}
        />
      ) : (
        <EmptyState
          icon={<FileText size={48} />}
          title="Sélectionnez une session"
          description="Choisissez une session pour voir les évaluations"
        />
      )}
    </div>
  );
}