import { useState } from 'react';
import { Search, CheckCircle, XCircle, Award, User, Building2, Calendar, Star, TrendingUp, ExternalLink } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Alert } from '@/components/common/Alert';
import { AttestationService } from '../services/attestation.service';
import { formatDate } from '@/utils/formatDate';

export function AttestationVerify() {
  const [numero, setNumero] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!numero.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await AttestationService.verify(numero.trim().toUpperCase());
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Attestation invalide ou introuvable');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setNumero('');
    setResult(null);
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex w-20 h-20 rounded-3xl bg-gradient-to-br from-odc-primary to-odc-primary-dark items-center justify-center text-white mb-4 shadow-odc-lg">
          <Award size={40} />
        </div>
        <h1 className="font-heading text-3xl font-bold text-odc-text-light dark:text-odc-text-dark mb-2">
          Vérification d'attestation
        </h1>
        <p className="text-odc-text-muted-light dark:text-odc-text-muted-dark">
          Entrez le numéro d'attestation pour vérifier son authenticité
        </p>
      </div>

      {/* Form */}
      <Card padding="lg">
        <div className="space-y-4">
          <Input
            label="Numéro d'attestation"
            placeholder="ODC-2026-WEB-A1B2C3"
            value={numero}
            onChange={(e) => setNumero(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            icon={<Search size={18} />}
            helper="Format : ODC-AAAA-DOMAINE-XXXXXX"
            autoFocus
          />

          <div className="flex gap-3">
            {result && (
              <Button variant="ghost" onClick={handleReset} fullWidth>
                Réinitialiser
              </Button>
            )}
            <Button
              variant="primary"
              onClick={handleVerify}
              loading={loading}
              disabled={!numero.trim()}
              fullWidth
              icon={<Search size={16} />}
            >
              Vérifier l'authenticité
            </Button>
          </div>
        </div>
      </Card>

      {/* Error */}
      {error && (
        <Card padding="lg">
          <div className="text-center">
            <div className="inline-flex w-16 h-16 rounded-full bg-odc-error-bg items-center justify-center mb-4">
              <XCircle size={32} className="text-odc-error" />
            </div>
            <h3 className="font-heading font-bold text-xl text-odc-error mb-2">
              Attestation invalide
            </h3>
            <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
              {error}
            </p>
          </div>
        </Card>
      )}

      {/* Result */}
      {result && (
        <Card padding="lg" className="animate-slide-in">
          {/* Success badge */}
          <div className="flex items-start gap-4 mb-6 pb-6 border-b border-odc-border-light dark:border-odc-border-dark">
            <div className="w-14 h-14 rounded-full bg-odc-success-bg flex items-center justify-center flex-shrink-0">
              <CheckCircle size={28} className="text-odc-success" />
            </div>
            <div className="flex-1">
              <h2 className="font-heading font-bold text-xl text-odc-success mb-1">
                Attestation authentique ✓
              </h2>
              <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
                Cette attestation est valide et enregistrée dans nos systèmes officiels.
              </p>
            </div>
          </div>

          {/* Détails */}
          <div className="space-y-4">
            <InfoRow
              icon={<Award size={18} />}
              label="Numéro"
              value={result.numero}
              mono
            />
            <InfoRow
              icon={<User size={18} />}
              label="Participant"
              value={result.participant}
            />
            <InfoRow
              icon={<Building2 size={18} />}
              label="Formation"
              value={result.formation}
            />
            {result.noteFinale !== undefined && (
              <InfoRow
                icon={<Star size={18} />}
                label="Note finale"
                value={`${Number(result.noteFinale).toFixed(2)} / 20`}
              />
            )}
            <InfoRow
              icon={<Calendar size={18} />}
              label="Date d'émission"
              value={formatDate(result.dateEmission)}
            />
          </div>

          {/* Mention légale */}
          <div className="mt-6 pt-6 border-t border-odc-border-light dark:border-odc-border-dark">
            <div className="flex items-start gap-2 text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
              <TrendingUp size={14} className="flex-shrink-0 mt-0.5 text-odc-primary" />
              <p>
                Cette vérification est effectuée en temps réel sur nos serveurs sécurisés.
                L'authenticité est garantie par un hash SHA-256 unique.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Info */}
      <Card padding="md" className="bg-odc-info-bg dark:bg-odc-info-bg/10 border-odc-info/20">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-odc-info/20 flex items-center justify-center">
            <Award size={16} className="text-odc-info" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-odc-info mb-1">
              Comment vérifier ?
            </h4>
            <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark leading-relaxed">
              Le numéro d'attestation se trouve en haut à droite du document.
              Vous pouvez également scanner le QR Code présent sur l'attestation
              pour accéder directement à cette page.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
//  COMPOSANT INFO ROW
// ============================================================================

function InfoRow({
  icon,
  label,
  value,
  mono,
}: {
  icon: any;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-odc-primary-soft dark:bg-odc-primary-soft/20 flex items-center justify-center text-odc-primary-dark dark:text-odc-primary-light flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark uppercase tracking-wider mb-0.5">
          {label}
        </div>
        <div
          className={
            mono
              ? 'font-mono text-base font-semibold text-odc-primary'
              : 'text-sm font-medium text-odc-text-light dark:text-odc-text-dark'
          }
        >
          {value}
        </div>
      </div>
    </div>
  );
}