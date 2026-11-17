// src/app/(staff)/staff/formations/components/FormationFormModal.tsx
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { FormationForm, type FormationFormValues } from './FormationForm';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formationId?: string | null; // undefined → create, string → edit
}

interface Domaine {
  id: string;
  nom: string;
}

function extractDomaines(data: unknown): Domaine[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as Domaine[];
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    for (const key of ['domaines', 'data', 'items']) {
      if (Array.isArray(obj[key])) return obj[key] as Domaine[];
    }
  }
  return [];
}

export function FormationFormModal({ open, onOpenChange, formationId }: Props) {
  const qc = useQueryClient();
  const isEdit = Boolean(formationId);

  /* ─── Chargement des domaines ─── */
  const { data: domaines = [], isLoading: domainesLoading } = useQuery<Domaine[]>({
    queryKey: ['staff', 'domaines', 'all'],
    queryFn: async () => {
      const { data } = await api.get('/staff/domaines');
      const root = data?.data ?? data;
      return extractDomaines(root);
    },
    enabled: open,
    staleTime: 5 * 60_000,
  });

  /* ─── Chargement de la formation (edit) ─── */
  const { data: formation, isLoading: formationLoading } = useQuery({
    queryKey: ['staff', 'formations', formationId],
    queryFn: async () => {
      const { data } = await api.get(`/staff/formations/${formationId}`);
      return data?.data ?? data;
    },
    enabled: open && isEdit,
  });

  /* ─── Mutation create/edit ─── */
  const mutation = useMutation({
    mutationFn: async (values: FormationFormValues) => {
      const payload = {
        ...values,
        resume: values.resume || null,
        description: values.description || null,
        imageUrl: values.imageUrl || null,
      };

      if (isEdit && formationId) {
        const { data } = await api.put(`/staff/formations/${formationId}`, payload);
        return data?.data ?? data;
      } else {
        const { data } = await api.post('/staff/formations', payload);
        return data?.data ?? data;
      }
    },
    onSuccess: () => {
      toast.success(isEdit ? 'Formation modifiée' : 'Formation créée');
      qc.invalidateQueries({ queryKey: ['staff', 'formations'] });
      onOpenChange(false);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  /* ─── Valeurs par défaut pour le formulaire ─── */
  const defaultValues: Partial<FormationFormValues> | undefined =
    isEdit && formation
      ? {
          titre: formation.titre ?? '',
          slug: formation.slug ?? '',
          resume: formation.resume ?? '',
          description: formation.description ?? '',
          domaineId:
            formation.domaineId ??
            formation.domaineRelation?.id ??
            (typeof formation.domaine === 'object' ? formation.domaine?.id : '') ??
            '',
          niveau: formation.niveau ?? 'DEBUTANT',
          dureeHeures: Number(formation.dureeHeures ?? 1),
          imageUrl: formation.imageUrl ?? '',
          estPubliee: formation.estPubliee === true,
        }
      : undefined;

  const loading = domainesLoading || (isEdit && formationLoading);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Modifier la formation' : 'Créer une nouvelle formation'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Modifiez les informations de la formation. Les champs marqués * sont obligatoires.'
              : 'Remplissez les informations pour ajouter une formation au catalogue.'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-24 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ) : (
          <FormationForm
            mode={isEdit ? 'edit' : 'create'}
            domaines={domaines}
            defaultValues={defaultValues}
            onSubmit={(values) => mutation.mutate(values)}
            onCancel={() => onOpenChange(false)}
            isPending={mutation.isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}