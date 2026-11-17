import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendChipProps {
  /** Variation en pourcentage (ex. 12.5 ou -3). Le sens de la flèche suit son signe. */
  value: number;
  /**
   * Jugement métier : une baisse peut être une bonne nouvelle (ex. « erreurs »).
   * Si omis : hausse = favorable, baisse = défavorable.
   */
  isPositive?: boolean;
  periodLabel?: string;
  className?: string;
}

const numberFormat = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });

/**
 * Tons sémantiques : couleur = jugement, pas direction.
 * Pattern : fond `*-50` en light, `*-500/10` en dark ; texte `*-700` en light, `*-300` en dark.
 */
const TONES = {
  good:
    'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 ' +
    'dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30',
  bad:
    'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200 ' +
    'dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30',
  flat:
    'bg-muted text-muted-foreground ring-1 ring-inset ring-border',
} as const;

/**
 * Pastille de tendance. Le sens est porté par l'icône ET le signe
 * (jamais par la couleur seule) ; un texte masqué le lit aux lecteurs d'écran.
 */
export function TrendChip({
  value,
  isPositive,
  periodLabel = 'par rapport à la période précédente',
  className,
}: TrendChipProps) {
  const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
  const Icon = direction === 'up' ? TrendingUp : direction === 'down' ? TrendingDown : Minus;

  const sentiment: keyof typeof TONES =
    direction === 'flat'
      ? 'flat'
      : typeof isPositive === 'boolean'
        ? isPositive
          ? 'good'
          : 'bad'
        : direction === 'up'
          ? 'good'
          : 'bad';

  const absolute = numberFormat.format(Math.abs(value));
  const visible = `${direction === 'up' ? '+' : direction === 'down' ? '−' : ''}${absolute} %`;
  const spoken =
    direction === 'up'
      ? `Hausse de ${absolute} %`
      : direction === 'down'
        ? `Baisse de ${absolute} %`
        : 'Aucune variation';
  const judgement =
    sentiment === 'good' ? ', favorable' : sentiment === 'bad' ? ', défavorable' : '';

  return (
    <span
      title={`${spoken}${judgement} ${periodLabel}`}
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums',
        TONES[sentiment],
        className,
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      <span aria-hidden="true">{visible}</span>
      <span className="sr-only">
        {spoken}
        {judgement} {periodLabel}
      </span>
    </span>
  );
}