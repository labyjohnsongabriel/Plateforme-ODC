'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

export function VisibilityToggle() {
  const qc = useQueryClient();
  const [isPublic, setIsPublic] = useState(false);

  const { data: me } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data.data;
    },
  });

  useEffect(() => {
    if (me) setIsPublic(me.profilPublic ?? false);
  }, [me]);

  const mutation = useMutation({
    mutationFn: async (value: boolean) => {
      await api.put('/participant/profil/visibilite', { profilPublic: value });
    },
    onSuccess: (_, value) => {
      toast.success(value ? 'Profil rendu public' : 'Profil rendu privé');
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (e) => {
      setIsPublic(!isPublic);
      toast.error(getErrorMessage(e));
    },
  });

  const toggle = (value: boolean) => {
    setIsPublic(value);
    mutation.mutate(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          {isPublic ? (
            <Eye className="h-5 w-5 text-odc-success" />
          ) : (
            <EyeOff className="h-5 w-5 text-odc-muted" />
          )}
          Visibilité du profil
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isPublic ? 'Profil public' : 'Profil privé'}
            </p>
            <p className="text-xs text-odc-muted">
              {isPublic
                ? 'Votre profil apparaît dans l\'annuaire'
                : 'Votre profil est masqué aux autres membres'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin text-odc-muted" />}
            <Switch checked={isPublic} onCheckedChange={toggle} disabled={mutation.isPending} />
          </div>
        </div>

        <div className="pt-3 border-t border-odc-border">
          <Badge variant={isPublic ? 'default' : 'outline'} className="text-xs">
            {isPublic ? '👁️ Visible' : '🙈 Masqué'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}