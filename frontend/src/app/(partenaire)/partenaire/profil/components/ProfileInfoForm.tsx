// src/app/admin/profil/components/ProfileInfoForm.tsx
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Check,
  Loader2,
  Mail,
  MapPin,
  Phone,
  User as UserIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ProfileSection } from './ProfileSection';
import { useAuthContext } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

const schema = z.object({
  prenom: z.string().trim().min(2, 'Minimum 2 caractères').max(50),
  nom: z.string().trim().min(2, 'Minimum 2 caractères').max(50),
  telephone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s().-]{6,20}$/, 'Numéro invalide')
    .optional()
    .or(z.literal('')),
  ville: z.string().max(100).optional(),
});

type FormData = z.infer<typeof schema>;

const LABEL = 'flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300';
const ICON = 'h-3.5 w-3.5 text-slate-400 dark:text-slate-500';

export function ProfileInfoForm() {
  const { user, refetchUser } = useAuthContext();
  const qc = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      prenom: user?.prenom ?? '',
      nom: user?.nom ?? '',
      telephone: (user as any)?.telephone ?? '',
      ville: (user as any)?.ville ?? '',
    },
  });

  React.useEffect(() => {
    if (user) {
      reset({
        prenom: user.prenom ?? '',
        nom: user.nom ?? '',
        telephone: (user as any)?.telephone ?? '',
        ville: (user as any)?.ville ?? '',
      });
    }
  }, [user, reset]);

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const payload = {
        ...data,
        telephone: data.telephone || undefined,
      };
      const { data: res } = await api.put('/users/me', payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Profil mis à jour');
      qc.invalidateQueries({ queryKey: ['auth', 'me'] });
      refetchUser().catch(() => {});
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  return (
    <form
      onSubmit={handleSubmit((d) => mutation.mutate(d))}
      className="space-y-6"
      noValidate
    >
      <ProfileSection
        title="Informations personnelles"
        description="Ces informations apparaissent sur votre profil."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="prenom" className={LABEL}>
              <UserIcon className={ICON} aria-hidden /> Prénom *
            </Label>
            <Input
              id="prenom"
              {...register('prenom')}
              className="mt-1.5"
              aria-invalid={!!errors.prenom}
            />
            {errors.prenom && (
              <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
                {errors.prenom.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="nom" className={LABEL}>
              <UserIcon className={ICON} aria-hidden /> Nom *
            </Label>
            <Input
              id="nom"
              {...register('nom')}
              className="mt-1.5"
              aria-invalid={!!errors.nom}
            />
            {errors.nom && (
              <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
                {errors.nom.message}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <Label htmlFor="email" className={LABEL}>
              <Mail className={ICON} aria-hidden /> Email
            </Label>
            <Input
              id="email"
              type="email"
              value={user?.email ?? ''}
              disabled
              className="mt-1.5"
            />
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              L&apos;email ne peut pas être modifié.
            </p>
          </div>

          <div>
            <Label htmlFor="telephone" className={LABEL}>
              <Phone className={ICON} aria-hidden /> Téléphone
            </Label>
            <Input
              id="telephone"
              type="tel"
              {...register('telephone')}
              className="mt-1.5"
              aria-invalid={!!errors.telephone}
            />
            {errors.telephone && (
              <p className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
                {errors.telephone.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="ville" className={LABEL}>
              <MapPin className={ICON} aria-hidden /> Ville
            </Label>
            <Input
              id="ville"
              {...register('ville')}
              className="mt-1.5"
              placeholder="Antananarivo"
            />
          </div>
        </div>
      </ProfileSection>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className={cn(
            'h-9 rounded-lg px-4 font-medium',
            'bg-slate-900 text-white hover:bg-slate-800',
            'dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />Enregistrement…</>
          ) : (
            <><Check className="mr-2 h-4 w-4" aria-hidden />Enregistrer</>
          )}
        </Button>
      </div>
    </form>
  );
}