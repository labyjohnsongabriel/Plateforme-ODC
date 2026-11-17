// src/app/(participant)/participant/attestations/components/AttestationsList.tsx
'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Award,
  Download,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Hash,
  Search,
  X,
  Filter,
  TrendingUp,
  Percent,
  Loader2,
  AlertCircle,
  GraduationCap,
  ShieldCheck,
  Mail,
  Target,
  Star,
  Trophy,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QueryErrorState } from '@/components/shared/QueryErrorState';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/formatters';
import { getErrorMessage } from '@/lib/error-handler';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Attestation {
  id: string;
  numero: string;
  valide: boolean;
  dateEmission?: string | null;
  noteFinale?: number | null;
  tauxPresence?: number | null;
  session?: {
    id?: string;
    codeSession?: string;
    formation?: { titre?: string | null } | null;
  } | null;
}

type FilterStatut = 'all' | 'valide' | 'invalide';

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function extractAttestations(data: unknown): Attestation[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as Attestation[];
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as Attestation[];
    if (obj.data && typeof obj.data === 'object') {
      const nested = obj.data as Record<string, unknown>;
      for (const key of ['attestations', 'data', 'items', 'results']) {
        if (Array.isArray(nested[key])) return nested[key] as Attestation[];
      }
    }
    for (const key of ['attestations', 'items', 'results']) {
      if (Array.isArray(obj[key])) return obj[key] as Attestation[];
    }
  }
  return [];
}

/* ─── Palette sémantique pour les notes (système français) ─── */
interface NoteConfig {
  label: string;
  Icon: React.ElementType;
  stroke: string;
  track: string;
  text: string;
  badge: string;
}

function getNoteConfig(note: number): NoteConfig {
  if (note >= 16) {
    return {
      label: 'Excellent',
      Icon: Trophy,
      stroke: 'text-emerald-500',
      track: 'text-emerald-100 dark:text-emerald-500/15',
      text: 'text-emerald-700 dark:text-emerald-300',
      badge:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    };
  }
  if (note >= 14) {
    return {
      label: 'Très Bien',
      Icon: Star,
      stroke: 'text-emerald-500',
      track: 'text-emerald-100 dark:text-emerald-500/15',
      text: 'text-emerald-700 dark:text-emerald-300',
      badge:
        'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
    };
  }
  if (note >= 12) {
    return {
      label: 'Bien',
      Icon: Sparkles,
      stroke: 'text-sky-500',
      track: 'text-sky-100 dark:text-sky-500/15',
      text: 'text-sky-700 dark:text-sky-300',
      badge:
        'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
    };
  }
  if (note >= 10) {
    return {
      label: 'Passable',
      Icon: CheckCircle2,
      stroke: 'text-amber-500',
      track: 'text-amber-100 dark:text-amber-500/15',
      text: 'text-amber-700 dark:text-amber-300',
      badge:
        'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300',
    };
  }
  return {
    label: 'Insuffisant',
    Icon: AlertTriangle,
    stroke: 'text-rose-500',
    track: 'text-rose-100 dark:text-rose-500/15',
    text: 'text-rose-700 dark:text-rose-300',
    badge:
      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300',
  };
}

