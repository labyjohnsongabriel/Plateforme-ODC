// src/components/sessions/SessionSelect.tsx
'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  Check,
  Loader2,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  SessionOption,
  formatSessionLabel,
  formatSessionPeriod,
  getSessionStatusBadge,
} from '@/lib/sessions';

/* ============================================================================
   TYPES
   ============================================================================ */

interface Props {
  sessions: SessionOption[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isFetching: boolean;
  onRetry: () => void;
  /** Session référencée en édition mais absente de la liste */
  currentSessionFallback?: { id: string; label?: string };
  required?: boolean;
  /** id externe optionnel. Si absent, un id stable est généré via useId(). */
  id?: string;
  /** Nombre minimum de sessions pour afficher la barre de recherche */
  searchThreshold?: number;
  /** Libellé du champ (défaut : "Session") */
  label?: string;
  /** Désactiver le bouton refresh */
  hideRetry?: boolean;
}

/* ============================================================================
   COMPOSANT
   ============================================================================ */

export function SessionSelect({
  sessions,
  value,
  onChange,
  disabled = false,
  isLoading,
  isError,
  errorMessage,
  isFetching,
  onRetry,
  currentSessionFallback,
  required = true,
  id,
  searchThreshold = 6,
  label = 'Session',
  hideRetry = false,
}: Props) {
  const autoId = useId();
  const triggerId = id ?? `session-select-${autoId}`;
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  /* ---------- Reset recherche à la fermeture ---------- */
  useEffect(() => {
    if (!open) setSearch('');
  }, [open]);

  /* ---------- Focus auto dans la recherche ---------- */
  useEffect(() => {
    if (open && sessions.length >= searchThreshold) {
      const t = setTimeout(() => searchInputRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open, sessions.length, searchThreshold]);

  /* ---------- Déduplication ---------- */
  const uniqueSessions = useMemo(() => {
    const seen = new Set<string>();
    const out: SessionOption[] = [];
    for (const s of sessions) {
      if (!s.id || seen.has(s.id)) continue;
      seen.add(s.id);
      out.push(s);
    }
    return out;
  }, [sessions]);

  /* ---------- Filtrage ---------- */
  const normalizedSearch = search.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!normalizedSearch) return uniqueSessions;
    return uniqueSessions.filter(
      (s) =>
        s.codeSession.toLowerCase().includes(normalizedSearch) ||
        s.formationTitre.toLowerCase().includes(normalizedSearch),
    );
  }, [uniqueSessions, normalizedSearch]);

  /* ---------- Fallback session courante ---------- */
  const currentInList = uniqueSessions.some((s) => s.id === value);
  const showFallback = !!currentSessionFallback && !currentInList;

  /* ---------- Label affiché dans le trigger ---------- */
  const selectedLabel = useMemo(() => {
    // 1. Session présente dans la liste → label complet
    const s = uniqueSessions.find((x) => x.id === value);
    if (s) return formatSessionLabel(s);

    // 2. Session hors liste → fallback
    if (showFallback && currentSessionFallback) {
      const fallbackLabel = currentSessionFallback.label?.trim();
      return fallbackLabel
        ? `${fallbackLabel} (hors liste)`
        : 'Session actuelle (hors liste)';
    }

    return undefined;
  }, [uniqueSessions, value, showFallback, currentSessionFallback]);

  /* ---------- Placeholder ---------- */
  const placeholder = useMemo(() => {
    if (isLoading && uniqueSessions.length === 0) return 'Chargement…';
    if (isError && uniqueSessions.length === 0) return 'Erreur de chargement';
    if (uniqueSessions.length === 0 && !showFallback)
      return 'Aucune session disponible';
    return 'Sélectionnez une session';
  }, [isLoading, isError, uniqueSessions.length, showFallback]);

  /* ---------- États dérivés ---------- */
  const isEmpty = uniqueSessions.length === 0 && !showFallback;
  const showSearchBar = uniqueSessions.length >= searchThreshold;

  // ⚠️ On ne désactive JAMAIS en édition (showFallback protège déjà)
  const isSelectDisabled =
    disabled ||
    isLoading ||
    (isError && uniqueSessions.length === 0) ||
    isEmpty;

  const noSearchResults =
    showSearchBar &&
    normalizedSearch.length > 0 &&
    filtered.length === 0 &&
    !showFallback;

  /* ==========================================================================
     RENDER
     ========================================================================== */
  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <Label htmlFor={triggerId}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>

