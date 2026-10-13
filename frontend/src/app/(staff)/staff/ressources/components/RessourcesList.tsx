'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  FileText, Video, Image as ImageIcon, Link2, FolderOpen, FileSpreadsheet,
  Download, Trash2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { api } from '@/lib/api';
import { formatBytes, formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';

const TYPE_ICONS: Record<string, any> = {
  PDF: FileText,
  VIDEO: Video,
  IMAGE: ImageIcon,
  LIEN: Link2,
  DOCUMENT: FileSpreadsheet,
  PRESENTATION: FileSpreadsheet,
};

export function RessourcesList() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['staff', 'ressources'],
    queryFn: async () => {
      const { data } = await api.get('/staff/ressources', { params: { limit: 100 } });
      return data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/staff/ressources/${id}`);
    },
    onSuccess: () => {
      toast.success('Ressource supprimée');
      qc.invalidateQueries({ queryKey: ['staff', 'ressources'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
      </div>
    );
  }

  const ressources = data ?? [];

  if (!ressources.length) {
    return <Card><EmptyState icon={FolderOpen} title="Aucune ressource" /></Card>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ressources.map((r: any) => {
        const Icon = TYPE_ICONS[r.type] ?? FileText;
        return (
          <Card key={r.id} className="hover:shadow-odc-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-lg bg-odc-primary-soft flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-odc-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm line-clamp-2">{r.titre}</p>
                  <Badge variant="outline" className="text-xs mt-1">{r.type}</Badge>
                </div>
              </div>

              {r.description && (
                <p className="text-xs text-odc-muted line-clamp-2 mb-3">
                  {r.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-odc-muted mb-3">
                <span>{formatDate(r.createdAt)}</span>
                {r.fichierTaille && <span>{formatBytes(r.fichierTaille)}</span>}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a href={r.fichierUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Ouvrir
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-odc-error hover:bg-odc-error-bg hover:text-odc-error"
                  onClick={() => {
                    if (confirm('Supprimer cette ressource ?')) deleteMutation.mutate(r.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}