/* ─── Palette sémantique pour la présence ─── */
function getPresenceConfig(value: number) {
  if (value >= 90) {
    return {
      bar: 'from-emerald-400 to-emerald-600',
      text: 'text-emerald-700 dark:text-emerald-300',
    };
  }
  if (value >= 75) {
    return {
      bar: 'from-sky-400 to-sky-600',
      text: 'text-sky-700 dark:text-sky-300',
    };
  }
  if (value >= 50) {
    return {
      bar: 'from-amber-400 to-amber-600',
      text: 'text-amber-700 dark:text-amber-300',
    };
  }
  return {
    bar: 'from-rose-400 to-rose-600',
    text: 'text-rose-700 dark:text-rose-300',
  };
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════════════════════════════════════ */

export function AttestationsList() {
  const [search, setSearch] = useState('');
  const [filterStatut, setFilterStatut] = useState<FilterStatut>('all');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);

  /* ─── Query ─── */
  const { data, isLoading, isError, refetch, isFetching } = useQuery<Attestation[]>({
    queryKey: ['participant', 'attestations'],
    queryFn: async () => {
      const response = await api.get('/participant/attestations');
      return extractAttestations(response.data?.data ?? response.data);
    },
    staleTime: 60_000,
    retry: 1,
  });

  /* ─── Mutation download ─── */
  const downloadMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.get(`/participant/attestations/${id}/telecharger`, {
        responseType: 'blob',
      });
      return response.data as Blob;
    },
    onSuccess: (blob, id) => {
      const att = (data ?? []).find((a) => a.id === id);
      const url = URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `attestation-${att?.numero ?? id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success('Téléchargement démarré');
      setDownloading(null);
    },
    onError: (e) => {
      toast.error(getErrorMessage(e));
      setDownloading(null);
    },
  });

  /* ─── Mutation envoi email ─── */
  const emailMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(`/participant/attestations/${id}/envoyer`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('📧 Attestation envoyée à votre adresse email', {
        duration: 5000,
      });
      setSendingEmail(null);
    },
    onError: (e) => {
      toast.error(
        getErrorMessage(e) || "Impossible d'envoyer l'email. Réessayez plus tard.",
        { duration: 5000 },
      );
      setSendingEmail(null);
    },
  });

  const handleDownload = (id: string) => {
    setDownloading(id);
    downloadMutation.mutate(id);
  };

  const handleSendEmail = (id: string) => {
    setSendingEmail(id);
    emailMutation.mutate(id);
  };

  const attestations = data ?? [];

  /* ─── Statistiques ─── */
  const stats = useMemo(() => {
    const total = attestations.length;
    const valides = attestations.filter((a) => a.valide).length;

    const notes = attestations
      .map((a) => a.noteFinale)
      .filter((n): n is number => typeof n === 'number');
    const moyenne = notes.length
      ? notes.reduce((s, n) => s + n, 0) / notes.length
      : null;

    const presences = attestations
      .map((a) => a.tauxPresence)
      .filter((n): n is number => typeof n === 'number');
    const presenceMoyenne = presences.length
      ? presences.reduce((s, n) => s + n, 0) / presences.length
      : null;

    return { total, valides, moyenne, presenceMoyenne };
  }, [attestations]);

  /* ─── Filtrage ─── */
  const filteredAttestations = useMemo(() => {
    const q = search.trim().toLowerCase();

    return attestations.filter((a) => {
      if (filterStatut === 'valide' && !a.valide) return false;
      if (filterStatut === 'invalide' && a.valide) return false;
      if (!q) return true;

      return (
        (a.numero ?? '').toLowerCase().includes(q) ||
        (a.session?.formation?.titre ?? '').toLowerCase().includes(q) ||
        (a.session?.codeSession ?? '').toLowerCase().includes(q)
      );
    });
  }, [attestations, search, filterStatut]);

  /* ─── Loading ─── */
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  /* ─── Erreur ─── */
  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <QueryErrorState onRetry={() => void refetch()} isRetrying={isFetching} />
        </CardContent>
      </Card>
    );
  }

  /* ─── Vide ─── */
  if (attestations.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <EmptyState
            icon={Award}
            title="Aucune attestation"
            description="Vos attestations apparaîtront ici dès que vous aurez validé une formation."
          />
        </CardContent>
      </Card>
    );
  }

  /* ─── Rendu principal ─── */
  return (
    <div className="space-y-6">
      {/* ═══ Statistiques globales ═══ */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={GraduationCap} label="Total" value={stats.total} tone="primary" />
        <StatCard
          icon={ShieldCheck}
          label="Validées"
          value={stats.valides}
          tone="success"
          suffix={`/ ${stats.total}`}
        />
        <StatCard
          icon={TrendingUp}
          label="Moyenne générale"
          value={stats.moyenne != null ? stats.moyenne.toFixed(1) : '—'}
          tone="info"
          suffix={stats.moyenne != null ? '/20' : undefined}
        />
        <StatCard
          icon={Percent}
          label="Présence moyenne"
          value={stats.presenceMoyenne != null ? Math.round(stats.presenceMoyenne) : '—'}
          tone="purple"
          suffix={stats.presenceMoyenne != null ? '%' : undefined}
        />
      </div>

      {/* ═══ Filtres ═══ */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Rechercher par numéro ou formation…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-8"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Effacer la recherche"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" aria-hidden />
          <Select
            value={filterStatut}
            onValueChange={(v) => setFilterStatut(v as FilterStatut)}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes ({stats.total})</SelectItem>
              <SelectItem value="valide">Validées ({stats.valides})</SelectItem>
              <SelectItem value="invalide">
                Invalidées ({stats.total - stats.valides})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {filteredAttestations.length}
          </span>{' '}
          attestation{filteredAttestations.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* ═══ Grille ═══ */}
      {filteredAttestations.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <EmptyState
              icon={Search}
              title="Aucun résultat"
              description="Aucune attestation ne correspond à vos filtres."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setFilterStatut('all');
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAttestations.map((a) => (
            <AttestationCard
              key={a.id}
              attestation={a}
              onDownload={handleDownload}
              onSendEmail={handleSendEmail}
              isDownloading={downloading === a.id}
              isSendingEmail={sendingEmail === a.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   STAT CARD
   ═══════════════════════════════════════════════════════════════════════════ */

type Tone = 'primary' | 'success' | 'info' | 'purple';

const TONES: Record<Tone, { iconBg: string; iconColor: string; ring: string; bar: string }> = {
  primary: {
    iconBg: 'bg-primary/10 dark:bg-primary/15',
    iconColor: 'text-primary',
    ring: 'ring-primary/20',
    bar: 'from-primary to-primary/60',
  },
  success: {
    iconBg: 'bg-emerald-50 dark:bg-emerald-500/10',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    ring: 'ring-emerald-200 dark:ring-emerald-500/30',
    bar: 'from-emerald-400 to-emerald-600',
  },
  info: {
    iconBg: 'bg-sky-50 dark:bg-sky-500/10',
    iconColor: 'text-sky-700 dark:text-sky-300',
    ring: 'ring-sky-200 dark:ring-sky-500/30',
    bar: 'from-sky-400 to-sky-600',
  },
  purple: {
    iconBg: 'bg-violet-50 dark:bg-violet-500/10',
    iconColor: 'text-violet-700 dark:text-violet-300',
    ring: 'ring-violet-200 dark:ring-violet-500/30',
    bar: 'from-violet-400 to-violet-600',
  },
};

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  suffix?: string;
  tone: Tone;
}) {
  const t = TONES[tone];
  const isEmpty = value === '—' || value === 0;

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
      <span
        aria-hidden
        className={cn(
          'absolute inset-x-0 top-0 h-1 bg-gradient-to-r',
          t.bar,
          'opacity-60 transition-opacity group-hover:opacity-100',
        )}
      />
      <CardContent className="flex items-center gap-3 p-4 pt-5">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 transition-transform group-hover:scale-110',
            t.iconBg,
            t.iconColor,
            t.ring,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <div className="min-w-0">
          <p
            className={cn(
              'font-display text-2xl font-bold tabular-nums leading-none',
              isEmpty ? 'text-muted-foreground/60' : 'text-foreground',
            )}
          >
            {value}
            {suffix && (
              <span className="ml-0.5 text-sm font-normal text-muted-foreground">
                {suffix}
              </span>
            )}
          </p>
          <p className="mt-1 truncate text-xs font-medium text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ⭐ NOTE RING — Anneau radial SVG
   ═══════════════════════════════════════════════════════════════════════════ */

function NoteRing({ note, size = 96 }: { note: number; size?: number }) {
  const config = getNoteConfig(note);
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.max(0, Math.min(100, (note / 20) * 100));
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      aria-label={`Moyenne ${note.toFixed(1)} sur 20`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        {/* Piste de fond */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={config.track}
        />
        {/* Arc de progression */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn('transition-all duration-1000 ease-out', config.stroke)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            'font-display text-xl font-bold tabular-nums leading-none',
            config.text,
          )}
        >
          {note.toFixed(1)}
        </span>
        <span className="mt-0.5 text-[10px] font-medium text-muted-foreground">
          / 20
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ⭐ PRESENCE BAR — Barre de progression
   ═══════════════════════════════════════════════════════════════════════════ */

function PresenceBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  const config = getPresenceConfig(pct);
  const threshold = 75;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Target className="h-3 w-3" aria-hidden />
          Présence
        </span>
        <span
          className={cn(
            'font-display text-lg font-bold tabular-nums leading-none',
            config.text,
          )}
        >
          {Math.round(pct)}
          <span className="ml-0.5 text-xs font-normal text-muted-foreground">%</span>
        </span>
      </div>

      <div
        className="relative h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Taux de présence ${Math.round(pct)}%`}
      >
        <div
          className={cn(
            'absolute inset-y-0 left-0 rounded-full bg-gradient-to-r transition-all duration-1000 ease-out',
            config.bar,
          )}
          style={{ width: `${pct}%` }}
        />
        {/* Seuil 75% */}
        <div
          className="absolute inset-y-0 w-px bg-background/70 dark:bg-background/50"
          style={{ left: `${threshold}%` }}
          title={`Seuil minimal : ${threshold}%`}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>0%</span>
        <span className={cn(pct < threshold && 'font-medium text-amber-600 dark:text-amber-400')}>
          Seuil : {threshold}%
        </span>
        <span>100%</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ⭐ MENTION BADGE
   ═══════════════════════════════════════════════════════════════════════════ */

