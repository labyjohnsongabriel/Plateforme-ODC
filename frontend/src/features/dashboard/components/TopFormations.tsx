import { BookOpen, TrendingUp } from 'lucide-react';
import { cn } from '@/utils/cn';

// ============================================================================
//  TYPES
// ============================================================================

export interface TopFormationItem {
  titre: string;
  inscriptions: string | number;
}

export interface TopFormationsProps {
  formations: TopFormationItem[];
  title?: string;
  className?: string;
}

// ============================================================================
//  COMPONENT
// ============================================================================

export function TopFormations({
  formations,
  title = 'Top formations',
  className,
}: TopFormationsProps) {
  if (!formations || formations.length === 0) {
    return (
      <div
        className={cn(
          'bg-white dark:bg-odc-surface-dark rounded-xl border border-odc-border-light dark:border-odc-border-dark p-5',
          className
        )}
      >
        <h3 className="font-heading font-semibold text-sm mb-4 text-odc-text-light dark:text-odc-text-dark">
          {title}
        </h3>
        <div className="flex items-center justify-center h-32 text-sm text-odc-text-muted-light">
          Aucune donnée
        </div>
      </div>
    );
  }

  const maxValue = Math.max(
    ...formations.map((f) => Number(f.inscriptions) || 0)
  );

  return (
    <div
      className={cn(
        'bg-white dark:bg-odc-surface-dark rounded-xl border border-odc-border-light dark:border-odc-border-dark p-5',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-odc-primary" />
        <h3 className="font-heading font-semibold text-sm text-odc-text-light dark:text-odc-text-dark">
          {title}
        </h3>
      </div>

      <div className="space-y-3">
        {formations.map((formation, index) => {
          const value = Number(formation.inscriptions) || 0;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

          return (
            <div key={`${formation.titre}-${index}`} className="group">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-odc-primary/10 text-odc-primary text-[10px] font-bold shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-xs font-medium text-odc-text-light dark:text-odc-text-dark truncate">
                    {formation.titre}
                  </span>
                </div>
                <span className="text-xs font-bold text-odc-primary shrink-0 ml-2">
                  {value}
                </span>
              </div>

              <div className="h-1.5 bg-odc-border-light/40 dark:bg-odc-border-dark/40 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-odc-primary to-odc-primary-dark rounded-full transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {formations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-odc-text-muted-light">
          <BookOpen size={32} className="mb-2 opacity-50" />
          <p className="text-xs">Aucune formation</p>
        </div>
      )}
    </div>
  );
}

export default TopFormations;