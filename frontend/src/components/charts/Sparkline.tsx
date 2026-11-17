'use client';

import { useId } from 'react';

interface SparklineProps {
  values: number[];
  /**
   * Couleur du trait et du dégradé.
   * ⚠️ Doit être une couleur CSS valide : `hsl(var(--chart-1))`, `#FF7900`, etc.
   * ⚠️ Ne PAS passer `var(--…)` seul si le token stocke des composantes HSL.
   */
  stroke?: string;
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Mini-courbe SVG (sans Recharts) — décorative : la valeur et la tendance
 * sont déjà en texte. `aria-hidden` empêche la double lecture aux lecteurs d'écran.
 */
export function Sparkline({
  values,
  stroke = 'hsl(var(--chart-1))',
  width = 96,
  height = 36,
  className,
}: SparklineProps) {
  const uid = useId().replace(/:/g, '');
  if (values.length < 2) return null;

  const pad = 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const points = values.map((value, index) => ({
    x: (index / (values.length - 1)) * width,
    y: height - pad - ((value - min) / range) * (height - pad * 2),
  }));

  // Lissage par points médians (courbes quadratiques)
  let line = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1];
    const curr = points[i];
    line += ` Q${prev.x},${prev.y} ${(prev.x + curr.x) / 2},${(prev.y + curr.y) / 2}`;
  }
  const last = points[points.length - 1];
  line += ` L${last.x},${last.y}`;

  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${uid}-spark`} x1="0" y1="0" x2="0" y2="1">
          {/* stopColor : préférer style pour un rendu fiable cross-browser avec var(--…) */}
          <stop offset="0%" style={{ stopColor: stroke, stopOpacity: 0.25 }} />
          <stop offset="100%" style={{ stopColor: stroke, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${uid}-spark)`} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Point final : ring pour rester visible sur n'importe quel fond */}
      <circle
        cx={last.x}
        cy={last.y}
        r={2.5}
        fill={stroke}
        stroke="hsl(var(--card))"
        strokeWidth={1.5}
      />
    </svg>
  );
}