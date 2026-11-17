'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  CheckCircle2, Info, Calendar, MapPin, Users, Video, AlertCircle,
  ArrowRight, Mail, Phone, User as UserIcon, BookOpen, Clock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { useSessionsPublic } from '@/hooks/queries/useSessions';
import { formatDate, formatDuration } from '@/lib/formatters';
import { InscriptionSuccessScreen } from './InscriptionSuccessScreen';

/* ── Schéma ────────────────────────────────────────────────────────────── */
const schema = z.object({
  sessionId: z.string().min(1, 'Veuillez sélectionner une session'),
  nom: z.string().trim().min(2, 'Minimum 2 caractères').max(100, 'Maximum 100 caractères'),
  prenom: z.string().trim().min(2, 'Minimum 2 caractères').max(100, 'Maximum 100 caractères'),
  email: z.string().trim().toLowerCase().email('Adresse email invalide'),
  telephone: z
    .string()
    .trim()
    .regex(
      /^(?:\+261|0)\s?3[2-9]\s?\d{2}\s?\d{3}\s?\d{2}$|^\+?[0-9\s().-]{6,20}$/,
      'Numéro invalide (ex: +261 34 12 345 67)',
    )
    .optional()
    .or(z.literal('')),
  motivation: z.string().trim().max(1000, 'Maximum 1000 caractères').optional().or(z.literal('')),
});
type FormData = z.infer<typeof schema>;

/* ── Gestion d'erreurs métier ──────────────────────────────────────────── */
function handleInscriptionError(error: any) {
  const status = error?.response?.status;
  const message = error?.response?.data?.message ?? error?.message ?? 'Une erreur est survenue';

  if (status === 409) {
    if (message.includes('accepté') || message.includes('acceptée')) {
      toast.success(message, { icon: <CheckCircle2 className="h-4 w-4 text-odc-success" />, duration: 6000 });
      return { shouldRedirect: true };
    }
    if (message.includes('attente')) {
      toast.info(message, { icon: <Clock className="h-4 w-4 text-odc-info" />, duration: 6000 });
      return { shouldRedirect: true };
    }
    if (message.includes('liste')) {
      toast.info(message, { icon: <Clock className="h-4 w-4 text-odc-warning" />, duration: 6000 });
      return { shouldRedirect: true };
    }
    if (message.includes('refus')) {
      toast.error(message, { icon: <AlertCircle className="h-4 w-4 text-odc-error" />, duration: 8000 });
      return { shouldRedirect: false };
    }
    toast.info(message, { icon: <Info className="h-4 w-4" />, duration: 5000 });
    return { shouldRedirect: true };
  }

  if (status === 400) {
    if (message.includes('complète') || message.includes('complet')) {
      toast.warning(message, { icon: <Users className="h-4 w-4 text-odc-warning" />, duration: 6000 });
      return { shouldRedirect: false };
    }
    if (message.includes('fermée') || message.includes('ouvertes')) {
      toast.error(message, { icon: <AlertCircle className="h-4 w-4 text-odc-error" />, duration: 6000 });
      return { shouldRedirect: false };
    }
  }

  toast.error(getErrorMessage(error));
  return { shouldRedirect: false };
}

/* ── Composant ─────────────────────────────────────────────────────────── */

interface Props {
  /** Appelé après succès (le modal peut décider de fermer ou laisser ouvert) */
  onSuccess?: () => void;
  /** Appelé à la fermeture (bouton "Fermer" ou croix) */
  onClose?: () => void;
  /** Session pré-sélectionnée (URL ?session=xxx) */
  defaultSessionId?: string;
  /** Mode compact pour le modal */
  compact?: boolean;
}