        {!hideRetry && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRetry}
            disabled={isFetching}
            title="Recharger les sessions"
            aria-label="Recharger les sessions"
            className="h-7 px-2"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`}
              aria-hidden
            />
          </Button>
        )}
      </div>

      {/* SELECT — value TOUJOURS string */}
      <Select
        value={value || ''}
        onValueChange={onChange}
        disabled={isSelectDisabled}
        open={open}
        onOpenChange={setOpen}
      >
        <SelectTrigger
          id={triggerId}
          className="mt-1.5"
          aria-required={required || undefined}
          aria-invalid={isError || undefined}
        >
          {/*
            ⚠️ Affiche le label manuel UNIQUEMENT si la session est hors liste.
            Sinon Radix affiche l'item sélectionné nativement.
          */}
          {showFallback && selectedLabel ? (
            <span className="truncate text-sm">{selectedLabel}</span>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}

          {isFetching && uniqueSessions.length > 0 && (
            <Loader2
              className="h-3 w-3 animate-spin text-muted-foreground"
              aria-hidden
            />
          )}
        </SelectTrigger>

        <SelectContent>
          {/* Barre de recherche */}
          {showSearchBar && (
            <div
              className="sticky top-0 z-10 border-b bg-popover p-2"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
                  aria-hidden
                />
                <Input
                  ref={searchInputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') return;
                    e.stopPropagation();
                  }}
                  placeholder="Rechercher une session…"
                  className="h-8 pr-7 pl-7 text-xs"
                  aria-label="Rechercher une session"
                  autoComplete="off"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Effacer la recherche"
                  >
                    <X className="h-3 w-3" aria-hidden />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && uniqueSessions.length === 0 && (
            <div className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              Chargement des sessions…
            </div>
          )}

          {/* Erreur sans données */}
          {!isLoading && isError && uniqueSessions.length === 0 && (
            <div className="px-3 py-3 text-center text-xs">
              <p className="mb-1.5 flex items-center justify-center gap-1 text-destructive">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                Impossible de charger les sessions
              </p>
              {errorMessage && (
                <p
                  className="mb-2 truncate text-[10px] text-muted-foreground"
                  title={errorMessage}
                >
                  {errorMessage}
                </p>
              )}
              {!hideRetry && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onRetry}
                  disabled={isFetching}
                  className="h-7 text-xs"
                >
                  <RefreshCw
                    className={`mr-1 h-3 w-3 ${isFetching ? 'animate-spin' : ''}`}
                    aria-hidden
                  />
                  Réessayer
                </Button>
              )}
            </div>
          )}

          {/* Vide */}
          {!isLoading && !isError && isEmpty && (
            <div className="px-3 py-4 text-center text-xs text-muted-foreground">
              Aucune session disponible.
              <br />
              <Link
                href="/formateur/sessions"
                className="mt-1 inline-block text-primary underline"
                onClick={() => setOpen(false)}
              >
                Créer une session
              </Link>
            </div>
          )}

          {/* Fallback session courante */}
          {showFallback && currentSessionFallback && (
            <SelectItem value={currentSessionFallback.id}>
              <div className="flex w-full items-center gap-2">
                <span className="flex-1 truncate font-medium">
                  {currentSessionFallback.label?.trim() || 'Session actuelle'}
                </span>
                <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  hors liste
                </span>
              </div>
            </SelectItem>
          )}

          {/* Items filtrés */}
          {!isLoading &&
            !isError &&
            filtered.map((s) => {
              const badge = getSessionStatusBadge(s.statut);
              const period = formatSessionPeriod(s);
              const isSelected = s.id === value;

              return (
                <SelectItem key={s.id} value={s.id}>
                  <div className="flex w-full items-center gap-2">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium">
                        {s.codeSession || '—'}
                        {s.formationTitre && (
                          <span className="font-normal text-muted-foreground">
                            {' '}
                            · {s.formationTitre}
                          </span>
                        )}
                      </span>
                      {period && (
                        <span className="truncate text-[10px] text-muted-foreground">
                          {period}
                        </span>
                      )}
                    </div>
                    {badge && (
                      <span
                        className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                    )}
                    {isSelected && (
                      <Check
                        className="h-3.5 w-3.5 shrink-0 text-primary"
                        aria-hidden
                      />
                    )}
                  </div>
                </SelectItem>
              );
            })}

          {/* Recherche sans résultat */}
          {noSearchResults && (
            <div className="px-3 py-3 text-center text-xs text-muted-foreground">
              Aucun résultat pour « {search} »
            </div>
          )}
        </SelectContent>
      </Select>

      {/* Hint : aucune session */}
      {!isLoading && !isError && isEmpty && (
        <p className="mt-1 flex items-start gap-1 text-xs text-amber-600 dark:text-amber-400">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
          Vous devez d'abord créer une session.
        </p>
      )}

      {/* Hint : liste partielle */}
      {isError && uniqueSessions.length > 0 && (
        <p className="mt-1 flex items-start gap-1 text-xs text-amber-600 dark:text-amber-400">
          <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
          Liste partielle — certaines sessions peuvent manquer.
        </p>
      )}
    </div>
  );
}