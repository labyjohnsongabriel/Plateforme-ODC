import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2,
  Save,
  X,
  Globe,
  Mail,
  Phone,
  MapPin,
  User,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { FormSection } from '@/components/forms/FormSection';
import { FormError } from '@/components/forms/FormError';
import { PartenaireService, Partenaire } from '../services/partenaire.service';

// ============================================================================
//  SCHÉMA ZOD
// ============================================================================

const partenaireSchema = z.object({
  nom: z.string().min(2, 'Minimum 2 caractères').max(200),
  secteur: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  contactNom: z.string().max(200).optional(),
  contactEmail: z.string().email('Email invalide').optional().or(z.literal('')),
  contactTel: z.string().max(20).optional(),
  siteWeb: z.string().url('URL invalide').optional().or(z.literal('')),
  logoUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  adresse: z.string().max(200).optional(),
  ville: z.string().max(100).optional(),
  pays: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
});

type PartenaireFormData = z.infer<typeof partenaireSchema>;

// ============================================================================
//  COMPOSANT
// ============================================================================

interface PartenaireFormProps {
  partenaireId?: string;
}

export function PartenaireForm({ partenaireId }: PartenaireFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(!!partenaireId);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [partenaire, setPartenaire] = useState<Partenaire | null>(null);

  const isEdit = !!partenaireId;

  // ========================================================================
  // Charger si édition
  // ========================================================================
  useEffect(() => {
    if (!partenaireId) return;

    const load = async () => {
      try {
        setFetching(true);
        const data = await PartenaireService.getById(partenaireId);
        setPartenaire(data);
      } catch {
        toast.error('Partenaire introuvable');
        navigate('/partenaires');
      } finally {
        setFetching(false);
      }
    };

    load();
  }, [partenaireId, navigate]);

  // ========================================================================
  // Form
  // ========================================================================
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PartenaireFormData>({
    resolver: zodResolver(partenaireSchema),
    values: partenaire
      ? {
          nom: partenaire.nom,
          secteur: partenaire.secteur || '',
          description: partenaire.description || '',
          contactNom: partenaire.contactNom || '',
          contactEmail: partenaire.contactEmail || '',
          contactTel: partenaire.contactTel || '',
          siteWeb: partenaire.siteWeb || '',
          logoUrl: partenaire.logoUrl || '',
          adresse: partenaire.adresse || '',
          ville: partenaire.ville || '',
          pays: partenaire.pays || '',
          notes: partenaire.notes || '',
        }
      : {
          nom: '',
          secteur: '',
        },
  });

  const onSubmit = async (data: PartenaireFormData) => {
    setLoading(true);
    setGlobalError(null);

    try {
      if (isEdit) {
        await PartenaireService.update(partenaireId!, data);
        toast.success('Partenaire mis à jour');
      } else {
        await PartenaireService.create(data);
        toast.success('Partenaire créé');
      }
      navigate('/partenaires');
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  // Loading
  // ========================================================================
  if (fetching) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark rounded" />
          <div className="h-32 bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark rounded" />
        </div>
      </Card>
    );
  }

  // ========================================================================
  // Render
  // ========================================================================
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
      {globalError && <FormError message={globalError} />}

      {/* Informations générales */}
      <Card>
        <FormSection
          title="Informations de l'organisation"
          description="Détails du partenaire"
          icon={<Building2 size={20} />}
          columns={2}
        >
          <div className="md:col-span-2">
            <Input
              label="Nom du partenaire"
              placeholder="Ex: Orange Madagascar"
              icon={<Building2 size={16} />}
              error={errors.nom?.message}
              required
              {...register('nom')}
            />
          </div>

          <Select
            label="Secteur d'activité"
            error={errors.secteur?.message}
            placeholder="Sélectionnez un secteur"
            options={PartenaireService.getSecteursPredefinis()}
            {...register('secteur')}
          />

          <Input
            label="Site web"
            placeholder="https://..."
            icon={<Globe size={16} />}
            error={errors.siteWeb?.message}
            {...register('siteWeb')}
          />

          <div className="md:col-span-2">
            <Input
              label="Logo URL"
              placeholder="https://.../logo.png"
              error={errors.logoUrl?.message}
              {...register('logoUrl')}
            />
          </div>

          <div className="md:col-span-2">
            <Textarea
              label="Description"
              placeholder="Décrivez le partenaire..."
              rows={4}
              maxLength={2000}
              showCount
              error={errors.description?.message}
              {...register('description')}
            />
          </div>
        </FormSection>
      </Card>

      {/* Contact */}
      <Card>
        <FormSection
          title="Contact"
          description="Personne à contacter chez le partenaire"
          icon={<User size={20} />}
          columns={2}
        >
          <div className="md:col-span-2">
            <Input
              label="Nom du contact"
              placeholder="Ex: Jean Dupont"
              icon={<User size={16} />}
              error={errors.contactNom?.message}
              {...register('contactNom')}
            />
          </div>

          <Input
            label="Email"
            type="email"
            placeholder="contact@partenaire.com"
            icon={<Mail size={16} />}
            error={errors.contactEmail?.message}
            {...register('contactEmail')}
          />

          <Input
            label="Téléphone"
            type="tel"
            placeholder="+261 34 12 345 67"
            icon={<Phone size={16} />}
            error={errors.contactTel?.message}
            {...register('contactTel')}
          />
        </FormSection>
      </Card>

      {/* Adresse */}
      <Card>
        <FormSection
          title="Adresse"
          description="Localisation du partenaire"
          icon={<MapPin size={20} />}
          columns={3}
        >
          <div className="md:col-span-3">
            <Input
              label="Adresse"
              placeholder="123 Rue de l'Exemple"
              icon={<MapPin size={16} />}
              error={errors.adresse?.message}
              {...register('adresse')}
            />
          </div>

          <Input
            label="Ville"
            placeholder="Antananarivo"
            error={errors.ville?.message}
            {...register('ville')}
          />

          <Input
            label="Pays"
            placeholder="Madagascar"
            error={errors.pays?.message}
            {...register('pays')}
          />
        </FormSection>
      </Card>

      {/* Notes internes */}
      <Card>
        <FormSection
          title="Notes internes"
          description="Visible uniquement par l'équipe ODC"
          icon={<FileText size={20} />}
          columns={1}
        >
          <Textarea
            label="Notes"
            placeholder="Notes complémentaires..."
            rows={3}
            maxLength={2000}
            error={errors.notes?.message}
            {...register('notes')}
          />
        </FormSection>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 sticky bottom-4 bg-white dark:bg-odc-surface-dark p-4 rounded-xl border border-odc-border-light dark:border-odc-border-dark shadow-odc-md">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/partenaires')}
          icon={<X size={16} />}
        >
          Annuler
        </Button>
        <Button type="submit" variant="primary" loading={loading} icon={<Save size={16} />}>
          {isEdit ? 'Enregistrer' : 'Créer le partenaire'}
        </Button>
      </div>
    </form>
  );
}