export function PublicInscriptionForm({
  onSuccess, onClose, defaultSessionId, compact = false,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedSessionId = defaultSessionId ?? searchParams.get('session') ?? '';
  const [success, setSuccess] = React.useState(false);
  const [selectedSession, setSelectedSession] = React.useState<any>(null);

  const { data: sessionsData, isLoading: loadingSessions } = useSessionsPublic({
    page: 1,
    limit: 50,
    statut: 'OUVERTE',
  });
  const sessions = sessionsData?.data ?? [];

  const {
    register, handleSubmit, control, watch, reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sessionId: preSelectedSessionId,
      nom: '', prenom: '', email: '', telephone: '', motivation: '',
    },
    mode: 'onBlur',
  });

  const watchedSessionId = watch('sessionId');

  React.useEffect(() => {
    setSelectedSession(sessions.find((s) => s.id === watchedSessionId) ?? null);
  }, [watchedSessionId, sessions]);

  const onSubmit = async (data: FormData) => {
    try {
      const response = await api.post('/public/inscriptions', data);
      const result = response.data;

      toast.success(
        result?.data?.reactivated
          ? 'Inscription réactivée avec succès !'
          : (result?.message ?? 'Inscription envoyée avec succès !'),
        { icon: <CheckCircle2 className="h-4 w-4" />, duration: 5000 },
      );

      reset();
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      const result = handleInscriptionError(err);
      if (result.shouldRedirect) {
        setTimeout(() => {
          toast.info('Redirection vers vos inscriptions…', { duration: 2000 });
          onClose?.();
          router.push('/participant/inscriptions');
        }, 3000);
      }
    }
  };

  if (success) {
    return <InscriptionSuccessScreen onClose={onClose} variant={compact ? 'modal' : 'page'} />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* ── Session ───────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <SectionTitle icon={Calendar} label="Session souhaitée" />

        <div>
          <Label htmlFor="sessionId">
            Choisir une session <span className="text-odc-error">*</span>
          </Label>

          {loadingSessions ? (
            <Skeleton className="mt-1.5 h-11 w-full rounded-md" />
          ) : sessions.length === 0 ? (
            <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-odc-warning/30 bg-odc-warning-soft/30 p-3">
              <Info className="h-4 w-4 shrink-0 text-odc-warning" />
              <p className="text-sm text-odc-warning-dark">
                Aucune session ouverte.{' '}
                <a href="/contact" className="font-medium underline hover:no-underline">Contactez-nous</a>.
              </p>
            </div>
          ) : (
            <Controller
              name="sessionId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isSubmitting}>
                  <SelectTrigger id="sessionId" className="mt-1.5" aria-invalid={!!errors.sessionId}>
                    <SelectValue placeholder="Sélectionnez une session" />
                  </SelectTrigger>
                  <SelectContent>
                    {sessions.map((s) => {
                      const restantes = s.capacite - (s.inscriptionsCount ?? 0);
                      const isFull = restantes <= 0;
                      return (
                        <SelectItem key={s.id} value={s.id} disabled={isFull}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-odc-text-muted">{s.codeSession}</span>
                            <span className="text-odc-text-muted">·</span>
                            <span className="font-medium">{s.formation?.titre}</span>
                            <span className="text-odc-text-muted">·</span>
                            <span className="text-xs">{formatDate(s.dateDebut)}</span>
                            {isFull && (
                              <Badge variant="outline" className="ml-auto border-odc-error/30 text-xs text-odc-error">
                                Complet
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            />
          )}
          {errors.sessionId && (
            <p className="mt-1.5 text-xs text-odc-error" role="alert">{errors.sessionId.message}</p>
          )}
        </div>

        {selectedSession && <SessionPreview session={selectedSession} />}
      </div>

      <Separator />

      {/* ── Identité ──────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <SectionTitle icon={UserIcon} label="Informations personnelles" />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="prenom">Prénom <span className="text-odc-error">*</span></Label>
            <Input id="prenom" autoComplete="given-name" disabled={isSubmitting}
              {...register('prenom')} className="mt-1.5" aria-invalid={!!errors.prenom}
              placeholder="Jean" />
            {errors.prenom && <p className="mt-1.5 text-xs text-odc-error" role="alert">{errors.prenom.message}</p>}
          </div>
          <div>
            <Label htmlFor="nom">Nom <span className="text-odc-error">*</span></Label>
            <Input id="nom" autoComplete="family-name" disabled={isSubmitting}
              {...register('nom')} className="mt-1.5" aria-invalid={!!errors.nom}
              placeholder="Dupont" />
            {errors.nom && <p className="mt-1.5 text-xs text-odc-error" role="alert">{errors.nom.message}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="email" className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email <span className="text-odc-error">*</span>
            </Label>
            <Input id="email" type="email" autoComplete="email" disabled={isSubmitting}
              {...register('email')} className="mt-1.5" aria-invalid={!!errors.email}
              placeholder="jean.dupont@exemple.mg" />
            {errors.email && <p className="mt-1.5 text-xs text-odc-error" role="alert">{errors.email.message}</p>}
          </div>
          <div>
            <Label htmlFor="telephone" className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> Téléphone
            </Label>
            <Input id="telephone" type="tel" autoComplete="tel" disabled={isSubmitting}
              {...register('telephone')} className="mt-1.5" aria-invalid={!!errors.telephone}
              placeholder="+261 34 12 345 67" />
            {errors.telephone && <p className="mt-1.5 text-xs text-odc-error" role="alert">{errors.telephone.message}</p>}
          </div>
        </div>
      </div>

      <Separator />

      {/* ── Motivation ────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <SectionTitle icon={BookOpen} label="Motivation (optionnel)" />
        <Textarea id="motivation" rows={compact ? 3 : 4}
          placeholder="Pourquoi souhaitez-vous participer ?"
          disabled={isSubmitting} {...register('motivation')} className="resize-none" />
        {errors.motivation && <p className="mt-1.5 text-xs text-odc-error" role="alert">{errors.motivation.message}</p>}
        <p className="text-xs text-odc-text-muted">
          Une motivation claire augmente vos chances d'être sélectionné(e).
        </p>
      </div>

      {/* ── Actions ───────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="order-2 text-xs text-odc-text-muted sm:order-1">
          En soumettant, vous acceptez les{' '}
          <a href="/cgu" className="text-odc-primary hover:underline">conditions</a>.
        </p>
        <Button
          type="submit" variant="odc" size="lg"
          disabled={isSubmitting || sessions.length === 0}
          className="order-1 w-full sm:order-2 sm:w-auto"
        >
          {isSubmitting ? 'Envoi en cours…' : (
            <>Envoyer ma demande <ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </div>
    </form>
  );
}

/* ── Helpers UI ────────────────────────────────────────────────────────── */

function SectionTitle({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-odc-primary-soft">
        <Icon className="h-3.5 w-3.5 text-odc-primary" />
      </div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-odc-text-secondary">{label}</h3>
    </div>
  );
}

function SessionPreview({ session }: { session: any }) {
  const restantes = session.capacite - (session.inscriptionsCount ?? 0);
  const isFull = restantes <= 0;
  const fillPercent = session.capacite > 0
    ? Math.min(100, ((session.inscriptionsCount ?? 0) / session.capacite) * 100)
    : 0;

  return (
    <div className="rounded-lg border border-odc-primary/20 bg-odc-primary-softer/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Badge variant="outline" className="border-odc-primary/30 bg-white font-mono text-xs">
          {session.codeSession}
        </Badge>
        {session.formation?.certifiante && (
          <Badge className="bg-amber-50 text-amber-700 ring-amber-200 hover:bg-amber-50">
            Certifiante
          </Badge>
        )}
      </div>
      <h4 className="font-display text-base font-semibold text-odc-text-primary">
        {session.formation?.titre}
      </h4>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="flex items-center gap-2 text-sm text-odc-text-secondary">
          <Calendar className="h-4 w-4 shrink-0 text-odc-primary" />
          <span>{formatDate(session.dateDebut)} → {formatDate(session.dateFin)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-odc-text-secondary">
          <Clock className="h-4 w-4 shrink-0 text-odc-primary" />
          <span>{formatDuration(session.dateDebut, session.dateFin)}</span>
        </div>
        {session.lieu && (
          <div className="flex items-center gap-2 text-sm text-odc-text-secondary">
            <MapPin className="h-4 w-4 shrink-0 text-odc-primary" />
            <span className="truncate">{session.lieu}</span>
          </div>
        )}
        {session.lienVisio && (
          <div className="flex items-center gap-2 text-sm text-odc-text-secondary">
            <Video className="h-4 w-4 shrink-0 text-odc-info" />
            <span>En ligne</span>
          </div>
        )}
      </div>
      <div className="mt-4 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-odc-text-secondary">Places disponibles</span>
          <span className={cn('font-semibold tabular-nums', isFull ? 'text-odc-error' : 'text-odc-primary')}>
            {isFull ? 'Complet' : `${restantes} / ${session.capacite}`}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-odc-surface-alt">
          <div className={cn(
            'h-full rounded-full transition-all',
            fillPercent >= 90 ? 'bg-odc-error' : fillPercent >= 70 ? 'bg-odc-warning' : 'bg-odc-success',
          )} style={{ width: `${fillPercent}%` }} />
        </div>
      </div>
    </div>
  );
}