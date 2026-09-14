import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { BookOpen, Save, X, Clock, Target } from 'lucide-react';
import toast from 'react-hot-toast';

import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { FormSection } from '@/components/forms/FormSection';
import { FormError } from '@/components/forms/FormError';

import { FormationService } from '../services/formation.service';
import { useFormationDetail } from '../hooks/useFormationDetail';

// ✅ Valeurs runtime (schéma Zod + enum)
import { createFormationSchema, NiveauFormation } from '../types/formation.types';

// ✅ Type pur (inféré du schéma)
import type { CreateFormationFormData } from '../types/formation.types';

// ============================================================================
//  PROPS
// ============================================================================

interface FormationFormProps {
  formationId?: string;
}

// ============================================================================
//  COMPONENT
// ============================================================================

export function FormationForm({ formationId }: FormationFormProps) {
  const navigate = useNavigate();
  const { formation, loading: fetching } = useFormationDetail(formationId);

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const isEdit = !!formationId;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateFormationFormData>({
    resolver: zodResolver(createFormationSchema),
    values: formation
      ? {
          titre: formation.titre,
          description: formation.description || '',
          domaine: formation.domaine,
          dureeHeures: formation.dureeHeures,
          niveau: formation.niveau,
          prerequis: formation.prerequis || '',
          objectifs: formation.objectifs || '',
          imageUrl: formation.imageUrl || '',
        }
      : {
          titre: '',
          description: '',
          domaine: '',
          dureeHeures: 20,
          niveau: NiveauFormation.DEBUTANT,
          prerequis: '',
          objectifs: '',
          imageUrl: '',
        },
  });

  const onSubmit = async (data: CreateFormationFormData) => {
    setLoading(true);
    setGlobalError(null);

    try {
      if (isEdit && formationId) {
        await FormationService.update(formationId, data);
        toast.success('Formation mise à jour');
      } else {
        await FormationService.create(data);
        toast.success('Formation créée');
      }
      navigate('/formations');
    } catch (err: any) {
      setGlobalError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================
  //  LOADING SKELETON
  // ========================================================================

  if (fetching) {
    return (
      <Card>
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark rounded" />
          <div className="h-32 bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark rounded" />
          <div className="h-10 bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark rounded" />
        </div>
      </Card>
    );
  }

  // ========================================================================
  //  RENDER
  // ========================================================================

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 max-w-4xl mx-auto animate-fade-in"
    >
      {globalError && <FormError message={globalError} />}

      <Card>
        <FormSection
          title="Informations générales"
          description="Détails principaux de la formation"
          icon={<BookOpen size={20} />}
          columns={2}
        >
          <div className="md:col-span-2">
            <Input
              label="Titre de la formation"
              placeholder="Ex: Développement Web React"
              icon={<BookOpen size={16} />}
              error={errors.titre?.message}
              required
              {...register('titre')}
            />
          </div>

          <div className="md:col-span-2">
            <Textarea
              label="Description"
              placeholder="Décrivez la formation..."
              rows={4}
              maxLength={5000}
              showCount
              error={errors.description?.message}
              required
              {...register('description')}
            />
          </div>

          <Select
            label="Domaine"
            error={errors.domaine?.message}
            required
            placeholder="Sélectionnez un domaine"
            options={FormationService.getDomaines().map((d) => ({
              value: d.value,
              label: d.label,
            }))}
            {...register('domaine')}
          />

          <Select
            label="Niveau"
            error={errors.niveau?.message}
            required
            options={[
              { value: NiveauFormation.DEBUTANT, label: 'Débutant' },
              { value: NiveauFormation.INTERMEDIAIRE, label: 'Intermédiaire' },
              { value: NiveauFormation.AVANCE, label: 'Avancé' },
            ]}
            {...register('niveau')}
          />

          <Input
            label="Durée (heures)"
            type="number"
            icon={<Clock size={16} />}
            error={errors.dureeHeures?.message}
            required
            {...register('dureeHeures', { valueAsNumber: true })}
          />

          <Input
            label="Image URL (optionnel)"
            placeholder="https://..."
            error={errors.imageUrl?.message}
            {...register('imageUrl')}
          />
        </FormSection>
      </Card>

      <Card>
        <FormSection
          title="Contenu pédagogique"
          description="Prérequis et objectifs"
          icon={<Target size={20} />}
          columns={1}
        >
          <Textarea
            label="Prérequis"
            placeholder="Connaissances nécessaires..."
            rows={3}
            maxLength={2000}
            error={errors.prerequis?.message}
            {...register('prerequis')}
          />

          <Textarea
            label="Objectifs"
            placeholder="Ce que les participants apprendront..."
            rows={3}
            maxLength={2000}
            error={errors.objectifs?.message}
            {...register('objectifs')}
          />
        </FormSection>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 sticky bottom-4 bg-white dark:bg-odc-surface-dark p-4 rounded-xl border border-odc-border-light dark:border-odc-border-dark shadow-odc-md">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/formations')}
          icon={<X size={16} />}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          icon={<Save size={16} />}
        >
          {isEdit ? 'Enregistrer' : 'Créer la formation'}
        </Button>
      </div>
    </form>
  );
}