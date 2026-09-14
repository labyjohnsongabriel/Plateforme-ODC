import { useState } from 'react';
import {
  User, Mail, Phone, MapPin, Building2, Briefcase, Linkedin, Save,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Avatar } from '@/components/common/Avatar';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/context/AuthContext';
import { userApi } from '@/services/user.api';

export default function ProfilPage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nom: user?.nom ?? '',
    prenom: user?.prenom ?? '',
    telephone: user?.telephone ?? '',
    ville: user?.ville ?? '',
    bio: user?.bio ?? '',
    linkedin: user?.linkedin ?? '',
    entreprise: user?.entreprise ?? '',
    poste: user?.poste ?? '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await userApi.update(user.id, formData);
      updateUser(formData);
      toast.success('Profil mis à jour');
    } catch (err: any) {
      toast.error(err?.message ?? 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <Card padding="lg">
        <div className="flex items-start gap-6 flex-wrap">
          <Avatar
            src={user.photoUrl}
            name={`${user.prenom} ${user.nom}`}
            size="xl"
          />
          <div className="flex-1 min-w-0">
            <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark">
              {user.prenom} {user.nom}
            </h1>
            <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark mt-1">
              {user.email}
            </p>
            {user.role?.nom && (
              <Badge variant="primary" size="md" className="mt-2">
                {user.role.nom}
              </Badge>
            )}
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card padding="lg">
          <h2 className="font-heading text-lg font-semibold mb-6 text-odc-text-light dark:text-odc-text-dark">
            Informations personnelles
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              icon={<User size={16} />}
              value={formData.prenom}
              onChange={(e) => handleChange('prenom', e.target.value)}
            />
            <Input
              label="Nom"
              icon={<User size={16} />}
              value={formData.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
            />
            <Input
              label="Email"
              icon={<Mail size={16} />}
              value={user.email}
              disabled
              helper="L'email ne peut pas être modifié"
            />
            <Input
              label="Téléphone"
              icon={<Phone size={16} />}
              value={formData.telephone}
              onChange={(e) => handleChange('telephone', e.target.value)}
            />
            <Input
              label="Ville"
              icon={<MapPin size={16} />}
              value={formData.ville}
              onChange={(e) => handleChange('ville', e.target.value)}
            />
            <Input
              label="LinkedIn"
              icon={<Linkedin size={16} />}
              value={formData.linkedin}
              onChange={(e) => handleChange('linkedin', e.target.value)}
            />
            <Input
              label="Entreprise"
              icon={<Building2 size={16} />}
              value={formData.entreprise}
              onChange={(e) => handleChange('entreprise', e.target.value)}
            />
            <Input
              label="Poste"
              icon={<Briefcase size={16} />}
              value={formData.poste}
              onChange={(e) => handleChange('poste', e.target.value)}
            />
          </div>

          <div className="mt-4">
            <Textarea
              label="Bio"
              rows={4}
              maxLength={500}
              showCount
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Parlez-nous de vous..."
            />
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={<Save size={16} />}
            >
              Enregistrer
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}