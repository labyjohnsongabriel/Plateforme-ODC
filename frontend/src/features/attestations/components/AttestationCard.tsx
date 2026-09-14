import { Award, Download, Eye, Share2, CheckCircle, Calendar, Star, TrendingUp } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { AttestationService } from '../services/attestation.service';
import { formatDate } from '@/utils/formatDate';
import { cn } from '@/utils/cn';

interface AttestationCardProps {
  attestation: any;
  onView?: (attestation: any) => void;
  onDownload?: (attestation: any) => void;
  onShare?: (attestation: any) => void;
}

export function AttestationCard({
  attestation,
  onView,
  onDownload,
  onShare,
}: AttestationCardProps) {
  const percentage = attestation.noteFinale
    ? (attestation.noteFinale / 20) * 100
    : 0;

  const variant = percentage >= 75 ? 'success' : percentage >= 50 ? 'warning' : 'error';

  return (
    <Card hover className="relative overflow-hidden group">
      {/* Gradient decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-odc-primary/10 via-odc-primary/5 to-transparent rounded-bl-full pointer-events-none" />

      {/* Ribbon valide */}
      {attestation.valide && (
        <div className="absolute top-4 -right-8 w-32 bg-odc-success text-white text-[10px] font-bold uppercase tracking-wider text-center py-1 rotate-45 shadow-md">
          Valide
        </div>
      )}

      {/* Header */}
      <div className="relative flex items-start gap-3 mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-odc-primary to-odc-primary-dark flex items-center justify-center text-white shadow-odc-md flex-shrink-0">
          <Award size={26} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-heading font-bold text-lg text-odc-text-light dark:text-odc-text-dark line-clamp-2 leading-tight pr-4">
            {attestation.session?.formation?.titre || 'Formation'}
          </h3>
          <div className="inline-block mt-1 px-2 py-0.5 rounded-md bg-odc-primary-soft dark:bg-odc-primary-soft/20 font-mono text-[10px] text-odc-primary-dark dark:text-odc-primary-light">
            {attestation.numero}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-2.5 rounded-lg bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-odc-text-muted-light dark:text-odc-text-muted-dark mb-1">
            <Star size={10} />
            Note finale
          </div>
          <div
            className={cn(
              'text-lg font-bold',
              variant === 'success'
                ? 'text-odc-success'
                : variant === 'warning'
                ? 'text-odc-warning'
                : 'text-odc-error'
            )}
          >
            {Number(attestation.noteFinale || 0).toFixed(2)}/20
          </div>
        </div>

        <div className="p-2.5 rounded-lg bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark">
          <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-odc-text-muted-light dark:text-odc-text-muted-dark mb-1">
            <TrendingUp size={10} />
            Assiduité
          </div>
          <div className="text-lg font-bold text-odc-primary">
            {Number(attestation.tauxPresence || 0).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Date */}
      <div className="flex items-center justify-between text-xs mb-4 pb-4 border-b border-odc-border-light dark:border-odc-border-dark">
        <span className="flex items-center gap-1 text-odc-text-muted-light dark:text-odc-text-muted-dark">
          <Calendar size={12} />
          Émise le {formatDate(attestation.dateEmission)}
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onView && (
          <Button
            variant="secondary"
            size="sm"
            icon={<Eye size={14} />}
            onClick={() => onView(attestation)}
          >
            Aperçu
          </Button>
        )}

        {onDownload && (
          <Button
            variant="primary"
            size="sm"
            fullWidth
            icon={<Download size={14} />}
            onClick={() => onDownload(attestation)}
          >
            PDF
          </Button>
        )}

        {onShare && (
          <button
            onClick={() => onShare(attestation)}
            className="p-2 rounded-lg hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/20 transition-colors flex-shrink-0"
            title="Partager"
          >
            <Share2 size={16} className="text-odc-primary" />
          </button>
        )}
      </div>
    </Card>
  );
}