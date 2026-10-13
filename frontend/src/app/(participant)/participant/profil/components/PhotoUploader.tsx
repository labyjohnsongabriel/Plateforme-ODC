'use client';

import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Camera, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

interface Props {
  currentPhotoUrl?: string | null;
}

export function PhotoUploader({ currentPhotoUrl }: Props) {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('photo', file);
      const { data } = await api.post('/participant/profil/photo', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data;
    },
    onSuccess: () => {
      toast.success('Photo mise à jour');
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) mutation.mutate(file);
  };

  return (
    <div className="relative inline-block">
      <Avatar className="h-24 w-24 mx-auto">
        <AvatarImage src={currentPhotoUrl ?? undefined} />
        <AvatarFallback className="bg-odc-primary-soft text-odc-primary text-2xl font-display font-bold">
          👤
        </AvatarFallback>
      </Avatar>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleChange}
      />

      <button
        onClick={() => fileRef.current?.click()}
        disabled={mutation.isPending}
        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-odc-primary text-white flex items-center justify-center shadow-odc-md hover:bg-odc-primary-dark transition-colors"
        aria-label="Changer la photo"
      >
        {mutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Camera className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}