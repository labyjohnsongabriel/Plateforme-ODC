import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Download, Share2 } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import api from '@/services/api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Loader } from '@/components/common/Loader';
import { AttestationService } from '@/features/attestations';
import { formatDate } from '@/utils/formatDate';
import toast from 'react-hot-toast';

export default function AttestationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: attestation, loading } = useFetch(
    () => (id ? api.get(`/attestations/${id}`).then((r) => r.data.data) : Promise.resolve(null)),
    [id]
  );

  if (loading) return <Loader fullScreen />;
  if (!attestation) return null;

  const handleDownload = async () => {
    try {
      await AttestationService.downloadPdf(attestation.id, attestation.numero);
      toast.success('Téléchargement démarré');
    } catch {
      toast.error('Erreur');
    }
  };

  const handleShare = async () => {
    await AttestationService.copyShareUrl(attestation.numero);
    toast.success('Lien copié');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
        Retour
      </Button>

      <Card className="bg-gradient-to-br from-odc-primary to-odc-primary-dark border-0 text-white">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Award size={28} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold mb-1">
              {attestation.session?.formation?.titre}
            </h1>
            <div className="font-mono text-sm text-white/80">{attestation.numero}</div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs uppercase text-odc-text-muted-light dark:text-odc-text-muted-dark mb-1">
              Note finale
            </div>
            <div className="text-2xl font-bold text-odc-success">
              {Number(attestation.noteFinale || 0).toFixed(2)}/20
            </div>
          </div>
          <div>
            <div className="text-xs uppercase text-odc-text-muted-light dark:text-odc-text-muted-dark mb-1">
              Assiduité
            </div>
            <div className="text-2xl font-bold text-odc-primary">
              {Number(attestation.tauxPresence || 0).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-odc-border-light dark:border-odc-border-dark">
          <div className="text-xs uppercase text-odc-text-muted-light dark:text-odc-text-muted-dark mb-1">
            Émise le
          </div>
          <div className="font-medium text-odc-text-light dark:text-odc-text-dark">
            {formatDate(attestation.dateEmission)}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="primary" fullWidth icon={<Download size={16} />} onClick={handleDownload}>
            Télécharger PDF
          </Button>
          <Button variant="secondary" icon={<Share2 size={16} />} onClick={handleShare}>
            Partager
          </Button>
        </div>
      </Card>
    </div>
  );
}