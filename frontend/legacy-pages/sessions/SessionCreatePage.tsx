import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save, Calendar, MapPin, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFetch } from '@/hooks/useFetch';
import { formationApi } from '@/services/formation.api';
import { sessionApi } from '@/services/session.api';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { DatePicker } from '@/components/common/DatePicker';
import { FormSection } from '@/components/forms/FormSection';
import { FormError } from '@/components/forms/FormError';

const schema = z.object({
  formationId: z.string().uuid('Formation requise'),
  dateDebut: z.string().min(1, 'Requis'),
  dateFin: z.string().min(1, 'Requis'),
  lieu: z.string().max(200).optional(),
  capacite: z.number().int().positive().max(500),
});

type FormData = z.infer<typeof schema>;

export default function SessionCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: formationsData } = useFetch(() => formationApi.list({ limit: 100 }), []);
  const formations = formationsData?.data || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      capacite: 30,
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      await sessionApi.create(data);
      toast.success('Session créée avec succès');
      navigate('/sessions');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)}>
          Retour
        </Button>
        <h1 className="font-heading text-2xl font-bold text-odc-text-light dark:text-odc-text-dark">
          Nouvelle session
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && <FormError message={error} />}

        <Card>
          <FormSection
            title="Informations de la session"
            icon={<Calendar size={20} />}
            columns={2}
          >
            <div className="md:col-span-2">
              <Select
                label="Formation"
                error={errors.formationId?.message}
                required
                options={formations.map((f: any) => ({ value: f.id, label: f.titre }))}
                placeholder="Sélectionnez une formation"
                {...register('formationId')}
              />
            </div>

            <DatePicker label="Date de début" error={errors.dateDebut?.message} required {...register('dateDebut')} />
            <DatePicker label="Date de fin" error={errors.dateFin?.message} required {...register('dateFin')} />

            <Input
              label="Lieu"
              placeholder="Salle A1 - ODC Antananarivo"
              icon={<MapPin size={16} />}
              error={errors.lieu?.message}
              {...register('lieu')}
            />

            <Input
              label="Capacité"
              type="number"
              icon={<Users size={16} />}
              error={errors.capacite?.message}
              required
              {...register('capacite', { valueAsNumber: true })}
            />
          </FormSection>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" loading={loading} icon={<Save size={16} />}>
            Créer la session
          </Button>
        </div>
      </form>
    </div>
  );
}