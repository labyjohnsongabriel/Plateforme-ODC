import { ArrowLeft, Mail, MapPin, Briefcase, Linkedin, Building, UserPlus, MessageCircle, UserCheck, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import type { MemberUser } from '../types/reseautage.types';

interface MemberProfileProps {
  member: MemberUser;
  isConnected?: boolean;
  onConnect?: () => void;
  onMessage?: () => void;
}

export function MemberProfile({
  member,
  isConnected,
  onConnect,
  onMessage,
}: MemberProfileProps) {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Button
        variant="ghost"
        size="sm"
        icon={<ArrowLeft size={16} />}
        onClick={() => navigate(-1)}
      >
        Retour
      </Button>

      {/* Hero */}
      <Card className="bg-gradient-to-br from-odc-primary to-odc-primary-dark border-0 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative flex items-start gap-4 flex-wrap">
          <Avatar
            src={member.photoUrl}
            name={`${member.prenom} ${member.nom}`}
            size="2xl"
            status="online"
            className="ring-4 ring-white/30"
          />
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-2xl font-bold mb-1">
              {member.prenom} {member.nom}
            </h1>
            <Badge variant="neutral" className="bg-white/20 text-white border-0 mb-2">
              {member.role.nom}
            </Badge>
            {member.bio && <p className="text-sm text-white/90 max-w-2xl">{member.bio}</p>}
          </div>

          <div className="flex items-center gap-2">
            {isConnected ? (
              <Button
                variant="secondary"
                icon={<UserCheck size={16} />}
                disabled
                className="bg-white/20 border-white/30 text-white"
              >
                Connecté
              </Button>
            ) : (
              <Button
                variant="secondary"
                icon={<UserPlus size={16} />}
                onClick={onConnect}
                className="bg-white text-odc-primary hover:bg-white/90"
              >
                Se connecter
              </Button>
            )}
            <Button
              variant="secondary"
              icon={<MessageCircle size={16} />}
              onClick={onMessage}
              className="bg-white/20 border-white/30 text-white hover:bg-white/30"
            />
          </div>
        </div>
      </Card>

      {/* Informations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-heading font-semibold text-lg mb-4 text-odc-text-light dark:text-odc-text-dark">
            Contact
          </h3>
          <div className="space-y-3">
            <InfoRow icon={<Mail size={16} />} label="Email" value={member.email} />
            {member.ville && (
              <InfoRow icon={<MapPin size={16} />} label="Ville" value={member.ville} />
            )}
            {member.linkedin && (
              <InfoRow
                icon={<Linkedin size={16} />}
                label="LinkedIn"
                value={
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-odc-primary hover:underline"
                  >
                    Voir le profil
                  </a>
                }
              />
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-heading font-semibold text-lg mb-4 text-odc-text-light dark:text-odc-text-dark">
            Profession
          </h3>
          <div className="space-y-3">
            {member.entreprise && (
              <InfoRow icon={<Building size={16} />} label="Entreprise" value={member.entreprise} />
            )}
            {member.poste && (
              <InfoRow icon={<Briefcase size={16} />} label="Poste" value={member.poste} />
            )}
          </div>
        </Card>
      </div>

      {/* Compétences */}
      {member.competences && member.competences.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} className="text-odc-primary" />
            <h3 className="font-heading font-semibold text-lg text-odc-text-light dark:text-odc-text-dark">
              Compétences
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {member.competences.map((skill, i) => (
              <Badge key={i} variant="primary" size="md">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: any;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-odc-primary-soft dark:bg-odc-primary-soft/20 flex items-center justify-center text-odc-primary-dark dark:text-odc-primary-light flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-odc-text-muted-light dark:text-odc-text-muted-dark">
          {label}
        </div>
        <div className="text-sm text-odc-text-light dark:text-odc-text-dark truncate">
          {value}
        </div>
      </div>
    </div>
  );
}