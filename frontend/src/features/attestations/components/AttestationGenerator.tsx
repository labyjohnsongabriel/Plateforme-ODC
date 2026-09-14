import { useState } from 'react';
import { Award, Users, Play, CheckCircle, XCircle, Loader2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { ProgressBar } from '@/components/common/ProgressBar';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { useFetch } from '@/hooks/useFetch';
import { sessionApi } from '@/services/session.api';
import { useGenerateAttestation } from '../hooks/useAttestations';
import { AttendanceStats } from '@/features/presences';
import { formatDate } from '@/utils/formatDate';
import { cn } from '@/utils/cn';

export function AttestationGenerator() {
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [result, setResult] = useState<any>(null);

  const { data: sessionsData, loading: loadingSessions } = useFetch(
    () => sessionApi.list({ statut: 'TERMINEE', limit: 100 }),
    []
  );

  const sessions = sessionsData?.data || [];

  const { generating, progress, genererParSession } = useGenerateAttestation();

  const handleGenerate = async () => {
    if (!selectedSession) {
      toast.error('Sélectionnez une session');
      return;
    }
    setResult(null);
    const res = await genererParSession(selectedSession);
    if (res) setResult(res);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-odc-primary to-odc-primary-dark flex items-center justify-center text-white shadow-odc-md flex-shrink-0">
            <Award size={26} />
          </div>
          <div className="flex-1">
            <h2 className="font-heading font-bold text-xl text-odc-text-light dark:text-odc-text-dark mb-1">
              Génération d'attestations
            </h2>
            <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
              Générez automatiquement les attestations pour tous les participants éligibles d'une session.
            </p>

            <div className="mt-3 p-3 rounded-lg bg-odc-warning-bg border border-odc-warning/30">
              <div className="text-xs font-semibold text-odc-warning mb-1">
                ⚠️ Critères d'éligibilité
              </div>
              <ul className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark space-y-0.5">
                <li>• Taux de présence ≥ 75%</li>
                <li>• Note moyenne ≥ 10/20</li>
                <li>• Inscription acceptée</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Sélection session */}
      <Card>
        <div className="space-y-4">
          <Select
            label="Session terminée"
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            placeholder="-- Sélectionnez une session --"
            options={sessions.map((s: any) => ({
              value: s.id,
              label: `${s.formation?.titre} - ${formatDate(s.dateDebut)}`,
            }))}
            required
          />

          {selectedSession && (
            <div className="p-3 rounded-lg bg-odc-info-bg border border-odc-info/30">
              <div className="text-xs text-odc-info">
                ℹ️ Seuls les participants ayant validé les critères recevront une attestation.
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              variant="primary"
              icon={generating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              onClick={handleGenerate}
              loading={generating}
              disabled={!selectedSession || generating}
            >
              {generating ? 'Génération en cours...' : 'Générer les attestations'}
            </Button>
          </div>

          {/* Progression */}
          {generating && (
            <div className="space-y-2">
              <ProgressBar value={progress} variant="primary" showLabel label="Génération..." />
            </div>
          )}
        </div>
      </Card>

      {/* Résultats */}
      {result && (
        <Card>
          <h3 className="font-heading font-bold text-lg mb-4 text-odc-text-light dark:text-odc-text-dark">
            Résultats de la génération
          </h3>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-odc-success-bg border border-odc-success/30 text-center">
              <CheckCircle size={24} className="text-odc-success mx-auto mb-2" />
              <div className="text-3xl font-bold text-odc-success mb-1">{result.succes}</div>
              <div className="text-xs text-odc-success font-semibold uppercase tracking-wider">
                Succès
              </div>
            </div>

            <div className="p-4 rounded-xl bg-odc-error-bg border border-odc-error/30 text-center">
              <XCircle size={24} className="text-odc-error mx-auto mb-2" />
              <div className="text-3xl font-bold text-odc-error mb-1">{result.echecs}</div>
              <div className="text-xs text-odc-error font-semibold uppercase tracking-wider">
                Échecs
              </div>
            </div>
          </div>

          {/* Détails */}
          {result.details && result.details.length > 0 && (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {result.details.map((detail: any, i: number) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border',
                    detail.statut === 'OK'
                      ? 'bg-odc-success-bg/50 border-odc-success/20'
                      : 'bg-odc-error-bg/50 border-odc-error/20'
                  )}
                >
                  {detail.statut === 'OK' ? (
                    <CheckCircle size={18} className="text-odc-success flex-shrink-0" />
                  ) : (
                    <XCircle size={18} className="text-odc-error flex-shrink-0" />
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-odc-text-light dark:text-odc-text-dark truncate">
                      {detail.participant}
                    </div>
                    {detail.raison && (
                      <div className="text-xs text-odc-error mt-0.5">{detail.raison}</div>
                    )}
                  </div>

                  <Badge variant={detail.statut === 'OK' ? 'success' : 'error'} size="xs">
                    {detail.statut}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* État vide */}
      {!selectedSession && !result && (
        <Card>
          <EmptyState
            icon={<Users size={48} />}
            title="Sélectionnez une session"
            description="Choisissez une session terminée pour générer les attestations"
          />
        </Card>
      )}
    </div>
  );
}