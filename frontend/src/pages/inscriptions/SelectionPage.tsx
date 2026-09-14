import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { sessionApi } from '@/services/session.api';
import { inscriptionApi } from '@/services/inscription.api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { Loader } from '@/components/common/Loader';
import { SelectionPanel } from '@/features/inscriptions';
import toast from 'react-hot-toast';

export default function SelectionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState(searchParams.get('session') || '');

  const { data: sessionsData } = useFetch(() => sessionApi.list({ limit: 100 }), []);
  const sessions = sessionsData?.data || [];

  const { data: inscriptionsData, loading, refetch } = useFetch(
    () => (sessionId ? inscriptionApi.list({ sessionId, limit: 500 }) : Promise.resolve({ data: [] })),
    [sessionId]
  );

  const inscriptions = inscriptionsData?.data || [];

  const handleSelectionChange = async (id: string, statut: any, motif?: string) => {
    try {
      await inscriptionApi.selectionner(id, { statut, motifRefus: motif });
      toast.success('Statut mis à jour');
      refetch();
    } catch {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
          Retour
        </Button>
        <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark">
          Sélection des candidats
        </h1>
      </div>

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

      {loading ? (
        <Loader />
      ) : sessionId ? (
        <SelectionPanel
          inscriptions={inscriptions}
          sessionId={sessionId}
          onSelectionChange={handleSelectionChange}
        />
      ) : null}
    </div>
  );
}