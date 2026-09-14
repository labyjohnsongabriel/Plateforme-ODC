import { Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface Step {
  id: string | number;
  label: string;
  description?: string;
}

export interface StepperProps {
  steps: Step[];
  currentStep: number;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Stepper({ steps, currentStep, orientation = 'horizontal', className }: StepperProps) {
  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        {steps.map((step, i) => {
          const isCompleted = i < currentStep;
          const isActive = i === currentStep;

          return (
            <div key={step.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0',
                    isCompleted && 'bg-odc-primary text-white',
                    isActive && 'bg-odc-primary-soft text-odc-primary-dark ring-2 ring-odc-primary',
                    !isCompleted && !isActive && 'bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark text-odc-text-muted-light'
                  )}
                >
                  {isCompleted ? <Check size={16} /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-0.5 flex-1 mt-1',
                      isCompleted ? 'bg-odc-primary' : 'bg-odc-border-light dark:bg-odc-border-dark'
                    )}
                  />
                )}
              </div>
              <div className="pb-4">
                <div
                  className={cn(
                    'font-medium',
                    isActive ? 'text-odc-primary' : 'text-odc-text-light dark:text-odc-text-dark'
                  )}
                >
                  {step.label}
                </div>
                {step.description && (
                  <div className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark mt-0.5">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;

        return (
          <div key={step.id} className="flex-1 flex items-center">
            <div className="flex flex-col items-center flex-1">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm',
                  isCompleted && 'bg-odc-primary text-white',
                  isActive && 'bg-odc-primary text-white ring-4 ring-odc-primary/20',
                  !isCompleted && !isActive && 'bg-odc-surface-alt-light dark:bg-odc-surface-alt-dark text-odc-text-muted-light'
                )}
              >
                {isCompleted ? <Check size={18} /> : i + 1}
              </div>
              <div
                className={cn(
                  'mt-2 text-xs font-medium text-center',
                  isActive ? 'text-odc-primary' : 'text-odc-text-muted-light dark:text-odc-text-muted-dark'
                )}
              >
                {step.label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2 mt-[-18px]',
                  isCompleted ? 'bg-odc-primary' : 'bg-odc-border-light dark:bg-odc-border-dark'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}