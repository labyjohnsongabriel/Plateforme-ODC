'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Loader2, Save, KeyRound, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';

export function PasswordSettings() {
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    ancienMotDePasse: '',
    nouveauMotDePasse: '',
    confirmation: '',
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (form.nouveauMotDePasse !== form.confirmation) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      if (form.nouveauMotDePasse.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères');
      }
      await api.post('/auth/change-password', {
        ancienMotDePasse: form.ancienMotDePasse,
        nouveauMotDePasse: form.nouveauMotDePasse,
      });
    },
    onSuccess: () => {
      toast.success('Mot de passe modifié');
      setForm({
        ancienMotDePasse: '',
        nouveauMotDePasse: '',
        confirmation: '',
      });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : getErrorMessage(e)),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-odc-primary" />
          Changer le mot de passe
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="space-y-4 max-w-md"
        >
          <div>
            <Label htmlFor="ancienMotDePasse">Ancien mot de passe</Label>
            <div className="relative mt-1.5">
              <Input
                id="ancienMotDePasse"
                type={showOld ? 'text' : 'password'}
                value={form.ancienMotDePasse}
                onChange={(e) =>
                  setForm({ ...form, ancienMotDePasse: e.target.value })
                }
                autoComplete="current-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOld((v) => !v)}
                tabIndex={-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-odc-muted hover:text-odc-primary"
                aria-label={showOld ? 'Masquer' : 'Afficher'}
              >
                {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="nouveauMotDePasse">Nouveau mot de passe</Label>
            <div className="relative mt-1.5">
              <Input
                id="nouveauMotDePasse"
                type={showNew ? 'text' : 'password'}
                value={form.nouveauMotDePasse}
                onChange={(e) =>
                  setForm({ ...form, nouveauMotDePasse: e.target.value })
                }
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNew((v) => !v)}
                tabIndex={-1}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md flex items-center justify-center text-odc-muted hover:text-odc-primary"
                aria-label={showNew ? 'Masquer' : 'Afficher'}
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmation">Confirmer le mot de passe</Label>
            <Input
              id="confirmation"
              type="password"
              value={form.confirmation}
              onChange={(e) => setForm({ ...form, confirmation: e.target.value })}
              autoComplete="new-password"
              className="mt-1.5"
            />
          </div>

          <Button
            variant="odc"
            type="submit"
            disabled={
              !form.ancienMotDePasse ||
              !form.nouveauMotDePasse ||
              !form.confirmation ||
              mutation.isPending
            }
          >
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            <Save className="h-4 w-4 mr-2" />
            Modifier le mot de passe
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}