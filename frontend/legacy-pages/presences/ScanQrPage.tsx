import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, QrCode } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { sessionApi } from '@/services/session.api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { QrCodeScanner } from '@/features/presences';

export default function ScanQrPage() {
  const navigate = useNavigate();
  const [sessionId, setSessionId] = useState('');

  const { data: sessionsData } = useFetch(() => sessionApi.list({ limit: 100 }), []);
  const sessions = sessionsData?.data || [];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
          Retour
        </Button>
        <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark">
          Scanner QR Code
        </h1>
      </div>

      <Card>
        <Select
          label="Session"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          options={sessions.map((s: any) => ({
            value: s.id,
            label: s.formation?.titre,
          }))}
          placeholder="Sélectionnez une session"
        />
      </Card>

      {sessionId && (
        <QrCodeScanner
          sessionId={sessionId}
          autoStart
          onScanSuccess={(data) => {
            console.log('Présence validée:', data);
          }}
        />
      )}
    </div>
  );
}