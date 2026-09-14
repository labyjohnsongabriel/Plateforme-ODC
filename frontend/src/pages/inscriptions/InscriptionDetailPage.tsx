import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Calendar, CheckCircle } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { inscriptionApi } from '@/services/inscription.api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { Loader } from '@/components/common/Loader';
import { StatutBadge } from '@/features/inscriptions';
import { formatDate } from '@/utils/formatDate';

export default function InscriptionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: inscription, loading } = useFetch(
    () => (id ? inscriptionApi.getById(id) : Promise.resolve(null)),
    [id]
  );

  if (loading) return <Loader fullScreen />;
  if (!inscription) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
        Retour
      </Button>

      <Card>
        <div className="flex items-start gap-4 mb-6">
          <Avatar
            src={inscription.participant?.photoUrl}
            name={`${inscription.participant?.prenom} ${inscription.participant?.nom}`}
            size="xl"
          />
          <div className="flex-1">
            <h1 className="font-heading text-2xl font-bold mb-1 text-odc-text-light dark:text-odc-text-dark">
              {inscription.participant?.prenom} {inscription.participant?.nom}
            </h1>
            <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark mb-2">
              {inscription.participant?.email}
            </p>
            <StatutBadge statut={inscription.statut} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-odc-border-light dark:border-odc-border-dark">
          <div>
            <div className="text-xs uppercase text-odc-text-muted-light dark:text-odc-text-muted-dark mb-1">
              Formation
            </div>
            <div className="font-medium text-odc-text-light dark:text-odc-text-dark">
              {inscription.session?.formation?.titre}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase text-odc-text-muted-light dark:text-odc-text-muted-dark mb-1">
              Date d'inscription
            </div>
            <div className="font-medium text-odc-text-light dark:text-odc-text-dark">
              {formatDate(inscription.dateInscription)}
            </div>
          </div>
        </div>

        {inscription.motivation && (
          <div className="mt-4 pt-4 border-t border-odc-border-light dark:border-odc-border-dark">
            <div className="text-xs uppercase text-odc-text-muted-light dark:text-odc-text-muted-dark mb-2">
              Motivation
            </div>
            <p className="text-sm text-odc-text-light dark:text-odc-text-dark italic">
              "{inscription.motivation}"
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}