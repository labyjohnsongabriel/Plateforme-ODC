import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Users, TrendingUp } from 'lucide-react';
import { useFetch } from '@/hooks/useFetch';
import { sessionApi } from '@/services/session.api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/utils/formatDate';

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: session, loading } = useFetch(
    () => (id ? sessionApi.getById(id) : Promise.resolve(null)),
    [id]
  );

  if (loading) return <Loader fullScreen />;
  if (!session) return <EmptyState title="Session introuvable" />;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
        Retour
      </Button>

      <Card className="bg-gradient-to-br from-odc-primary to-odc-primary-dark border-0 text-white">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Calendar size={28} />
          </div>
          <div className="flex-1 min-w-0">
            <Badge variant="neutral" className="bg-white/20 text-white border-0 mb-2">
              {session.statut}
            </Badge>
            <h1 className="font-heading text-2xl font-bold mb-2">
              {session.formation?.titre}
            </h1>
            <div className="flex items-center gap-4 text-white/90 text-sm flex-wrap">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {formatDate(session.dateDebut)} → {formatDate(session.dateFin)}
              </span>
              {session.lieu && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {session.lieu}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users size={14} />
                {session.capacite} places
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Actions rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button variant="outline" onClick={() => navigate(`/presences?session=${id}`)}>
          Présences
        </Button>
        <Button variant="outline" onClick={() => navigate(`/evaluations?session=${id}`)}>
          Évaluations
        </Button>
        <Button variant="outline" onClick={() => navigate(`/attestations?session=${id}`)}>
          Attestations
        </Button>
        <Button variant="outline" onClick={() => navigate(`/selections?session=${id}`)}>
          Sélections
        </Button>
      </div>
    </div>
  );
}