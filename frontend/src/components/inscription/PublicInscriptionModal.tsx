'use client';

import { BookOpen } from 'lucide-react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { PublicInscriptionForm } from './PublicInscriptionForm';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultSessionId?: string;
}

export function PublicInscriptionModal({ open, onOpenChange, defaultSessionId }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 gap-0">
        {/* Header */}
        <DialogHeader className="border-b border-odc-border bg-odc-surface-alt/40 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-odc-500 to-odc-700 shadow-odc-md">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="font-display text-lg font-bold">
                Inscription en ligne
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm">
                Remplissez le formulaire pour vous inscrire à une session ODC.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Contenu */}
        <div className="px-6 py-5">
          <PublicInscriptionForm
            compact
            defaultSessionId={defaultSessionId}
            onClose={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}