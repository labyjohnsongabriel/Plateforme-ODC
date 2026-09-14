import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Save,
  X,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Linkedin,
  Building,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { FormSection } from '@/components/forms/FormSection';
import { AvatarUpload } from './AvatarUpload';
import { useProfile } from '../hooks/useProfile';
import { cn } from '@/utils/cn';

// ============================================================================
//  SCHÉMA
// ============================================================================

const profileEditSchema = z.object({
  nom: z.string().min(2, 'Minimum 2 caractères').max(100),
  prenom: z.string().min(2, 'Minimum 2 caractères').max(100),
  telephone: z.string().max(20).optional().or(z.literal('')),
  ville: z.string().max(200).optional().or(z.literal('')),
  entreprise: z.string().max(200).optional().or(z.literal('')),
  poste: z.string().max(200).optional().or(z.literal('')),
  linkedin: z.string().url('URL invalide').optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
});

type ProfileEditFormData = z.infer<typeof profileEditSchema>;

// ============================================================================
//  COMPOSANT
// ============================================================================

interface ProfileEditProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function ProfileEdit({ onCancel, onSuccess }: ProfileEditProps) {
  const { profile, loading, saving, update, uploadAvatar } = useProfile();
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>(profile?.competences || []);

  // Sync skills when profile loads
  if (profile?.competences && skills.length === 0 && profile.competences.length > 0) {
    setSkills(profile.competences);
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileEditFormData>({
    resolver: zodResolver(profileEditSchema),
    values: profile
      ? {
          nom: profile.nom,
          prenom: profile.prenom,
          telephone: profile.telephone || '',
          ville: profile.ville || '',
          entreprise: profile.entreprise || '',
          poste: profile.poste || '',
          linkedin: profile.linkedin || '',
          bio: profile.bio || '',
        }
      : undefined,
  });

  // ========================================================================
  // Ajouter compétence
  // ========================================================================
  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill) return;
    if (skills.includes(skill)) {
      toast.error('Compétence déjà ajoutée');
      return;
    }
    setSkills([...skills, skill]);
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  // ========================================================================
  // Submit
  // ========================================================================
  const onSubmit = async (data: ProfileEditFormData) => {
    const ok = await update({
      ...data,
      competences: skills,
    } as any);

    if (ok) {
      onSuccess?.();
    }
  };

  if (loading || !profile) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
      {/* Avatar */}
      <Card>
        <div className="flex items-center gap-6 flex-wrap">
          <AvatarUpload
            currentAvatar={profile.photoUrl}
            name={`${profile.prenom} ${profile.nom}`}
            onUpload={uploadAvatar}
            size="2xl"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-heading font-semibold text-lg text-odc-text-light dark:text-odc-text-dark">
              Photo de profil
            </h3>
            <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark mt-1">
              Cliquez sur votre avatar pour le modifier. Format : JPEG, PNG, WEBP (max 2 MB).
            </p>
          </div>
        </div>
      </Card>

      {/* Informations personnelles */}
      <Card>
        <FormSection
          title="Informations personnelles"
          description="Vos informations de base"
          icon={<UserIcon size={20} />}
          columns={2}
        >
          <Input
            label="Prénom"
            icon={<UserIcon size={16} />}
            error={errors.prenom?.message}
            required
            {...register('prenom')}
          />
          <Input
            label="Nom"
            icon={<UserIcon size={16} />}
            error={errors.nom?.message}
            required
            {...register('nom')}
          />
          <Input
            label="Email"
            type="email"
            icon={<Mail size={16} />}
            value={profile.email}
            disabled
            helper="L'email ne peut pas être modifié"
          />
          <Input
            label="Téléphone"
            type="tel"
            placeholder="+261 34 12 345 67"
            icon={<Phone size={16} />}
            error={errors.telephone?.message}
            {...register('telephone')}
          />
          <div className="md:col-span-2">
            <Input
              label="Ville"
              placeholder="Antananarivo"
              icon={<MapPin size={16} />}
              error={errors.ville?.message}
              {...register('ville')}
            />
          </div>
        </FormSection>
      </Card>

      {/* Informations professionnelles */}
      <Card>
        <FormSection
          title="Informations professionnelles"
          description="Utile pour le réseautage"
          icon={<Briefcase size={20} />}
          columns={2}
        >
          <Input
            label="Entreprise"
            placeholder="Orange Madagascar"
            icon={<Building size={16} />}
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
      </Card>

      {/* Bio */}
      <Card>
        <FormSection
          title="À propos"
          description="Présentez-vous en quelques mots"
          icon={<UserIcon size={20} />}
          columns={1}
        >
          <Textarea
            label="Bio"
            placeholder="Parlez-nous de vous, de votre parcours..."
            rows={4}
            maxLength={500}
            showCount
            error={errors.bio?.message}
            {...register('bio')}
          />
        </FormSection>
      </Card>

      {/* Compétences */}
      <Card>
        <FormSection
          title="Compétences"
          description="Vos domaines d'expertise"
          icon={<Award size={20} />}
          columns={1}
        >
          <div>
            <label className="block text-sm font-medium mb-2 text-odc-text-light dark:text-odc-text-dark">
              Ajouter une compétence
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: React, Python, Design..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                className="odc-input flex-1"
              />
              <Button type="button" variant="secondary" onClick={addSkill}>
                Ajouter
              </Button>
            </div>

            {/* Skills chips */}
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {skills.map((skill) => (
                  <div
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-odc-primary-soft dark:bg-odc-primary-soft/20 text-odc-primary-dark dark:text-odc-primary-light text-sm font-medium"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="p-0.5 rounded-full hover:bg-black/10 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FormSection>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 sticky bottom-4 bg-white dark:bg-odc-surface-dark p-4 rounded-xl border border-odc-border-light dark:border-odc-border-dark shadow-odc-md">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} icon={<X size={16} />}>
            Annuler
          </Button>
        )}
        <Button type="submit" variant="primary" loading={saving} icon={<Save size={16} />}>
          Enregistrer les modifications
        </Button>
      </div>
    </form>
  );
}