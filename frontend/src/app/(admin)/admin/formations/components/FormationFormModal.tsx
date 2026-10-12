// src/app/(admin)/admin/formations/components/FormationFormModal.tsx
'use client';

import { BookOpen, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FormationForm } from './FormationForm';

/* ============================================================================
   TYPES
   ============================================================================ */

interface FormationFormModalProps {
  /** Contrôle l'ouverture de la modale */
  open: boolean;
  /** Callback de changement d'état d'ouverture */
  onOpenChange: (open: boolean) => void;
  /** Mode du formulaire : création ou édition */
  mode: 'create' | 'edit';
  /** Identifiant de la formation (requis en mode édition) */
  id?: string;
  /** Callback exécuté après un succès */
  onSuccess?: () => void;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function FormationFormModal({
  open,
  onOpenChange,
  mode,
  id,
  onSuccess,
}: FormationFormModalProps) {
  /* -------------------- Dérivés -------------------- */
  const isEdit = mode === 'edit';

  /* -------------------- Handlers -------------------- */
  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  /* -------------------- Rendu -------------------- */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden p-0
        "
      >
        {/* ================================================================
            EN-TÊTE
            ================================================================ */}
        <DialogHeader className="shrink-0 border-b border-odc-border bg-odc-surface px-6 py-5">
          <div className="flex items-start gap-4">
            {/* Icône contextuelle */}
            <div
              className={`
                flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-odc-md
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
                <BookOpen className="h-6 w-6 text-white" />
              )}
            </div>

            {/* Titre & description */}
            <div className="min-w-0">
              <DialogTitle className="font-display text-xl font-bold">
                {isEdit ? 'Modifier la formation' : 'Nouvelle formation'}
              </DialogTitle>
              <DialogDescription className="mt-0.5">
                {isEdit
                  ? 'Mettez à jour les informations de la formation.'
                  : 'Créez une nouvelle formation pour le catalogue ODC.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ================================================================
            CONTENU SCROLLABLE
            ================================================================ */}
        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">
          <FormationForm
            mode={mode}
            id={id}
            onSuccess={handleSuccess}
            onCancel={handleClose}
            showActions={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}