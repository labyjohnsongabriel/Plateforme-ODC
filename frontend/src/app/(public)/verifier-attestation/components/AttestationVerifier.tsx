// src/app/(public)/verifier-attestation/components/AttestationVerifier.tsx
'use client';

import * as React from 'react';
import axios from 'axios';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  XCircle,
  Hash,
  Calendar,
  User,
  GraduationCap,
  Clock,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  ShieldX,
  Copy,
  Check,
  Search,
  RefreshCw,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface ParticipantData {
  id?: string;
  nom?: string | null;
  prenom?: string | null;
  email?: string | null;
  photoUrl?: string | null;
}

interface FormationData {
  id?: string;
  titre?: string | null;
  dureeHeures?: number | null;
}

interface SessionData {
  id?: string;
  codeSession?: string | null;
  dateDebut?: string | null;
  dateFin?: string | null;
  statut?: string | null;
  formation?: FormationData | null;
}

interface AttestationData {
  id?: string;
  numero: string;
  hash?: string | null;
  valide: boolean;
  dateEmission?: string | null;
  noteFinale?: number | null;
  tauxPresence?: number | null;
  motifInvalidation?: string | null;
  participant?: ParticipantData | null;
  session?: SessionData | null;
}

interface Props {
  numero?: string;
}

/* ═══════════════════════════════════════════════════════════════════════════
   ⭐ HELPERS — Extraction sûre (jamais d'objet rendu)
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Convertit n'importe quelle valeur en string sûre pour React.
 * Les objets ne sont JAMAIS rendus directement.
 */
function safeString(value: unknown, fallback = '—'): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value.trim() || fallback;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  return fallback;
}

/**
 * Formate un participant (objet → string)
 */
function formatParticipant(p?: ParticipantData | null): string {
  if (!p) return '—';
  const prenom = (p.prenom ?? '').trim();
  const nom = (p.nom ?? '').trim();
  const full = `${prenom} ${nom}`.trim();
  if (full) return full;
  if (p.email) return p.email;
  return '—';
}

/**
 * Formate une formation (objet → string)
 */
function formatFormation(f?: FormationData | null): string {
  if (!f) return '—';
  const titre = safeString(f.titre, '');
  if (titre) return titre;
  return '—';
}

/**
 * Formate une session (objet → string)
 */
function formatSessionCode(s?: SessionData | null): string {
  if (!s) return '—';
  return safeString(s.codeSession, '—');
}

/**
 * Formate une note (number → string)
 */
function formatNote(note?: number | null): string {
  if (typeof note !== 'number' || isNaN(note)) return '—';
  return `${note.toFixed(1)}/20`;
}

/**
 * Formate un taux de présence
 */
function formatPresence(taux?: number | null): string {
  if (typeof taux !== 'number' || isNaN(taux)) return '—';
  return `${Math.round(taux)}%`;
}

/**
 * Formate une date
 */
