import { X, Filter, Check } from 'lucide-react';
import { Chip } from '@/components/common/Chip';
import { cn } from '@/utils/cn';

interface SkillFilterProps {
  skills: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function SkillFilter({ skills, selected, onChange }: SkillFilterProps) {
  if (skills.length === 0) return null;

  const toggle = (skill: string) => {
    onChange(
      selected.includes(skill)
        ? selected.filter((s) => s !== skill)
        : [...selected, skill]
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Filter size={14} className="text-odc-primary" />
        <span className="text-xs font-semibold text-odc-text-light dark:text-odc-text-dark uppercase tracking-wider">
          Compétences
        </span>
        {selected.length > 0 && (
          <button
            onClick={() => onChange([])}
            className="ml-auto flex items-center gap-1 text-xs text-odc-error hover:underline"
          >
            <X size={10} />
            Effacer ({selected.length})
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {skills.slice(0, 20).map((skill) => {
          const isSelected = selected.includes(skill);
          return (
            <button
              key={skill}
              onClick={() => toggle(skill)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                isSelected
                  ? 'bg-odc-primary text-white shadow-odc-sm'
                  : 'bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark text-odc-text-light dark:text-odc-text-dark hover:bg-odc-primary-soft'
              )}
            >
              {isSelected && <Check size={10} />}
              {skill}
            </button>
          );
        })}
      </div>
    </div>
  );
}