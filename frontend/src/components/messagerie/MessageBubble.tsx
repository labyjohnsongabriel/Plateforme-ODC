// src/components/messagerie/MessageBubble.tsx
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCheck, Clock } from 'lucide-react';
import { getInitials, cn } from '@/lib/utils';
import { formatTime } from '@/lib/formatters';

/* ═══════════════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════════════ */

interface Props {
  message: any;
  isMine: boolean;
  showAvatar?: boolean;
  compact?: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'pending';
}

/* ═══════════════════════════════════════════════════════════════════════════
   ⭐ COULEURS STABLES PAR UTILISATEUR (groupes)
   Palette de 8 couleurs accessibles, dérivées de l'ID expéditeur
   ═══════════════════════════════════════════════════════════════════════════ */

const USER_COLORS = [
  { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-300', ring: 'ring-emerald-200 dark:ring-emerald-500/30' },
  { bg: 'bg-sky-100 dark:bg-sky-500/15',         text: 'text-sky-700 dark:text-sky-300',         ring: 'ring-sky-200 dark:ring-sky-500/30' },
  { bg: 'bg-violet-100 dark:bg-violet-500/15',   text: 'text-violet-700 dark:text-violet-300',   ring: 'ring-violet-200 dark:ring-violet-500/30' },
  { bg: 'bg-rose-100 dark:bg-rose-500/15',       text: 'text-rose-700 dark:text-rose-300',       ring: 'ring-rose-200 dark:ring-rose-500/30' },
  { bg: 'bg-amber-100 dark:bg-amber-500/15',     text: 'text-amber-700 dark:text-amber-300',     ring: 'ring-amber-200 dark:ring-amber-500/30' },
  { bg: 'bg-teal-100 dark:bg-teal-500/15',       text: 'text-teal-700 dark:text-teal-300',       ring: 'ring-teal-200 dark:ring-teal-500/30' },
  { bg: 'bg-indigo-100 dark:bg-indigo-500/15',   text: 'text-indigo-700 dark:text-indigo-300',   ring: 'ring-indigo-200 dark:ring-indigo-500/30' },
  { bg: 'bg-pink-100 dark:bg-pink-500/15',       text: 'text-pink-700 dark:text-pink-300',       ring: 'ring-pink-200 dark:ring-pink-500/30' },
];

function getUserColor(userId?: string) {
  if (!userId) return USER_COLORS[0];
  const hash = userId
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return USER_COLORS[hash % USER_COLORS.length];
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPOSANT
   ═══════════════════════════════════════════════════════════════════════════ */

export function MessageBubble({
  message,
  isMine,
  showAvatar,
  compact = false,
  status,
}: Props) {
  const senderName = `${message.expediteur?.prenom ?? ''} ${
    message.expediteur?.nom ?? ''
  }`.trim();

  const color = getUserColor(message.expediteurId);

  return (
    <div
      className={cn(
        'flex max-w-[80%] items-end gap-2',
        isMine ? 'ml-auto flex-row-reverse' : 'mr-auto',
        compact ? 'mt-0.5' : 'mt-3',
      )}
    >
      {/* ═══ AVATAR (groupe uniquement, côté autre) ═══ */}
      {showAvatar && !isMine && (
        <div className="w-7 shrink-0">
          {!compact ? (
            <Avatar
              className={cn(
                'h-7 w-7 ring-1',
                color.ring,
              )}
            >
              <AvatarImage src={message.expediteur?.photoUrl ?? undefined} />
              <AvatarFallback
                className={cn(
                  'text-[10px] font-bold',
                  color.bg,
                  color.text,
                )}
              >
                {getInitials(
                  message.expediteur?.nom ?? '',
                  message.expediteur?.prenom ?? '',
                )}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="h-7 w-7" aria-hidden />
          )}
        </div>
      )}

      {/* ═══ CONTENU ═══ */}
      <div
        className={cn(
          'flex min-w-0 flex-col',
          isMine ? 'items-end' : 'items-start',
        )}
      >
        {/* Nom expéditeur (groupe, première bulle) */}
        {showAvatar && !isMine && !compact && senderName && (
          <p
            className={cn(
              'mb-0.5 px-1 text-[11px] font-semibold',
              color.text,
            )}
          >
            {senderName}
          </p>
        )}

        {/* ═══ BULLE ═══ */}
        <div
          className={cn(
            // Base commune
            'max-w-full break-words px-3.5 py-2 text-sm shadow-sm',
            'leading-relaxed whitespace-pre-wrap',
            // Coins asymétriques (queue pointant vers l'avatar)
            'rounded-2xl',
            isMine ? 'rounded-br-md' : 'rounded-bl-md',
            compact && (isMine ? 'rounded-tr-md' : 'rounded-tl-md'),

            // ⭐ EXPÉDITEUR — Dégradé chaud brand
            isMine && [
              'bg-gradient-to-br',
              'from-[#FF8B2E] to-[#E65100]',
              'dark:from-[#FF8B2E] dark:to-[#B23E00]',
              'text-white',
              'shadow-[0_2px_8px_-2px_rgba(230,81,0,0.4)]',
              'dark:shadow-[0_2px_8px_-2px_rgba(230,81,0,0.6)]',
              'border border-[#FF7900]/20',
            ],

            // ⭐ DESTINATAIRE — Surface neutre
            !isMine && [
              'bg-white dark:bg-slate-800',
              'text-slate-900 dark:text-slate-100',
              'border border-slate-200 dark:border-slate-700',
              'shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
              'dark:shadow-[0_1px_2px_rgba(0,0,0,0.2)]',
            ],
          )}
        >
          {message.contenu}
        </div>

        {/* ═══ TIMESTAMP + STATUT ═══ */}
        <div
          className={cn(
            'mt-1 flex items-center gap-1 px-1',
            isMine && 'flex-row-reverse',
          )}
        >
          <span
            className={cn(
              'text-[10px] tabular-nums',
              isMine
                ? 'text-slate-500 dark:text-slate-400'
                : 'text-slate-400 dark:text-slate-500',
            )}
          >
            {formatTime(message.createdAt)}
          </span>

          {isMine && status && (
            <>
              {status === 'pending' && (
                <Clock
                  className="h-2.5 w-2.5 text-slate-400"
                  aria-label="Envoi en cours"
                />
              )}
              {status === 'sent' && (
                <CheckCheck
                  className="h-2.5 w-2.5 text-slate-400"
                  aria-label="Envoyé"
                />
              )}
              {status === 'delivered' && (
                <CheckCheck
                  className="h-2.5 w-2.5 text-primary"
                  aria-label="Distribué"
                />
              )}
              {status === 'read' && (
                <CheckCheck
                  className="h-2.5 w-2.5 text-primary"
                  aria-label="Lu"
                />
              )}
            </>
          )}

          {isMine && !status && (
            <CheckCheck
              className="h-2.5 w-2.5 text-primary/70"
              aria-label="Envoyé"
            />
          )}
        </div>
      </div>
    </div>
  );
}