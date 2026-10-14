// src/app/(admin)/admin/utilisateurs/components/UserFormModal.tsx
'use client';

import { UserPlus, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UserForm } from './UserForm';
import { useUser } from '@/hooks/useUsers';

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  userId?: string;
  onSuccess?: () => void;
}

export function UserFormModal({
  open,
  onOpenChange,
  mode,
  userId,
  onSuccess,
}: UserFormModalProps) {
  const isEdit = mode === 'edit';
  const { data: user, isLoading } = useUser(isEdit ? userId : undefined);

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const handleCancel = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-4xl flex-col gap-0 overflow-hidden p-0">
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
                <UserPlus className="h-6 w-6 text-white" />
              )}
            </div>

            <div className="min-w-0">
              <DialogTitle className="font-display text-xl font-bold">
                {isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </DialogTitle>
              <DialogDescription className="mt-0.5">
                {isEdit
                  ? 'Mettez à jour les informations du compte utilisateur.'
                  : 'Créez un nouveau compte utilisateur ODC.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">
          {isEdit && isLoading ? (
            <UserFormSkeleton />
          ) : (
            <UserForm
              mode={mode}
              userId={userId}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UserFormSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-4 w-40 rounded bg-odc-surface-alt" />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="h-10 rounded-md bg-odc-surface-alt" />
          <div className="h-10 rounded-md bg-odc-surface-alt" />
        </div>
        <div className="h-10 rounded-md bg-odc-surface-alt" />
        <div className="h-24 rounded-md bg-odc-surface-alt" />
      </div>
    </div>
  );
}