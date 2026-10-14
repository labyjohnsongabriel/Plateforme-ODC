// src/app/(admin)/admin/partenaires/components/PartnerFormModal.tsx
'use client';

import * as React from 'react';
import { Building2, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PartnerForm } from './PartnerForm';
import {
  useCreatePartenaire,
  usePartenaire,
  useUpdatePartenaire,
  type PartenaireFormValues,
} from '@/hooks/usePartenaires';

interface PartnerFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  id?: string;
  onSuccess?: () => void;
}

export function PartnerFormModal({
  open,
  onOpenChange,
  mode,
  id,
  onSuccess,
}: PartnerFormModalProps) {
  const isEdit = mode === 'edit';

  const { data: existing, isLoading } = usePartenaire(isEdit ? id : undefined);
  const createMutation = useCreatePartenaire();
  const updateMutation = useUpdatePartenaire(id ?? '');

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (values: PartenaireFormValues) => {
    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync(values);
      } else {
        await createMutation.mutateAsync(values);
      }
      onOpenChange(false);
      onSuccess?.();
    } catch {
      /* Erreur déjà gérée */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b border-odc-border bg-odc-surface px-6 py-5">
          <div className="flex items-start gap-4">
            <div
              className={`
                flex h-12 w-12 shrink-0 items-center justify-center rounded-xl
                shadow-odc-md
                ${
                  isEdit
                    ? 'bg-gradient-to-br from-blue-500 to-blue-700'
                    : 'bg-gradient-to-br from-odc-500 to-odc-700'
                }
              `}
              aria-hidden="true"
            >
              {isEdit ? (
                <Pencil className="h-6 w-6 text-white" />
              ) : (
                <Building2 className="h-6 w-6 text-white" />
              )}
            </div>

            <div className="min-w-0">
              <DialogTitle className="font-display text-xl font-bold">
                {isEdit ? 'Modifier le partenaire' : 'Nouveau partenaire'}
              </DialogTitle>
              <DialogDescription className="mt-0.5">
                {isEdit
                  ? 'Mettez à jour les informations du partenaire.'
                  : 'Ajoutez un nouveau partenaire à l\'écosystème ODC.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">
          {isEdit && isLoading ? (
            <PartnerFormSkeleton />
          ) : (
            <PartnerForm
              mode={mode}
              id={id}
              defaultValues={existing}
              onSubmit={handleSubmit}
              onCancel={() => onOpenChange(false)}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PartnerFormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-4 w-40 rounded bg-odc-surface-alt" />
      <div className="space-y-4">
        <div className="h-24 w-24 rounded-lg bg-odc-surface-alt" />
        <div className="h-10 rounded-md bg-odc-surface-alt" />
        <div className="h-10 rounded-md bg-odc-surface-alt" />
        <div className="h-24 rounded-md bg-odc-surface-alt" />
      </div>
    </div>
  );
}