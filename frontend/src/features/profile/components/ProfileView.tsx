import {
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Building,
  Briefcase,
  Edit,
  Shield,
  CheckCircle,
  Calendar,
  Award,
  User as UserIcon,
} from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { Loader } from '@/components/common/Loader';
import { useProfile } from '../hooks/useProfile';
import { formatDate } from '@/utils/formatDate';

interface ProfileViewProps {
  onEdit?: () => void;
  onChangePassword?: () => void;
}

export function ProfileView({ onEdit, onChangePassword }: ProfileViewProps) {
  const { profile, loading } = useProfile();

  if (loading) return <Loader fullScreen text="Chargement du profil..." />;
  if (!profile) return null;

  const infoItems = [
    { icon: <Mail size={16} />, label: 'Email', value: profile.email, verified: profile.emailVerifie },
    { icon: <Phone size={16} />, label: 'Téléphone', value: profile.telephone || '-' },
    { icon: <MapPin size={16} />, label: 'Ville', value: profile.ville || '-' },
    { icon: <Building size={16} />, label: 'Entreprise', value: profile.entreprise || '-' },
    { icon: <Briefcase size={16} />, label: 'Poste', value: profile.poste || '-' },
    {
      icon: <Linkedin size={16} />,
      label: 'LinkedIn',
      value: profile.linkedin ? (
        <a
          href={profile.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="text-odc-primary hover:underline"
        >
          Voir le profil
        </a>
      ) : (
        '-'
      ),
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark">
          Mon profil
        </h1>
        <div className="flex items-center gap-2">
          {onChangePassword && (
            <Button
              variant="secondary"
              icon={<Shield size={16} />}
              onClick={onChangePassword}
            >
              Changer mot de passe
            </Button>
          )}
          {onEdit && (
            <Button variant="primary" icon={<Edit size={16} />} onClick={onEdit}>
              Modifier
            </Button>
          )}
        </div>
      </div>

      {/* Hero card */}
      <Card className="bg-gradient-to-br from-odc-primary to-odc-primary-dark border-0 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-center gap-6 flex-wrap">
          <Avatar
            src={profile.photoUrl}
            name={`${profile.prenom} ${profile.nom}`}
            size="2xl"
            status="online"
            className="ring-4 ring-white/30"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-heading text-3xl font-bold mb-1">
              {profile.prenom} {profile.nom}
            </h2>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <Badge variant="neutral" className="bg-white/20 text-white border-0">
                <Shield size={12} />
                {profile.role.nom}
              </Badge>
              {profile.emailVerifie && (
                <Badge variant="neutral" className="bg-white/20 text-white border-0">
                  <CheckCircle size={12} />
                  Vérifié
                </Badge>
              )}
            </div>
            <p className="text-sm text-white/80 mt-3">
              Membre depuis {formatDate(profile.createdAt)}
            </p>
          </div>
        </div>
      </Card>

      {/* Informations */}
      <Card>
        <h3 className="font-heading font-semibold text-lg mb-4 text-odc-text-light dark:text-odc-text-dark">
          Informations personnelles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {infoItems.map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-odc-primary-soft dark:bg-odc-primary-soft/20 text-odc-primary-dark dark:text-odc-primary-light flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark uppercase tracking-wider">
                    {item.label}
                  </div>
                  {item.verified && (
                    <CheckCircle size={12} className="text-odc-success" />
                  )}
                </div>
                <div className="text-sm font-medium text-odc-text-light dark:text-odc-text-dark mt-0.5 break-words">
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bio */}
        {profile.bio && (
          <div className="mt-6 pt-4 border-t border-odc-border-light dark:border-odc-border-dark">
            <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark uppercase tracking-wider mb-2">
              Bio
            </div>
            <p className="text-sm text-odc-text-light dark:text-odc-text-dark leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          </div>
        )}

        {/* Compétences */}
        {profile.competences && profile.competences.length > 0 && (
          <div className="mt-6 pt-4 border-t border-odc-border-light dark:border-odc-border-dark">
            <div className="flex items-center gap-2 mb-3">
              <Award size={14} className="text-odc-primary" />
              <div className="text-xs text-odc-text-muted-light dark:text-odc-text-muted-dark uppercase tracking-wider">
                Compétences
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.competences.map((skill, i) => (
                <Badge key={i} variant="primary" size="md">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}