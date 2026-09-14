import { Award, Download, Share2, ExternalLink, X, CheckCircle } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { AttestationService } from '../services/attestation.service';
import { formatDate } from '@/utils/formatDate';
import { cn } from '@/utils/cn';

interface AttestationPreviewProps {
  attestation: any;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (attestation: any) => void;
  onShare?: (attestation: any) => void;
}

export function AttestationPreview({
  attestation,
  isOpen,
  onClose,
  onDownload,
  onShare,
}: AttestationPreviewProps) {
  if (!attestation) return null;

  const shareUrl = AttestationService.getShareUrl(attestation.numero);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Aperçu de l'attestation"
      size="xl"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} icon={<X size={16} />}>
            Fermer
          </Button>
          {onShare && (
            <Button
              variant="secondary"
              icon={<Share2 size={16} />}
              onClick={() => onShare(attestation)}
            >
              Partager
            </Button>
          )}
          {onDownload && (
            <Button
              variant="primary"
              icon={<Download size={16} />}
              onClick={() => onDownload(attestation)}
            >
              Télécharger PDF
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {/* Aperçu PDF */}
        <div className="aspect-[297/210] bg-gradient-to-br from-odc-bg-light to-white dark:from-odc-bg-dark dark:to-odc-surface-dark rounded-xl border-2 border-odc-primary overflow-hidden relative">
          {/* Décorations */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-odc-primary via-odc-primary-dark to-odc-primary" />
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-odc-primary to-odc-primary-dark" />

          {/* Contenu */}
          <div className="h-full p-8 flex flex-col justify-center items-center text-center relative">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-[120px] font-bold text-odc-primary/5 rotate-[-20deg] font-heading">
                ODC
              </span>
            </div>

            <div className="relative z-10">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-odc-primary to-odc-primary-dark flex items-center justify-center text-white mx-auto mb-4 shadow-odc-lg">
                <Award size={40} />
              </div>

              <h2 className="font-heading text-3xl font-bold text-odc-primary mb-1">
                ATTESTATION
              </h2>
              <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark uppercase tracking-widest mb-6">
                de réussite de formation
              </p>

              <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mb-2">
                Nous certifions que
              </p>
              <h3 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark mb-4 border-b-2 border-dashed border-odc-primary/30 pb-2 inline-block px-4">
                {attestation.participant?.prenom} {attestation.participant?.nom}
              </h3>

              <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mt-4 mb-2">
                a suivi avec succès la formation
              </p>
              <h4 className="font-heading text-lg font-semibold text-odc-primary-dark dark:text-odc-primary-light">
                « {attestation.session?.formation?.titre} »
              </h4>

              <div className="flex items-center justify-center gap-4 mt-4">
                <Badge variant="primary" size="sm">
                  <CheckCircle size={10} />
                  Note : {Number(attestation.noteFinale || 0).toFixed(2)}/20
                </Badge>
                <Badge variant="success" size="sm">
                  Présence : {Number(attestation.tauxPresence || 0).toFixed(1)}%
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark">
            <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mb-1">
              Numéro d'attestation
            </div>
            <div className="font-mono font-semibold text-odc-primary">
              {attestation.numero}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark">
            <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mb-1">
              Date d'émission
            </div>
            <div className="font-semibold text-odc-text-light dark:text-odc-text-dark">
              {formatDate(attestation.dateEmission)}
            </div>
          </div>
        </div>

        {/* URL de partage */}
        <div className="p-3 rounded-lg bg-odc-primary-soft/50 dark:bg-odc-primary-soft/10 border border-odc-primary/20">
          <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mb-1.5">
            URL publique de vérification
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 font-mono text-xs text-odc-primary break-all">
              {shareUrl}
            </code>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 p-1.5 rounded hover:bg-odc-primary/10 transition-colors"
            >
              <ExternalLink size={14} className="text-odc-primary" />
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}