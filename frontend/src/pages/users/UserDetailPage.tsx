import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, MapPin, Building2, Briefcase,
  Linkedin, Calendar, Shield, CheckCircle, XCircle, Edit, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { Loader } from '@/components/common/Loader';
import { userApi } from '@/services/user.api';
import { Can } from '@/components/common/Can';
import { PERMISSIONS } from '@/config/permissions.config';
import type { User } from '@/features/users/types/user.types';

// ============================================================================
//  HELPERS
// ============================================================================

function formatDate(date?: string): string {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

// ============================================================================
//  PAGE
// ============================================================================

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetch = async () => {
      setLoading(true);
      try {
        const res = await userApi.getById(id);
        setUser(res.data);
      } catch {
        toast.error('Utilisateur introuvable');
        navigate('/users');
      } finally {
        setLoading(false);
      }
    };

    void fetch();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!user) return;
    if (!confirm(`Supprimer ${user.prenom} ${user.nom} ?`)) return;

    setDeleting(true);
    try {
      await userApi.delete(user.id);
      toast.success('Utilisateur supprimé');
      navigate('/users');
    } catch (err: any) {
      toast.error(err?.message ?? 'Erreur');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loader fullScreen text="Chargement..." />;
  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Retour */}
      <Button
        variant="ghost"
        icon={<ArrowLeft size={16} />}
        onClick={() => navigate('/users')}
      >
        Retour
      </Button>

      {/* Header */}
      <Card padding="lg">
        <div className="flex items-start gap-6 flex-wrap">
          <Avatar
            src={user.photoUrl}
            name={`${user.prenom} ${user.nom}`}
            size="xl"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark">
                  {user.prenom} {user.nom}
                </h1>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {user.role?.nom && (
                    <Badge variant="primary" size="md">
                      <Shield size={12} />
                      {user.role.nom}
                    </Badge>
                  )}
                  {user.actif ? (
                    <Badge variant="success" size="md">
                      <CheckCircle size={12} />
                      Actif
                    </Badge>
                  ) : (
                    <Badge variant="error" size="md">
                      <XCircle size={12} />
                      Inactif
                    </Badge>
                  )}
                  {user.emailVerifie && (
                    <Badge variant="info" size="md">
                      <CheckCircle size={12} />
                      Email vérifié
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Can permission={PERMISSIONS.USERS_EDIT}>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Edit size={14} />}
                    onClick={() => navigate(`/users/${user.id}/edit`)}
                  >
                    Modifier
                  </Button>
                </Can>
                <Can permission={PERMISSIONS.USERS_DELETE}>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<Trash2 size={14} />}
                    onClick={handleDelete}
                    loading={deleting}
                  >
                    Supprimer
                  </Button>
                </Can>
              </div>
            </div>

            {user.bio && (
              <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark mt-4">
                {user.bio}
              </p>
            )}
          </div>
        </div>
      </Card>

      {/* Coordonnées */}
      <Card padding="lg">
        <h2 className="font-heading text-lg font-semibold mb-4 text-odc-text-light dark:text-odc-text-dark">
          Coordonnées
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow icon={<Mail size={16} />} label="Email" value={user.email} />
          <InfoRow
            icon={<Phone size={16} />}
            label="Téléphone"
            value={user.telephone || '—'}
          />
          <InfoRow
            icon={<MapPin size={16} />}
            label="Ville"
            value={user.ville || '—'}
          />
          <InfoRow
            icon={<Linkedin size={16} />}
            label="LinkedIn"
            value={user.linkedin || '—'}
          />
        </div>
      </Card>

      {/* Professionnel */}
      <Card padding="lg">
        <h2 className="font-heading text-lg font-semibold mb-4 text-odc-text-light dark:text-odc-text-dark">
          Professionnel
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow
            icon={<Building2 size={16} />}
            label="Entreprise"
            value={user.entreprise || '—'}
          />
          <InfoRow
            icon={<Briefcase size={16} />}
            label="Poste"
            value={user.poste || '—'}
          />
        </div>

        {user.competences && user.competences.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-odc-text-muted-light dark:text-odc-text-muted-dark mb-2">
              Compétences
            </p>
            <div className="flex flex-wrap gap-2">
              {user.competences.map((comp) => (
                <Badge key={comp} variant="info" size="sm">
                  {comp}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Système */}
      <Card padding="lg">
        <h2 className="font-heading text-lg font-semibold mb-4 text-odc-text-light dark:text-odc-text-dark">
          Système
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow
            icon={<Calendar size={16} />}
            label="Inscrit le"
            value={formatDate(user.createdAt)}
          />
          <InfoRow
            icon={<Calendar size={16} />}
            label="Dernière connexion"
            value={formatDate(user.derniereConnexion)}
          />
        </div>
      </Card>
    </div>
  );
}

// ============================================================================
//  SUB-COMPONENT
// ============================================================================

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-odc-primary-soft dark:bg-odc-primary-soft/20 flex items-center justify-center text-odc-primary-dark flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark">
          {label}
        </p>
        <p className="text-sm font-medium text-odc-text-light dark:text-odc-text-dark truncate">
          {value}
        </p>
      </div>
    </div>
  );
}