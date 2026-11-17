// src/app/admin/profil/components/ProfileIdentityCard.tsx
'use client';

import * as React from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserAvatar } from '@/components/shared/UserAvatar';
import { useAuthContext } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

export function ProfileIdentityCard() {
  const { user, refetchUser } = useAuthContext();
  const qc = useQueryClient();
  const inputRef = React.useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('photo', file);
      const { data } = await api.post<{ data: { photoUrl: string } }>(
        '/users/me/avatar',
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } },
      );
      return data.data;
    },
    onSuccess: () => {
      toast.success('Photo mise à jour');
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      refetchUser().catch(() => {});
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Le fichier doit être une image');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop lourde (max 5 Mo)');
      return;
    }
    uploadMutation.mutate(file);
    e.target.value = '';
  };

  if (!user) return null;

  return (
    <div className="relative shrink-0">
      <UserAvatar user={user} size="xl" />

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploadMutation.isPending}
        className={cn(
          'absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full',
          'border border-slate-200 bg-white text-slate-600 shadow-sm',
          'transition-colors hover:bg-slate-50 hover:text-slate-900',
          'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
          uploadMutation.isPending && 'opacity-60',
        )}
        aria-label="Changer la photo de profil"
      >
        {uploadMutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        ) : (
          <Camera className="h-4 w-4" aria-hidden />
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}