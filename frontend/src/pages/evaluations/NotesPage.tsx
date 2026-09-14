import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Award } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { sessionApi } from '@/services/session.api';
import { evaluationApi } from '@/services/evaluation.api';
import { Card } from '@/components/common/Card';
import { Select } from '@/components/common/Select';
import { Loader } from '@/components/common/Loader';
import { NoteTable } from '@/features/evaluations';

export default function NotesPage() {
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState(searchParams.get('session') || '');
  const [evaluationId, setEvaluationId] = useState(searchParams.get('evaluation') || '');

  const { data: sessionsData } = useFetch(() => sessionApi.list({ limit: 100 }), []);
  const sessions = sessionsData?.data || [];

  const { data: evaluations, loading } = useFetch(
    () => (sessionId ? evaluationApi.listBySession(sessionId) : Promise.resolve([])),
    [sessionId]
  );

  const currentEval = evaluations?.find((e: any) => e.id === evaluationId);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark">
        Gestion des notes
      </h1>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Select
            label="Session"
            value={sessionId}
            onChange={(e) => {
              setSessionId(e.target.value);
              setEvaluationId('');
            }}
            options={sessions.map((s: any) => ({ value: s.id, label: s.formation?.titre }))}
            placeholder="Sélectionnez une session"
          />

          {sessionId && evaluations && (
            <Select
              label="Évaluation"
              value={evaluationId}
              onChange={(e) => setEvaluationId(e.target.value)}
              options={evaluations.map((e: any) => ({ value: e.id, label: e.titre }))}
              placeholder="Sélectionnez une évaluation"
            />
          )}
        </div>
      </Card>

      {loading ? (
        <Loader />
      ) : currentEval ? (
        <NoteTable evaluation={currentEval} notes={currentEval.notes || []} onEdit={() => {}} />
      ) : null}
    </div>
  );
}