'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Loader2,
  CheckCircle2,
  Info,
  Calendar,
  MapPin,
  Users,
  Video,
  AlertCircle,
  ArrowRight,
  Mail,
  Phone,
  User as UserIcon,
  BookOpen,
  Clock,
  Shield,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error-handler';
import { useSessionsPublic } from '@/hooks/queries/useSessions';
import { formatDate, formatDuration } from '@/lib/formatters';

/* ============================================================================
   SCHÉMA ZOD
   ============================================================================ */

const schema = z.object({
  sessionId: z
    .string()
    .min(1, 'Veuillez sélectionner une session'),

  nom: z
    .string()
    .trim()
    .min(2, 'Minimum 2 caractères')
    .max(100, 'Maximum 100 caractères'),

  prenom: z
    .string()
    .trim()
    .min(2, 'Minimum 2 caractères')
    .max(100, 'Maximum 100 caractères'),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Adresse email invalide'),

  telephone: z
    .string()
    .trim()
    .regex(
      /^(?:\+261|0)\s?3[2-9]\s?\d{2}\s?\d{3}\s?\d{2}$|^\+?[0-9\s().-]{6,20}$/,
      'Numéro de téléphone invalide (ex: +261 34 12 345 67)',
    )
    .optional()
    .or(z.literal('')),

  motivation: z
    .string()
    .trim()
    .max(1000, 'Maximum 1000 caractères')
    .optional()
    .or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

/* ============================================================================
   TYPES — GESTION DES ERREURS
   ============================================================================ */

type InscriptionErrorType =
  | 'already_accepted'
  | 'already_pending'
  | 'already_waitlist'
  | 'already_rejected'
  | 'already_registered'
  | 'session_full'
  | 'session_closed'
  | 'error';

interface InscriptionErrorResult {
  type: InscriptionErrorType;
  message: string;
  shouldRedirect?: boolean;
}

/* ============================================================================
   GESTION CONTEXTUELLE DES ERREURS
   ============================================================================ */

function handleInscriptionError(error: any): InscriptionErrorResult {
  const status = error?.response?.status;
  const message =
    error?.response?.data?.message ??
    error?.message ??
    'Une erreur est survenue';

  /* -------------------- 409 : Déjà inscrit -------------------- */
  if (status === 409) {
    if (message.includes('accepté') || message.includes('acceptée')) {
      toast.success(message, {
        icon: <CheckCircle2 className="h-4 w-4 text-odc-success" />,
        duration: 6000,
      });
      return {
        type: 'already_accepted',
        message,
        shouldRedirect: true,
      };
    }

    if (message.includes('attente')) {
      toast.info(message, {
        icon: <Clock className="h-4 w-4 text-odc-info" />,
        duration: 6000,
      });
      return {
        type: 'already_pending',
        message,
        shouldRedirect: true,
      };
    }

    if (message.includes('liste')) {
      toast.info(message, {
        icon: <Clock className="h-4 w-4 text-odc-warning" />,
        duration: 6000,
      });
      return {
        type: 'already_waitlist',
        message,
        shouldRedirect: true,
      };
    }

    if (message.includes('refus')) {
      toast.error(message, {
        icon: <AlertCircle className="h-4 w-4 text-odc-error" />,
        duration: 8000,
      });
      return {
        type: 'already_rejected',
        message,
      };
    }

    toast.info(message, {
      icon: <Info className="h-4 w-4" />,
      duration: 5000,
    });
    return {
      type: 'already_registered',
      message,
      shouldRedirect: true,
    };
  }

  /* -------------------- 400 : Session complète/fermée -------------------- */
  if (status === 400) {
    if (message.includes('complète') || message.includes('complet')) {
      toast.warning(message, {
        icon: <Users className="h-4 w-4 text-odc-warning" />,
        duration: 6000,
      });
      return { type: 'session_full', message };
    }

    if (message.includes('fermée') || message.includes('ouvertes')) {
      toast.error(message, {
        icon: <AlertCircle className="h-4 w-4 text-odc-error" />,
        duration: 6000,
      });
      return { type: 'session_closed', message };
    }
  }

  /* -------------------- Autres erreurs -------------------- */
  toast.error(getErrorMessage(error));
  return { type: 'error', message };
}

/* ============================================================================
   COMPOSANT PRINCIPAL
   ============================================================================ */

export function PublicInscriptionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preSelectedSessionId = searchParams.get('session');
  const [success, setSuccess] = React.useState(false);
  const [selectedSession, setSelectedSession] = React.useState<any>(null);

  /* -------------------- Chargement des sessions -------------------- */
  const { data: sessionsData, isLoading: loadingSessions } = useSessionsPublic({
    page: 1,
    limit: 50,
    statut: 'OUVERTE',
  });

  const sessions = sessionsData?.data ?? [];

  /* -------------------- Formulaire -------------------- */
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      sessionId: preSelectedSessionId ?? '',
      nom: '',
      prenom: '',
      email: '',
      telephone: '',
      motivation: '',
    },
    mode: 'onBlur',
  });

  const watchedSessionId = watch('sessionId');

  /* -------------------- Mettre à jour la session sélectionnée -------------------- */
  React.useEffect(() => {
    if (watchedSessionId) {
      const session = sessions.find((s) => s.id === watchedSessionId);
      setSelectedSession(session ?? null);
    } else {
      setSelectedSession(null);
    }
  }, [watchedSessionId, sessions]);

  /* -------------------- Submit -------------------- */
  const onSubmit = async (data: FormData) => {
    try {
      const response = await api.post('/public/inscriptions', data);
      const result = response.data;

      /* ⭐ Cas de réactivation */
      if (result?.data?.reactivated) {
        toast.success('Inscription réactivée avec succès !', {
          icon: <CheckCircle2 className="h-4 w-4" />,
          duration: 5000,
        });
      } else {
        toast.success(
          result?.message ?? 'Inscription envoyée avec succès !',
          {
            icon: <CheckCircle2 className="h-4 w-4" />,
            duration: 5000,
          },
        );
      }

      reset();
      setSuccess(true);
    } catch (err) {
      const result = handleInscriptionError(err);

      /* ⭐ Redirection intelligente */
      if (result.shouldRedirect) {
        setTimeout(() => {
          toast.info('Redirection vers vos inscriptions...', {
            duration: 2000,
          });
          router.push('/participant/inscriptions');
        }, 3000);
      }
    }
  };

  /* -------------------- Écran de succès -------------------- */
  if (success) {
    return <SuccessScreen />;
  }

  /* -------------------- Rendu principal -------------------- */
  return (
    <div className="space-y-6">
      {/* ================================================================
          CARTE — FORMULAIRE
          ================================================================ */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-odc-border bg-odc-surface-alt/30">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-odc-500 to-odc-700 shadow-odc-md">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="font-display text-xl font-bold">
                Demande d&apos;inscription
              </CardTitle>
              <CardDescription className="mt-1">
                Remplissez le formulaire ci-dessous pour vous inscrire à une
                formation ODC.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* ============================================================
                SECTION — SESSION
                ============================================================ */}
            <div className="space-y-4">
              <SectionTitle icon={Calendar} label="Session souhaitée" />

              <div>
                <Label htmlFor="sessionId">
                  Choisir une session{' '}
                  <span className="text-odc-error">*</span>
                </Label>

                {loadingSessions ? (
                  <Skeleton className="mt-1.5 h-11 w-full rounded-md" />
                ) : sessions.length === 0 ? (
                  <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-odc-warning/30 bg-odc-warning-soft/30 p-3">
                    <Info className="h-4 w-4 shrink-0 text-odc-warning" />
                    <p className="text-sm text-odc-warning-dark">
                      Aucune session ouverte actuellement. Revenez bientôt ou{' '}
                      <a
                        href="/contact"
                        className="font-medium underline hover:no-underline"
                      >
                        contactez-nous
                      </a>
                      .
                    </p>
                  </div>
                ) : (
                  <Controller
                    name="sessionId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger
                          id="sessionId"
                          className="mt-1.5"
                          aria-invalid={!!errors.sessionId}
                        >
                          <SelectValue placeholder="Sélectionnez une session" />
                        </SelectTrigger>
                        <SelectContent>
                          {sessions.map((s) => {
                            const restantes =
                              s.capacite - (s.inscriptionsCount ?? 0);
                            const isFull = restantes <= 0;

                            return (
                              <SelectItem
                                key={s.id}
                                value={s.id}
                                disabled={isFull}
                              >
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs text-odc-text-muted">
                                    {s.codeSession}
                                  </span>
                                  <span className="text-odc-text-muted">·</span>
                                  <span className="font-medium">
                                    {s.formation?.titre}
                                  </span>
                                  <span className="text-odc-text-muted">·</span>
                                  <span className="text-xs">
                                    {formatDate(s.dateDebut)}
                                  </span>
                                  {isFull && (
                                    <Badge
                                      variant="outline"
                                      className="ml-auto border-odc-error/30 text-xs text-odc-error"
                                    >
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
                  <p className="mt-1.5 text-xs text-odc-error" role="alert">
                    {errors.sessionId.message}
                  </p>
                )}
              </div>

              {/* Aperçu de la session sélectionnée */}
              {selectedSession && (
                <SessionPreview session={selectedSession} />
              )}
            </div>

            {/* ============================================================
                SECTION — INFORMATIONS PERSONNELLES
                ============================================================ */}
            <div className="space-y-4">
              <SectionTitle icon={UserIcon} label="Informations personnelles" />

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="prenom">
                    Prénom <span className="text-odc-error">*</span>
                  </Label>
                  <Input
                    id="prenom"
                    autoComplete="given-name"
                    disabled={isSubmitting}
                    {...register('prenom')}
                    className="mt-1.5"
                    aria-invalid={!!errors.prenom}
                    placeholder="Jean"
                  />
                  {errors.prenom && (
                    <p className="mt-1.5 text-xs text-odc-error" role="alert">
                      {errors.prenom.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nom">
                    Nom <span className="text-odc-error">*</span>
                  </Label>
                  <Input
                    id="nom"
                    autoComplete="family-name"
                    disabled={isSubmitting}
                    {...register('nom')}
                    className="mt-1.5"
                    aria-invalid={!!errors.nom}
                    placeholder="Dupont"
                  />
                  {errors.nom && (
                    <p className="mt-1.5 text-xs text-odc-error" role="alert">
                      {errors.nom.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="email" className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    Email <span className="text-odc-error">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    disabled={isSubmitting}
                    {...register('email')}
                    className="mt-1.5"
                    aria-invalid={!!errors.email}
                    placeholder="jean.dupont@exemple.mg"
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-odc-error" role="alert">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="telephone"
                    className="flex items-center gap-1.5"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    Téléphone
                  </Label>
                  <Input
                    id="telephone"
                    type="tel"
                    autoComplete="tel"
                    disabled={isSubmitting}
                    {...register('telephone')}
                    className="mt-1.5"
                    aria-invalid={!!errors.telephone}
                    placeholder="+261 34 12 345 67"
                  />
                  {errors.telephone && (
                    <p className="mt-1.5 text-xs text-odc-error" role="alert">
                      {errors.telephone.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ============================================================
                SECTION — MOTIVATION
                ============================================================ */}
            <div className="space-y-4">
              <SectionTitle icon={BookOpen} label="Motivation (optionnel)" />

              <div>
                <Textarea
                  id="motivation"
                  rows={4}
                  placeholder="Pourquoi souhaitez-vous participer à cette formation ? Quels sont vos objectifs ?"
                  disabled={isSubmitting}
                  {...register('motivation')}
                  className="resize-none"
                />
                {errors.motivation && (
                  <p className="mt-1.5 text-xs text-odc-error" role="alert">
                    {errors.motivation.message}
                  </p>
                )}
                <p className="mt-1.5 text-xs text-odc-text-muted">
                  Une motivation claire augmente vos chances d&apos;être
                  sélectionné(e).
                </p>
              </div>
            </div>

            <Separator />

            {/* ============================================================
                ACTIONS
                ============================================================ */}
            <div className="space-y-4">
              <Button
                type="submit"
                variant="odc"
                size="lg"
                disabled={isSubmitting || sessions.length === 0}
                loading={isSubmitting}
                loadingText="Envoi en cours…"
                className="w-full"
                leftIcon={<ArrowRight className="h-4 w-4" />}
              >
                Envoyer ma demande
              </Button>

              <p className="text-center text-xs text-odc-text-muted">
                En soumettant ce formulaire, vous acceptez nos{' '}
                <a href="/cgu" className="text-odc-primary hover:underline">
                  conditions d&apos;utilisation
                </a>
                .
              </p>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ================================================================
          CARTE — INFORMATIONS
          ================================================================ */}
      <Card className="border-odc-info/30 bg-odc-info-soft/20">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Shield className="mt-0.5 h-5 w-5 shrink-0 text-odc-info" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-odc-info-dark">
                Que se passe-t-il ensuite ?
              </p>
              <ol className="mt-2 space-y-1.5 text-xs text-odc-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-odc-info text-[10px] font-bold text-white">
                    1
                  </span>
                  <span>
                    Vous recevrez un email de confirmation à l&apos;adresse
                    indiquée.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-odc-info text-[10px] font-bold text-white">
                    2
                  </span>
                  <span>
                    Le staff ODC examinera votre demande sous 48-72h.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-odc-info text-[10px] font-bold text-white">
                    3
                  </span>
                  <span>
                    Vous serez notifié(e) de la décision par email et sur votre
                    espace participant.
                  </span>
                </li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================================
   SOUS-COMPOSANTS
   ============================================================================ */

interface SectionTitleProps {
  icon: React.ElementType;
  label: string;
}

function SectionTitle({ icon: Icon, label }: SectionTitleProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-odc-primary-soft">
        <Icon className="h-3.5 w-3.5 text-odc-primary" />
      </div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-odc-text-secondary">
        {label}
      </h3>
    </div>
  );
}

/* ============================================================================
   APERÇU DE LA SESSION
   ============================================================================ */

interface SessionPreviewProps {
  session: any;
}

function SessionPreview({ session }: SessionPreviewProps) {
  const restantes = session.capacite - (session.inscriptionsCount ?? 0);
  const isFull = restantes <= 0;
  const fillPercent =
    session.capacite > 0
      ? Math.min(100, ((session.inscriptionsCount ?? 0) / session.capacite) * 100)
      : 0;

  return (
    <div className="rounded-lg border border-odc-primary/20 bg-odc-primary-softer/50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Badge
          variant="outline"
          className="border-odc-primary/30 bg-white font-mono text-xs"
        >
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
          <span>
            {formatDate(session.dateDebut)} → {formatDate(session.dateFin)}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-odc-text-secondary">
          <Clock className="h-4 w-4 shrink-0 text-odc-primary" />
          <span>
            {formatDuration(session.dateDebut, session.dateFin)}
          </span>
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

      {/* Places disponibles */}
      <div className="mt-4 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-odc-text-secondary">
            Places disponibles
          </span>
          <span
            className={cn(
              'font-semibold tabular-nums',
              isFull ? 'text-odc-error' : 'text-odc-primary',
            )}
          >
            {isFull ? 'Complet' : `${restantes} / ${session.capacite}`}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-odc-surface-alt">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              fillPercent >= 90
                ? 'bg-odc-error'
                : fillPercent >= 70
                  ? 'bg-odc-warning'
                  : 'bg-odc-success',
            )}
            style={{ width: `${fillPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   ÉCRAN DE SUCCÈS
   ============================================================================ */

function SuccessScreen() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="py-12 text-center">
        {/* Icône */}
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-odc-success/20" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-odc-success-soft">
            <CheckCircle2 className="h-10 w-10 text-odc-success" />
          </div>
        </div>

        <h2 className="mb-3 font-display text-2xl font-bold text-odc-text-primary">
          Inscription envoyée !
        </h2>

        <p className="mx-auto mb-6 max-w-md text-sm text-odc-text-secondary">
          Votre demande d&apos;inscription a bien été reçue. Vous recevrez un
          email de confirmation à l&apos;adresse indiquée avec les prochaines
          étapes.
        </p>

        {/* Étapes suivantes */}
        <div className="mx-auto mb-8 max-w-md rounded-lg border border-odc-border bg-odc-surface-alt/30 p-4 text-left">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-odc-text-muted">
            Prochaines étapes
          </p>
          <ul className="space-y-2 text-sm text-odc-text-secondary">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-odc-success" />
              <span>Email de confirmation envoyé</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-odc-info" />
              <span>Examen de votre dossier par le staff (48-72h)</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-odc-primary" />
              <span>Notification de la décision</span>
            </li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="odc" asChild>
            <a href="/formations">
              Découvrir d&apos;autres formations
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>

          <Button variant="outline" asChild>
            <a href="/participant/inscriptions">
              Voir mes inscriptions
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}