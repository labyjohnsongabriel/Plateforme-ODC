'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2, Send, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import api from '@/lib/api'; // ⭐ ton instance axios existante

/* ═══════════════════════════════════════════════════════════════════════════
   SCHÉMA
   ═══════════════════════════════════════════════════════════════════════════ */

const schema = z.object({
  nom: z.string().trim().min(2, 'Nom requis').max(100),
  email: z.string().trim().email('Email invalide').max(200),
  sujet: z.enum(['information', 'partenariat', 'support', 'autre']),
  message: z.string().trim().min(10, 'Message trop court (10 caractères min)').max(2000),
  // ⭐ Honeypot : ce champ doit rester vide (anti-bot)
  website: z.string().max(0).optional(),
});

type FormData = z.infer<typeof schema>;

const SUJETS = [
  { value: 'information', label: "Demande d'information" },
  { value: 'partenariat', label: 'Partenariat' },
  { value: 'support', label: 'Support technique' },
  { value: 'autre', label: 'Autre' },
] as const;

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function ContactForm() {
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      nom: '',
      email: '',
      message: '',
      website: '',
    },
  });

  /* ═══════════════════════════════════════════════════════════════════════
     SOUMISSION — appelle vraiment le backend
     ═══════════════════════════════════════════════════════════════════════ */
  const onSubmit = async (data: FormData) => {
    try {
      // ⭐ Honeypot : si rempli, c'est un bot → on ignore silencieusement
      if (data.website && data.website.length > 0) {
        console.warn('[contact] Honeypot déclenché — bot ignoré');
        setSuccess(true); // Faux succès pour ne pas alerter le bot
        reset();
        return;
      }

      const { website, ...payload } = data;

      const response = await api.post('/public/contact', payload, {
        timeout: 15_000,
      });

      if (response.data?.success === false) {
        throw new Error(response.data?.message ?? 'Erreur serveur');
      }

      toast.success('Message envoyé ! Nous vous répondrons rapidement.');
      setSuccess(true);
      reset();
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors de l'envoi. Réessayez plus tard.";
      toast.error(msg);
      console.error('[contact] Erreur envoi:', err);
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════
     ÉCRAN SUCCÈS
     ═══════════════════════════════════════════════════════════════════════ */
  if (success) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="font-display font-semibold text-lg mb-2">
            Message envoyé !
          </h3>
          <p className="text-odc-muted text-sm mb-6">
            Nous vous répondrons dans les plus brefs délais à l'adresse indiquée.
          </p>
          <Button variant="outline" onClick={() => setSuccess(false)}>
            Envoyer un autre message
          </Button>
        </CardContent>
      </Card>
    );
  }

  /* ═══════════════════════════════════════════════════════════════════════
     FORMULAIRE
     ═══════════════════════════════════════════════════════════════════════ */
  return (
    <Card>
      <CardHeader>
        <CardTitle>Envoyez-nous un message</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

          {/* ⭐ Honeypot invisible (anti-bot) */}
          <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
            <Label htmlFor="website">Ne pas remplir</Label>
            <Input
              id="website"
              tabIndex={-1}
              autoComplete="off"
              {...register('website')}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nom">Nom complet</Label>
              <Input
                id="nom"
                autoComplete="name"
                placeholder="Votre nom"
                {...register('nom')}
                className="mt-1.5"
                aria-invalid={!!errors.nom}
              />
              {errors.nom && (
                <p className="text-odc-error text-xs mt-1">{errors.nom.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="vous@exemple.com"
                {...register('email')}
                className="mt-1.5"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-odc-error text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="sujet">Sujet</Label>
            <Select onValueChange={(v) => setValue('sujet', v as FormData['sujet'], { shouldValidate: true })}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Sélectionnez un sujet" />
              </SelectTrigger>
              <SelectContent>
                {SUJETS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sujet && (
              <p className="text-odc-error text-xs mt-1">{errors.sujet.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              rows={6}
              placeholder="Décrivez votre demande..."
              {...register('message')}
              className="mt-1.5"
              aria-invalid={!!errors.message}
            />
            {errors.message && (
              <p className="text-odc-error text-xs mt-1">{errors.message.message}</p>
            )}
          </div>

          <Button
            type="submit"
            variant="odc"
            size="lg"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Envoyer le message
              </>
            )}
          </Button>

          <p className="text-xs text-odc-muted text-center">
            En envoyant ce message, vous acceptez d'être recontacté par email.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}