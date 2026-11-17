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

const TONES = {
  good: 'bg-odc-success-soft text-odc-success-dark',
  bad: 'bg-odc-error-soft text-odc-error-dark',
  flat: 'bg-odc-surface-alt text-odc-text-secondary',
} as const;

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
  const judgement = sentiment === 'good' ? ', favorable' : sentiment === 'bad' ? ', défavorable' : '';

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