'use client';

import * as React from 'react';
import { FolderTree, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DomaineForm } from './DomaineForm';
import {
  useCreateDomaine,
  useDomaine,
  useUpdateDomaine,
} from '@/hooks/useDomaines';

/* ============================================================================
   TYPES
   ============================================================================ */

interface DomaineFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  id?: string;
  onSuccess?: () => void;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function DomaineFormModal({
  open,
  onOpenChange,
  mode,
  id,
  onSuccess,
}: DomaineFormModalProps) {
  const isEdit = mode === 'edit';

  const { data: existing, isLoading } = useDomaine(isEdit ? id : undefined);
  const createMutation = useCreateDomaine();
  const updateMutation = useUpdateDomaine(id ?? '');

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (values: Parameters<typeof createMutation.mutate>[0]) => {
    if (isEdit && id) {
      await updateMutation.mutateAsync(values);
    } else {
      await createMutation.mutateAsync(values);
    }
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        {/* ================================================================
            EN-TÊTE
            ================================================================ */}
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
                <FolderTree className="h-6 w-6 text-white" />
              )}
            </div>

            <div className="min-w-0">
              <DialogTitle className="font-display text-xl font-bold">
                {isEdit ? 'Modifier le domaine' : 'Nouveau domaine'}
              </DialogTitle>
              <DialogDescription className="mt-0.5">
                {isEdit
                  ? 'Mettez à jour les informations du domaine de formation.'
                  : 'Créez un nouveau domaine pour organiser votre catalogue ODC.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ================================================================
            CONTENU
            ================================================================ */}
        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">
          {isEdit && isLoading ? (
            <DomaineFormSkeleton />
          ) : (
            <DomaineForm
              mode={mode}
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

/* ============================================================================
   SQUELETTE
   ============================================================================ */

function DomaineFormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-4 w-40 rounded bg-odc-surface-alt" />
      <div className="space-y-2">
        <div className="h-4 w-32 rounded bg-odc-surface-alt" />
        <div className="h-10 rounded-md bg-odc-surface-alt" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-24 rounded bg-odc-surface-alt" />
        <div className="h-10 rounded-md bg-odc-surface-alt" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-28 rounded bg-odc-surface-alt" />
        <div className="h-24 rounded-md bg-odc-surface-alt" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-20 rounded bg-odc-surface-alt" />
            <div className="h-10 rounded-md bg-odc-surface-alt" />
          </div>
        ))}
      </div>
    </div>
  );
}