import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, BarChart3, Users, Calendar, Target, Edit } from 'lucide-react';
import { useFormationDetail } from '../hooks/useFormationDetail';
import { FormationService } from '../services/formation.service';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Loader } from '@/components/common/Loader';
import { EmptyState } from '@/components/common/EmptyState';
import { formatDate } from '@/utils/formatDate';

export function FormationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formation, loading } = useFormationDetail(id);

  if (loading) return <Loader fullScreen text="Chargement..." />;
  if (!formation) return <EmptyState icon={<BookOpen size={48} />} title="Formation introuvable" />;

  const niveauVariant = FormationService.getNiveauVariant(formation.niveau);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Button
        variant="ghost"
        size="sm"
        icon={<ArrowLeft size={16} />}
        onClick={() => navigate('/formations')}
      >
        Retour
      </Button>

      {/* Hero */}
      <Card className="bg-gradient-to-br from-odc-primary to-odc-primary-dark border-0 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <BookOpen size={32} />
            </div>
            <div className="flex-1 min-w-0">
              <Badge variant="neutral" className="bg-white/20 text-white border-0 mb-2">
                {formation.domaine}
              </Badge>
              <h1 className="font-heading text-3xl font-bold mb-2">{formation.titre}</h1>
              <div className="flex items-center gap-4 text-white/90 text-sm flex-wrap">
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  {formation.dureeHeures}h
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 size={14} />
                  {FormationService.formatNiveau(formation.niveau)}
                </span>
              </div>
            </div>
            <Button
              variant="secondary"
              icon={<Edit size={16} />}
              onClick={() => navigate(`/formations/${formation.id}/edit`)}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            >
              Modifier
            </Button>
          </div>
        </div>
      </Card>

      {/* Description */}
      {formation.description && (
        <Card>
          <h2 className="font-heading font-semibold text-lg mb-3 text-odc-text-light dark:text-odc-text-dark">
            Description
          </h2>
          <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark leading-relaxed whitespace-pre-line">
            {formation.description}
          </p>
        </Card>
      )}

      {/* Prérequis & Objectifs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {formation.prerequis && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} className="text-odc-primary" />
              <h3 className="font-heading font-semibold text-odc-text-light dark:text-odc-text-dark">
                Prérequis
              </h3>
            </div>
            <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark leading-relaxed whitespace-pre-line">
              {formation.prerequis}
            </p>
          </Card>
        )}

        {formation.objectifs && (
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Target size={18} className="text-odc-success" />
              <h3 className="font-heading font-semibold text-odc-text-light dark:text-odc-text-dark">
                Objectifs
              </h3>
            </div>
            <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark leading-relaxed whitespace-pre-line">
              {formation.objectifs}
            </p>
          </Card>
        )}
      </div>

      {/* Sessions */}
      {formation.sessions && formation.sessions.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-lg text-odc-text-light dark:text-odc-text-dark">
              Sessions programmées
            </h2>
            <Badge variant="primary" size="sm">
              {formation.sessions.length}
            </Badge>
          </div>
          <div className="space-y-3">
            {formation.sessions.map((session: any) => (
              <div
                key={session.id}
                className="flex items-center gap-4 p-3 rounded-xl bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark hover:bg-odc-primary-soft dark:hover:bg-odc-primary-soft/10 transition-colors cursor-pointer"
                onClick={() => navigate(`/sessions/${session.id}`)}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-odc-primary to-odc-primary-dark flex items-center justify-center text-white flex-shrink-0">
                  <Calendar size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-odc-text-light dark:text-odc-text-dark">
                    {formatDate(session.dateDebut)} → {formatDate(session.dateFin)}
                  </div>
                  <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark mt-0.5">
                    {session.lieu || 'Lieu à préciser'}
                  </div>
                </div>
                <Badge variant="primary" size="sm">
                  {session.statut}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}