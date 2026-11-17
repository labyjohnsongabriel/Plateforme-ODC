// src/app/admin/profil/components/ProfileSecurityForm.tsx
'use client';

import * as React from 'react';
import { Check, Loader2, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ProfileSection } from './ProfileSection';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

const LABEL = 'flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300';
const ICON = 'h-3.5 w-3.5 text-slate-400 dark:text-slate-500';

export function ProfileSecurityForm() {
  const [form, setForm] = React.useState({
    ancienMotDePasse: '',
    nouveauMotDePasse: '',
    confirmation: '',
  });
  const [saving, setSaving] = React.useState(false);

  const onChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.nouveauMotDePasse.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!/[A-Z]/.test(form.nouveauMotDePasse)) {
      toast.error('Il doit contenir une majuscule.');
      return;
    }
    if (!/[0-9]/.test(form.nouveauMotDePasse)) {
      toast.error('Il doit contenir un chiffre.');
      return;
    }
    if (form.nouveauMotDePasse !== form.confirmation) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    setSaving(true);
    try {
      await api.put('/users/me/password', {
        ancienMotDePasse: form.ancienMotDePasse,
        nouveauMotDePasse: form.nouveauMotDePasse,
      });
      toast.success('Mot de passe mis à jour');
      setForm({ ancienMotDePasse: '', nouveauMotDePasse: '', confirmation: '' });
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      <ProfileSection
        title="Changer le mot de passe"
        description="Utilisez un mot de passe fort et unique. Minimum 8 caractères, 1 majuscule, 1 chiffre."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="ancien" className={LABEL}>
              <Lock className={ICON} aria-hidden /> Mot de passe actuel
            </Label>
            <Input
              id="ancien"
              type="password"
              value={form.ancienMotDePasse}
              onChange={onChange('ancienMotDePasse')}
              className="mt-1.5"
              required
            />
          </div>
          <div>
            <Label htmlFor="nouveau" className={LABEL}>
              <Lock className={ICON} aria-hidden /> Nouveau mot de passe
            </Label>
            <Input
              id="nouveau"
              type="password"
              value={form.nouveauMotDePasse}
              onChange={onChange('nouveauMotDePasse')}
              className="mt-1.5"
              required
            />
          </div>
          <div>
            <Label htmlFor="confirmation" className={LABEL}>
              <Lock className={ICON} aria-hidden /> Confirmer
            </Label>
            <Input
              id="confirmation"
              type="password"
              value={form.confirmation}
              onChange={onChange('confirmation')}
              className="mt-1.5"
              required
            />
          </div>
        </div>
      </ProfileSection>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={saving}
          className={cn(
            'h-9 rounded-lg px-4 font-medium',
            'bg-slate-900 text-white hover:bg-slate-800',
            'dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2 dark:focus-visible:ring-slate-600',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {saving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />Mise à jour…</>
          ) : (
            <><Check className="mr-2 h-4 w-4" aria-hidden />Mettre à jour</>
          )}
        </Button>
      </div>
    </form>
  );
}