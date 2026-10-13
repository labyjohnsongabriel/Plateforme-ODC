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

const schema = z.object({
  nom: z.string().trim().min(2, 'Nom requis').max(100),
  email: z.string().trim().email('Email invalide'),
  sujet: z.enum(['information', 'partenariat', 'support', 'autre']),
  message: z.string().trim().min(10, 'Message trop court').max(2000),
});

type FormData = z.infer<typeof schema>;

const SUJETS = [
  { value: 'information', label: "Demande d'information" },
  { value: 'partenariat', label: 'Partenariat' },
  { value: 'support', label: 'Support technique' },
  { value: 'autre', label: 'Autre' },
];

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
  });

  const onSubmit = async (data: FormData) => {
    try {
      // TODO: endpoint /api/public/contact
      await new Promise((r) => setTimeout(r, 1000));
      toast.success('Message envoyé ! Nous vous répondrons rapidement.');
      setSuccess(true);
      reset();
    } catch {
      toast.error("Erreur lors de l'envoi. Réessayez plus tard.");
    }
  };

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
            Nous vous répondrons dans les plus brefs délais.
          </p>
          <Button variant="outline" onClick={() => setSuccess(false)}>
            Envoyer un autre message
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Envoyez-nous un message</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nom">Nom complet</Label>
              <Input id="nom" {...register('nom')} className="mt-1.5" />
              {errors.nom && (
                <p className="text-odc-error text-xs mt-1">{errors.nom.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} className="mt-1.5" />
              {errors.email && (
                <p className="text-odc-error text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="sujet">Sujet</Label>
            <Select onValueChange={(v) => setValue('sujet', v as any)}>
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
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Envoyer le message
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}