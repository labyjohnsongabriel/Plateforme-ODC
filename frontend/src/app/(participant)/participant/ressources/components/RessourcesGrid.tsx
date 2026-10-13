'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  FileText, Video, Image as ImageIcon, Link2, FolderOpen,
  FileSpreadsheet, Download, ExternalLink, Calendar,
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

export function RessourcesGrid() {
  const { data, isLoading } = useQuery({
    queryKey: ['participant', 'ressources'],
    queryFn: async () => {
      const { data } = await api.get('/participant/ressources');
      return data.data;
    },
  });

  const telechargerMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/participant/ressources/${id}/telecharger`);
      const ressource = data?.find((r: any) => r.id === id);
      return ressource;
    },
    onSuccess: (ressource) => {
      if (ressource?.fichierUrl) {
        window.open(ressource.fichierUrl, '_blank');
      }
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
      </div>
    );
  }

  const ressources = data ?? [];

  if (!ressources.length) {
    return (
      <Card>
        <EmptyState
          icon={FolderOpen}
          title="Aucune ressource"
          description="Les ressources de vos sessions apparaîtront ici."
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {ressources.map((r: any) => {
        const Icon = TYPE_ICONS[r.type] ?? FileText;
        return (
          <Card key={r.id} className="hover:shadow-odc-md transition-shadow overflow-hidden group">
            <div className="h-1.5 bg-gradient-to-r from-odc-500 to-odc-700" />

            <CardContent className="p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-11 h-11 rounded-lg bg-odc-primary-soft flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-odc-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm line-clamp-2 group-hover:text-odc-primary transition-colors">
                    {r.titre}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Badge variant="outline" className="text-xs">
                      {r.type}
                    </Badge>
                    <span className="text-[10px] text-odc-muted">
                      {r.session?.formation?.titre}
                    </span>
                  </div>
                </div>
              </div>

              {r.description && (
                <p className="text-xs text-odc-muted line-clamp-2 mb-3">
                  {r.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-odc-muted mb-3">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {formatDate(r.createdAt)}
                </span>
                {r.fichierTaille && <span>{formatBytes(r.fichierTaille)}</span>}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="odc"
                  size="sm"
                  className="flex-1"
                  onClick={() => telechargerMutation.mutate(r.id)}
                  disabled={telechargerMutation.isPending}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Ouvrir
                </Button>
                {r.type === 'LIEN' && (
                  <Button variant="outline" size="icon" asChild>
                    <a
                      href={r.fichierUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Ouvrir dans un nouvel onglet"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}