function MentionBadge({ note }: { note: number }) {
  const config = getNoteConfig(note);
  const Icon = config.Icon;

  return (
    <Badge
      className={cn(
        'inline-flex items-center gap-1.5 border px-2.5 py-1 text-[11px] font-semibold',
        config.badge,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {config.label}
    </Badge>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ATTESTATION CARD
   ═══════════════════════════════════════════════════════════════════════════ */

function AttestationCard({
  attestation: a,
  onDownload,
  onSendEmail,
  isDownloading,
  isSendingEmail,
}: {
  attestation: Attestation;
  onDownload: (id: string) => void;
  onSendEmail: (id: string) => void;
  isDownloading: boolean;
  isSendingEmail: boolean;
}) {
  const hasNote = typeof a.noteFinale === 'number' && Number.isFinite(a.noteFinale);
  const hasPresence =
    typeof a.tauxPresence === 'number' && Number.isFinite(a.tauxPresence);

  return (
    <Card
      className={cn(
        'group flex flex-col overflow-hidden transition-all duration-300',
        'hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md',
        !a.valide && 'opacity-75',
      )}
    >
      <div
        className={cn(
          'h-2 bg-gradient-to-r',
          a.valide ? 'from-violet-400 to-violet-600' : 'from-gray-300 to-gray-500',
        )}
      />

      <CardContent className="flex flex-1 flex-col p-5">
        {/* ═══ En-tête ═══ */}
        <div className="mb-4 flex items-start gap-3">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ring-1',
              a.valide
                ? 'bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-500/30'
                : 'bg-muted text-muted-foreground ring-border',
            )}
          >
            <Award className="h-6 w-6" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 font-display font-semibold text-foreground transition-colors group-hover:text-primary">
              {a.session?.formation?.titre ?? 'Formation'}
            </h3>
            <p className="mt-1 flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
              <Hash className="h-3 w-3" aria-hidden />
              {a.numero}
            </p>
          </div>
        </div>

        {/* ═══ Bloc performance ═══ */}
        {hasNote || hasPresence ? (
          <div className="mb-4 grid grid-cols-[auto_1fr] items-center gap-4 rounded-xl border border-border bg-gradient-to-br from-muted/40 to-muted/10 p-3">
            {hasNote ? (
              <NoteRing note={a.noteFinale!} size={92} />
            ) : (
              <div className="flex h-[92px] w-[92px] shrink-0 flex-col items-center justify-center rounded-full border-2 border-dashed border-border text-center">
                <span className="font-display text-xl font-bold text-muted-foreground/60">
                  —
                </span>
                <span className="mt-0.5 text-[10px] text-muted-foreground">/ 20</span>
              </div>
            )}

            <div className="min-w-0 space-y-3">
              {hasNote && (
                <div>
                  <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Mention
                  </p>
                  <MentionBadge note={a.noteFinale!} />
                </div>
              )}
              {hasPresence && <PresenceBar value={a.tauxPresence!} />}
            </div>
          </div>
        ) : (
          <div className="mb-4 rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Aucune donnée de performance disponible
            </p>
          </div>
        )}

        {/* ═══ Pied : date + statut ═══ */}
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 tabular-nums">
            <Calendar className="h-3 w-3" aria-hidden />
            {formatDate(a.dateEmission)}
          </span>
          {a.valide ? (
            <Badge className="inline-flex items-center gap-1 border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 className="h-3 w-3" aria-hidden />
              Valide
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 border-red-200 text-red-700 dark:border-red-500/30 dark:text-red-300"
            >
              <AlertCircle className="h-3 w-3" aria-hidden />
              Invalide
            </Badge>
          )}
        </div>

        {/* ═══ Actions ═══ */}
        <div className="mt-auto flex gap-2">
          <Button
            size="sm"
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onDownload(a.id)}
            disabled={isDownloading || !a.valide}
          >
            {isDownloading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" aria-hidden />
            ) : (
              <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            )}
            {isDownloading ? 'Téléchargement…' : 'Télécharger'}
          </Button>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onSendEmail(a.id)}
                  disabled={isSendingEmail || !a.valide}
                  aria-label="M'envoyer par email"
                >
                  {isSendingEmail ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : (
                    <Mail className="h-3.5 w-3.5" aria-hidden />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isSendingEmail ? 'Envoi en cours…' : 'Recevoir par email'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  asChild
                  aria-label={`Vérifier l'attestation ${a.numero}`}
                >
                  <a
                    href={`/verifier-attestation/${a.numero}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Vérifier en ligne</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}