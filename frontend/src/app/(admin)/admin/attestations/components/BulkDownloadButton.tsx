// src/app/(admin)/admin/attestations/components/BulkDownloadButton.tsx
'use client';

import * as React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

interface BulkDownloadButtonProps {
  /** IDs des attestations à télécharger */
  ids: string[];
  /** Nom du fichier ZIP */
  fileName?: string;
  /** Label du bouton */
  label?: string;
  /** Variante visuelle */
  variant?: 'outline' | 'odc' | 'ghost';
}

export function BulkDownloadButton({
  ids,
  fileName = 'attestations',
  label = 'Télécharger ZIP',
  variant = 'outline',
}: BulkDownloadButtonProps) {
  const [isPending, setIsPending] = React.useState(false);

  const handleDownload = async () => {
    if (ids.length === 0) {
      toast.error('Aucune attestation sélectionnée');
      return;
    }

    setIsPending(true);
    try {
      const response = await api.post(
        '/admin/attestations/bulk-download',
        { ids },
        { responseType: 'blob' },
      );

      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`${ids.length} attestation(s) téléchargée(s)`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      variant={variant}
      size="sm"
      onClick={handleDownload}
      disabled={isPending || ids.length === 0}
      loading={isPending}
      loadingText="Préparation…"
      leftIcon={<Download className="h-3.5 w-3.5" />}
    >
      {label} ({ids.length})
    </Button>
  );
}