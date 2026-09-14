import { Search, X, LayoutGrid, List, Filter } from 'lucide-react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Chip } from '@/components/common/Chip';
import { Select } from '@/components/common/Select';
import { NiveauFormation } from '../types/formation.types';
import { FormationService } from '../services/formation.service';
import { cn } from '@/utils/cn';

interface FormationFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  domaine?: string;
  onDomaineChange: (domaine?: string) => void;
  niveau?: NiveauFormation;
  onNiveauChange: (niveau?: NiveauFormation) => void;
  view?: 'grid' | 'list';
  onViewChange?: (view: 'grid' | 'list') => void;
  onReset: () => void;
}

export function FormationFilters({
  search,
  onSearchChange,
  domaine,
  onDomaineChange,
  niveau,
  onNiveauChange,
  view = 'grid',
  onViewChange,
  onReset,
}: FormationFiltersProps) {
  const hasFilters = !!(search || domaine || niveau);
  const domaines = FormationService.getDomaines();

  return (
    <div className="space-y-4">
      {/* Search + toggle */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            placeholder="Rechercher une formation..."
            icon={<Search size={18} />}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            iconRight={
              hasFilters ? (
                <button
                  onClick={onReset}
                  className="text-odc-text-muted-light hover:text-odc-error transition-colors"
                >
                  <X size={16} />
                </button>
              ) : undefined
            }
          />
        </div>

        {onViewChange && (
          <div className="flex items-center gap-1 p-1 rounded-xl bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark">
            <button
              onClick={() => onViewChange('grid')}
              className={cn(
                'p-2 rounded-lg transition-all',
                view === 'grid'
                  ? 'bg-white dark:bg-odc-surface-dark text-odc-primary shadow-sm'
                  : 'text-odc-text-muted-light dark:text-odc-text-muted-dark'
              )}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => onViewChange('list')}
              className={cn(
                'p-2 rounded-lg transition-all',
                view === 'list'
                  ? 'bg-white dark:bg-odc-surface-dark text-odc-primary shadow-sm'
                  : 'text-odc-text-muted-light dark:text-odc-text-muted-dark'
              )}
            >
              <List size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Domaines */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="flex-shrink-0 text-xs font-medium text-odc-text-muted-light dark:text-odc-text-muted-dark">
          <Filter size={12} className="inline mr-1" />
          Domaines :
        </span>
        <Chip
          variant={!domaine ? 'primary' : 'default'}
          onClick={() => onDomaineChange(undefined)}
          selected={!domaine}
        >
          Tous
        </Chip>
        {domaines.map((d) => (
          <Chip
            key={d.value}
            variant={domaine === d.value ? 'primary' : 'default'}
            onClick={() => onDomaineChange(domaine === d.value ? undefined : d.value)}
            selected={domaine === d.value}
          >
            {d.label}
          </Chip>
        ))}
      </div>

      {/* Niveau + reset */}
      <div className="flex items-center gap-3">
        <div className="w-full md:w-64">
          <Select
            value={niveau || ''}
            onChange={(e) => onNiveauChange((e.target.value as NiveauFormation) || undefined)}
            options={[
              { value: '', label: 'Tous les niveaux' },
              { value: NiveauFormation.DEBUTANT, label: 'Débutant' },
              { value: NiveauFormation.INTERMEDIAIRE, label: 'Intermédiaire' },
              { value: NiveauFormation.AVANCE, label: 'Avancé' },
            ]}
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} icon={<X size={14} />}>
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  );
}