function formatDateSafe(d?: string | null): string {
  if (!d) return '—';
  try {
    return formatDate(d);
  } catch {
    return '—';
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════════ */

export function AttestationVerifier({ numero }: Props) {
  const router = useRouter();
  const [numeroSaisi, setNumeroSaisi] = React.useState(numero ?? '');
  const [validationError, setValidationError] = React.useState('');
  const {
    data: attestation,
    isLoading,
    isError,
    isNotFound,
    verifiedAt,
    retry,
  } = useAttestationVerification(numero ?? '');

  React.useEffect(() => {
    setNumeroSaisi(numero ?? '');
    setValidationError('');
  }, [numero]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const numeroNormalise = numeroSaisi.trim();
    if (!numeroNormalise) {
      setValidationError("Veuillez saisir le numéro de l'attestation.");
      return;
    }

    setValidationError('');
    router.push(`/verifier-attestation/${encodeURIComponent(numeroNormalise)}`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-5 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <label
              htmlFor="numero-attestation"
              className="text-foreground text-sm font-semibold"
            >
              Numéro de l&apos;attestation
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="numero-attestation"
                value={numeroSaisi}
                onChange={(event) => {
                  setNumeroSaisi(event.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="Ex. ODC-2026-000123"
                autoComplete="off"
                aria-invalid={Boolean(validationError)}
                aria-describedby={
                  validationError ? 'numero-attestation-error' : undefined
                }
              />
              <Button type="submit" disabled={isLoading} className="shrink-0">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Search className="mr-2 h-4 w-4" aria-hidden />
                )}
                Vérifier
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Button>
            </div>
            {validationError ? (
              <p
                id="numero-attestation-error"
                role="alert"
                className="text-destructive text-sm"
              >
                {validationError}
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">
                Saisissez le numéro figurant sur le document ou son QR code.
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {!numero ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <ShieldCheck className="text-primary h-8 w-8" aria-hidden />
            <p className="text-muted-foreground max-w-md text-sm">
              Cette vérification confirme l&apos;authenticité et le statut actuel
              d&apos;une attestation émise par ODC.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <LoadingSkeleton />
      ) : isNotFound ? (
        <InvalidState numero={numero} />
      ) : isError ? (
        <VerificationErrorState onRetry={retry} />
      ) : attestation ? (
        <>
          {/* ═══════════════ BANDEAU STATUT ═══════════════ */}
          <StatusBanner attestation={attestation} />

          {/* ═══════════════ DÉTAILS ═══════════════ */}
          <Card className="border-odc-border overflow-hidden bg-white dark:bg-slate-950">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Section 1 : Numéro + Statut */}
                <section>
                  <SectionTitle>Numéro d'attestation</SectionTitle>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="border-odc-border bg-odc-surface flex items-center gap-2 rounded-lg border px-4 py-2.5">
                      <Hash className="text-odc-text-muted h-4 w-4" aria-hidden />
                      <span className="text-odc-text-primary font-mono text-base font-bold">
                        {safeString(attestation.numero)}
                      </span>
                    </div>
                    <CopyButton value={safeString(attestation.numero, '')} />
                  </div>
                </section>

                <Separator />

                {/* Section 2 : Participant */}
                <section>
                  <SectionTitle>Participant</SectionTitle>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <InfoRow
                      icon={User}
                      label="Nom complet"
                      value={formatParticipant(attestation.participant)}
                    />
                    <InfoRow
                      icon={ShieldCheck}
                      label="Email"
                      value={safeString(attestation.participant?.email)}
                    />
                  </div>
                </section>

                <Separator />

                {/* Section 3 : Formation */}
                <section>
                  <SectionTitle>Formation</SectionTitle>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <InfoRow
                      icon={GraduationCap}
                      label="Formation"
                      value={formatFormation(attestation.session?.formation)}
                    />
                    <InfoRow
                      icon={Hash}
                      label="Code session"
                      value={formatSessionCode(attestation.session)}
                    />
                    <InfoRow
                      icon={Calendar}
                      label="Début"
                      value={formatDateSafe(attestation.session?.dateDebut)}
                    />
                    <InfoRow
                      icon={Calendar}
                      label="Fin"
                      value={formatDateSafe(attestation.session?.dateFin)}
                    />
                  </div>
                </section>

                <Separator />

                {/* Section 4 : Résultats */}
                <section>
                  <SectionTitle>Résultats</SectionTitle>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    <InfoRow
                      icon={Award}
                      label="Note finale"
                      value={formatNote(attestation.noteFinale)}
                      tone={
                        typeof attestation.noteFinale === 'number' &&
                        attestation.noteFinale >= 10
                          ? 'success'
                          : typeof attestation.noteFinale === 'number'
                            ? 'danger'
                            : 'default'
                      }
                    />
                    <InfoRow
                      icon={Clock}
                      label="Taux de présence"
                      value={formatPresence(attestation.tauxPresence)}
                      tone={
                        typeof attestation.tauxPresence === 'number' &&
                        attestation.tauxPresence >= 75
                          ? 'success'
                          : typeof attestation.tauxPresence === 'number'
                            ? 'warning'
                            : 'default'
                      }
                    />
                    <InfoRow
                      icon={Calendar}
                      label="Date d'émission"
                      value={formatDateSafe(attestation.dateEmission)}
                    />
                  </div>
                </section>

                {/* Motif d'invalidation */}
                {!attestation.valide && attestation.motifInvalidation && (
                  <>
                    <Separator />
                    <div className="flex items-start gap-2 rounded-lg border border-odc-error bg-odc-error-bg p-3">
                      <AlertTriangle
                        className="text-odc-error-dark mt-0.5 h-4 w-4 shrink-0"
                        aria-hidden
                      />
                      <div className="text-odc-error-dark text-xs">
                        <p className="font-semibold">Motif d'invalidation</p>
                        <p className="mt-0.5">
                          {safeString(attestation.motifInvalidation)}
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {/* Hash de vérification */}
                {attestation.hash && (
                  <>
                    <Separator />
                    <section>
                      <SectionTitle>Empreinte numérique</SectionTitle>
                      <div className="border-odc-border bg-odc-surface mt-2 rounded-lg border p-3">
                        <code className="text-odc-text-primary block break-all font-mono text-[11px] leading-relaxed">
                          {safeString(attestation.hash)}
                        </code>
                      </div>
                    </section>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ═══════════════ FOOTER INFO ═══════════════ */}
          <p className="text-odc-text-muted text-center text-xs">
            Vérifié le {formatDateSafe(verifiedAt)} · Source officielle ODC
          </p>
        </>
      ) : null}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HOOK — Vérification via API publique
   ═══════════════════════════════════════════════════════════════════════════ */

function useAttestationVerification(numero: string) {
  const [data, setData] = React.useState<AttestationData | null>(null);
  const [isLoading, setIsLoading] = React.useState(Boolean(numero));
  const [isError, setIsError] = React.useState(false);
  const [isNotFound, setIsNotFound] = React.useState(false);
  const [verifiedAt, setVerifiedAt] = React.useState<string>();
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchAttestation() {
      if (!numero) {
        setData(null);
        setIsError(false);
        setIsNotFound(false);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setIsError(false);
        setIsNotFound(false);

        const response = await api.get(
          `/public/attestations/verifier/${encodeURIComponent(numero)}`,
        );

        const payload = response.data?.data ?? response.data;

        if (!payload) {
          if (!cancelled) {
            setData(null);
            setIsNotFound(true);
          }
          return;
        }

        if (!cancelled) {
          setData(payload as AttestationData);
          setVerifiedAt(new Date().toISOString());
        }
      } catch (err) {
        if (!cancelled) {
          setData(null);
          if (axios.isAxiosError(err) && err.response?.status === 404) {
            setIsNotFound(true);
          } else {
            setIsError(true);
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAttestation();

    return () => {
      cancelled = true;
    };
  }, [numero, retryCount]);

  return {
    data,
    isLoading,
    isError,
    isNotFound,
    verifiedAt,
    retry: () => setRetryCount((count) => count + 1),
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   SOUS-COMPOSANTS
   ═══════════════════════════════════════════════════════════════════════════ */

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-odc-text-muted text-xs font-semibold uppercase tracking-wider">
      {children}
    </p>
  );
}

type Tone = 'default' | 'success' | 'warning' | 'danger';

interface InfoRowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  tone?: Tone;
}

function InfoRow({ icon: Icon, label, value, tone = 'default' }: InfoRowProps) {
  const toneClass = {
    default: 'text-odc-text-primary',
    success: 'text-odc-success-dark',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-odc-error-dark',
  }[tone];

  return (
    <div className="border-odc-border rounded-lg border bg-white p-3 dark:bg-slate-950">
      <div className="flex items-center gap-2">
        <Icon className="text-odc-text-muted h-3.5 w-3.5" aria-hidden />
        <p className="text-odc-text-muted text-xs font-medium">{label}</p>
      </div>
      <p className={cn('mt-1 text-sm font-semibold', toneClass)}>
        {value /* ⭐ TOUJOURS une string */}
      </p>
    </div>
  );
}

function StatusBanner({ attestation }: { attestation: AttestationData }) {
  const valide = attestation.valide === true;

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-5',
        valide
          ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10'
          : 'border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10',
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          valide
            ? 'bg-emerald-100 dark:bg-emerald-500/20'
            : 'bg-red-100 dark:bg-red-500/20',
        )}
        aria-hidden
      >
        {valide ? (
          <ShieldCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-300" />
        ) : (
          <ShieldX className="h-5 w-5 text-red-700 dark:text-red-300" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h2
          className={cn(
            'text-base font-bold',
            valide
              ? 'text-emerald-900 dark:text-emerald-100'
              : 'text-red-900 dark:text-red-100',
          )}
        >
          {valide ? 'Attestation authentique' : 'Attestation invalidée'}
        </h2>
        <p
          className={cn(
            'mt-0.5 text-sm',
            valide
              ? 'text-emerald-700 dark:text-emerald-300'
              : 'text-red-700 dark:text-red-300',
          )}
        >
          {valide
            ? 'Cette attestation a été émise par ODC Formations et est actuellement valide.'
            : "Cette attestation a été émise par ODC Formations mais n'est plus valide."}
        </p>
      </div>
      <Badge
        className={cn(
          'shrink-0 gap-1',
          valide
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200'
            : 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-200',
        )}
      >
        {valide ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            Valide
          </>
        ) : (
          <>
            <XCircle className="h-3.5 w-3.5" aria-hidden />
            Invalide
          </>
        )}
      </Badge>
    </div>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  if (!value) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleCopy}
            className="h-9 w-9"
            aria-label={copied ? 'Copié' : 'Copier le numéro'}
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-600" aria-hidden />
            ) : (
              <Copy className="h-4 w-4" aria-hidden />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copied ? 'Copié !' : 'Copier'}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-28 rounded-xl" />
      <Card>
        <CardContent className="space-y-6 p-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-16 rounded-lg" />
            <Skeleton className="h-16 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function InvalidState({ numero }: { numero: string }) {
  return (
    <Card className="border-red-200 dark:border-red-500/30">
      <CardContent className="flex flex-col items-center justify-center p-10 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/20">
          <AlertTriangle className="h-8 w-8 text-red-700 dark:text-red-300" aria-hidden />
        </div>
        <h2 className="text-lg font-bold text-red-900 dark:text-red-100">
          Attestation introuvable
        </h2>
        <p className="mt-2 max-w-sm text-sm text-red-700 dark:text-red-300">
          Aucune attestation n'a été trouvée avec le numéro{' '}
          <code className="rounded bg-red-100 px-1.5 py-0.5 font-mono text-xs dark:bg-red-500/20">
            {numero}
          </code>
          .
        </p>
        <p className="text-odc-text-muted mt-4 text-xs">
          Vérifiez le numéro sur votre attestation ou contactez l'administration.
        </p>
      </CardContent>
    </Card>
  );
}

function VerificationErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <Card className="border-amber-200 dark:border-amber-500/30">
      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-500/20">
          <AlertTriangle
            className="h-7 w-7 text-amber-700 dark:text-amber-300"
            aria-hidden
          />
        </div>
        <h2 className="text-foreground text-lg font-bold">
          Vérification momentanément indisponible
        </h2>
        <p className="text-muted-foreground mt-2 max-w-md text-sm">
          Le service n&apos;a pas pu confirmer le statut de cette attestation. Réessayez
          dans quelques instants.
        </p>
        <Button type="button" variant="outline" onClick={onRetry} className="mt-5">
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden />
          Réessayer
        </Button>
      </CardContent>
    </Card>
  );
}
