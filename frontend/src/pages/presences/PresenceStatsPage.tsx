import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { sessionApi } from '@/services/session.api';
import { Card } from '@/components/common/Card';
import { Select } from '@/components/common/Select';
import { AttendanceStats } from '@/features/presences';

export default function PresenceStatsPage() {
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState(searchParams.get('session') || '');

  const { data: sessionsData } = useFetch(() => sessionApi.list({ limit: 100 }), []);
  const sessions = sessionsData?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark mb-1">
          Statistiques de présence
        </h1>
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

      {sessionId && <AttendanceStats sessionId={sessionId} />}
    </div>
  );
} 