import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { userApi } from '@/services/user.api';
import { RoleName } from '@/types/user.types';

const ROLE_OPTIONS = [
  { value: RoleName.ADMIN, label: 'Administrateur' },
  { value: RoleName.STAFF, label: 'Staff ODC' },
  { value: RoleName.FORMATEUR, label: 'Formateur' },
  { value: RoleName.PARTICIPANT, label: 'Participant' },
  { value: RoleName.PARTENAIRE, label: 'Partenaire' },
];

export default function UserCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    telephone: '',
    ville: '',
    roleNom: RoleName.PARTICIPANT as RoleName,
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userApi.create(form);
      toast.success('Utilisateur créé');
      navigate('/users');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      <Button
        variant="ghost"
        icon={<ArrowLeft size={16} />}
        onClick={() => navigate('/users')}
      >
        Retour
      </Button>

      <Card padding="lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-odc-primary-soft flex items-center justify-center text-odc-primary-dark">
            <UserPlus size={24} />
          </div>
          <div>
            <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark">
              Nouvel utilisateur
            </h1>
            <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
              Créer un compte utilisateur
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              value={form.prenom}
              onChange={(e) => handleChange('prenom', e.target.value)}
              required
            />
            <Input
              label="Nom"
              value={form.nom}
              onChange={(e) => handleChange('nom', e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
            />
            <Input
              label="Mot de passe"
              type="password"
              value={form.motDePasse}
              onChange={(e) => handleChange('motDePasse', e.target.value)}
              required
              helper="Minimum 8 caractères"
            />
            <Input
              label="Téléphone"
              value={form.telephone}
              onChange={(e) => handleChange('telephone', e.target.value)}
            />
            <Input
              label="Ville"
              value={form.ville}
              onChange={(e) => handleChange('ville', e.target.value)}
            />
            <div className="md:col-span-2">
              <Select
                label="Rôle"
                options={ROLE_OPTIONS}
                value={form.roleNom}
                onChange={(e) => handleChange('roleNom', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/users')}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={<Save size={16} />}
              loading={loading}
            >
              Créer l'utilisateur
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}