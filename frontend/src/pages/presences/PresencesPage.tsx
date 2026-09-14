import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFetch } from '@/hooks/useFetch';
import { sessionApi } from '@/services/session.api';
import { Card } from '@/components/common/Card';
import { Select } from '@/components/common/Select';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { QrCodeGenerator, PresenceList, AttendanceStats } from '@/features/presences';
import { GraduationCap } from 'lucide-react';

export default function PresencesPage() {
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState(searchParams.get('session') || '');

  const { data: sessionsData } = useFetch(() => sessionApi.list({ limit: 100 }), []);
  const sessions = sessionsData?.data || [];

  const selectedSession = sessions.find((s: any) => s.id === sessionId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark mb-1">
          Gestion des présences
        </h1>
        <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
          Générez des QR codes et suivez les présences
        </p>
      </div>

      {/* Sélection session */}
      <Card>
        <Select
          label="Session"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          options={sessions.map((s: any) => ({
            value: s.id,
            label: `${s.formation?.titre} - ${new Date(s.dateDebut).toLocaleDateString('fr-FR')}`,
          }))}
          placeholder="Sélectionnez une session"
        />
      </Card>

      {sessionId ? (
        <>
          {/* Stats */}
          <AttendanceStats sessionId={sessionId} />

          {/* QR + Liste */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QrCodeGenerator
              sessionId={sessionId}
              sessionName={selectedSession?.formation?.titre}
            />
            <PresenceList sessionId={sessionId} sessionName={selectedSession?.formation?.titre} />
          </div>
        </>
      ) : (
        <EmptyState
          icon={<GraduationCap size={48} />}
          title="Sélectionnez une session"
          description="Choisissez une session pour gérer les présences"
        />
      )}
    </div>
  );
}