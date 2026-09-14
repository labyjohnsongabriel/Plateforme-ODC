import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Save, X, User as UserIcon, Mail, Phone, MapPin, Briefcase, Linkedin, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserForm } from '../hooks/useUserForm';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { FormSection } from '@/components/forms/FormSection';
import { FormError } from '@/components/forms/FormError';
import { RoleSelector } from './RoleSelector';
import { RoleName } from '../types/user.types';
import { z } from 'zod';

const userFormSchema = z.object({
  nom: z.string().min(2, 'Minimum 2 caractères'),
  prenom: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  telephone: z.string().optional(),
  roleNom: z.nativeEnum(RoleName),
  ville: z.string().optional(),
  entreprise: z.string().optional(),
  poste: z.string().optional(),
  linkedin: z.string().url('URL invalide').optional().or(z.literal('')),
  bio: z.string().max(500).optional(),
  motDePasse: z.string().optional(),
});

type UserFormData = z.infer<typeof userFormSchema>;

interface UserFormProps {
  userId?: string;
}

export function UserForm({ userId }: UserFormProps) {
  const navigate = useNavigate();
  const { user, loading, fetching, create, update, isEdit } = useUserForm(userId);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    values: user
      ? {
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          telephone: user.telephone || '',
          roleNom: user.role.nom,
          ville: user.ville || '',
          entreprise: user.entreprise || '',
          poste: user.poste || '',
          linkedin: user.linkedin || '',
          bio: user.bio || '',
        }
      : {
          roleNom: RoleName.PARTICIPANT,
        },
  });

  const selectedRole = watch('roleNom');

  const onSubmit = async (data: UserFormData) => {
    setGlobalError(null);

    if (isEdit) {
      const updated = await update({
        nom: data.nom,
        prenom: data.prenom,
        telephone: data.telephone,
        ville: data.ville,
        entreprise: data.entreprise,
        poste: data.poste,
        linkedin: data.linkedin,
        bio: data.bio,
      });
      if (updated) navigate('/users');
    } else {
      if (!data.motDePasse || data.motDePasse.length < 8) {
        setGlobalError('Le mot de passe doit contenir au moins 8 caractères');
        return;
      }
      const created = await create({
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        telephone: data.telephone,
        ville: data.ville,
        roleNom: data.roleNom,
        motDePasse: data.motDePasse,
      });
      if (created) navigate('/users');
    }
  };

  if (fetching) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark rounded w-1/4" />
          <div className="h-10 bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark rounded" />
          <div className="h-4 bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark rounded w-1/3" />
          <div className="h-10 bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark rounded" />
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {globalError && <FormError message={globalError} />}

      {/* Informations personnelles */}
      <Card>
        <FormSection
          title="Informations personnelles"
          description="Renseignez les informations de l'utilisateur"
          icon={<UserIcon size={20} />}
          columns={2}
        >
          <Input
            label="Prénom"
            placeholder="Jean"
            icon={<UserIcon size={16} />}
            error={errors.prenom?.message}
            required
            {...register('prenom')}
          />
          <Input
            label="Nom"
            placeholder="Dupont"
            icon={<UserIcon size={16} />}
            error={errors.nom?.message}
            required
            {...register('nom')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="jean@odc.mg"
            icon={<Mail size={16} />}
            error={errors.email?.message}
            disabled={isEdit}
            required
            {...register('email')}
          />
          <Input
            label="Téléphone"
            type="tel"
            placeholder="+261 34 12 345 67"
            icon={<Phone size={16} />}
            error={errors.telephone?.message}
            {...register('telephone')}
          />
          <Input
            label="Ville"
            placeholder="Antananarivo"
            icon={<MapPin size={16} />}
            error={errors.ville?.message}
            {...register('ville')}
          />
        </FormSection>
      </Card>

      {/* Rôle */}
      <Card>
        <RoleSelector
          value={selectedRole}
          onChange={(role) => setValue('roleNom', role)}
          error={errors.roleNom?.message}
        />
      </Card>

      {/* Informations pro */}
      <Card>
        <FormSection
          title="Informations professionnelles"
          description="Optionnel - utile pour le réseautage"
          icon={<Briefcase size={20} />}
          columns={2}
        >
          <Input
            label="Entreprise"
            placeholder="Orange Madagascar"
            icon={<Briefcase size={16} />}
            error={errors.entreprise?.message}
            {...register('entreprise')}
          />
          <Input
            label="Poste"
            placeholder="Développeur"
            error={errors.poste?.message}
            {...register('poste')}
          />
          <div className="md:col-span-2">
            <Input
              label="LinkedIn"
              placeholder="https://linkedin.com/in/..."
              icon={<Linkedin size={16} />}
              error={errors.linkedin?.message}
              {...register('linkedin')}
            />
          </div>
        </FormSection>

        <div className="mt-4">
          <Textarea
            label="Bio"
            placeholder="Parlez-nous de vous..."
            rows={3}
            maxLength={500}
            showCount
            error={errors.bio?.message}
            {...register('bio')}
          />
        </div>
      </Card>

      {/* Mot de passe (création) */}
      {!isEdit && (
        <Card>
          <FormSection
            title="Sécurité"
            description="Définissez un mot de passe pour l'utilisateur"
            icon={<Lock size={20} />}
            columns={1}
          >
            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              error={errors.motDePasse?.message}
              required
              helper="Minimum 8 caractères"
              {...register('motDePasse')}
            />
          </FormSection>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 sticky bottom-4 bg-white dark:bg-odc-surface-dark p-4 rounded-xl border border-odc-border-light dark:border-odc-border-dark shadow-odc-md">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/users')}
          icon={<X size={16} />}
        >
          Annuler
        </Button>
        <Button type="submit" variant="primary" loading={loading} icon={<Save size={16} />}>
          {isEdit ? 'Enregistrer' : 'Créer l\'utilisateur'}
        </Button>
      </div>
    </form>
  );
}