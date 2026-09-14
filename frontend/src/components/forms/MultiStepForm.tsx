import { ReactNode, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Save } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Stepper } from '@/components/common/Stepper';
import { cn } from '@/utils/cn';

export interface FormStep {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  content: ReactNode;
  validation?: () => boolean | Promise<boolean>;
}

export interface MultiStepFormProps {
  steps: FormStep[];
  onSubmit: () => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  className?: string;
  persistKey?: string;
}

export function MultiStepForm({
  steps,
  onSubmit,
  onCancel,
  submitLabel = 'Terminer',
  cancelLabel = 'Annuler',
  loading = false,
  className,
  persistKey,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = async () => {
    const step = steps[currentStep];

    // Valider l'étape
    if (step.validation) {
      const valid = await step.validation();
      if (!valid) return;
    }

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }

    if (isLastStep) {
      await onSubmit();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) setCurrentStep(currentStep - 1);
  };

  const handleStepClick = (index: number) => {
    // Permettre d'aller à une étape déjà complétée
    if (completedSteps.includes(index) || index < currentStep) {
      setCurrentStep(index);
    }
  };

  const stepperSteps = steps.map((s) => ({
    id: s.id,
    label: s.label,
    description: s.description,
  }));

  return (
    <div className={cn('w-full', className)}>
      {/* Stepper */}
      <div className="mb-8">
        <Stepper steps={stepperSteps} currentStep={currentStep} />
      </div>

      {/* Contenu de l'étape */}
      <div className="bg-white dark:bg-odc-surface-dark rounded-2xl border border-odc-border-light dark:border-odc-border-dark p-6 mb-6 min-h-[300px]">
        <div className="animate-fade-in">
          <div className="mb-6">
            <h2 className="font-heading text-xl font-bold text-odc-text-light dark:text-odc-text-dark">
              {steps[currentStep].label}
            </h2>
            {steps[currentStep].description && (
              <p className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark mt-1">
                {steps[currentStep].description}
              </p>
            )}
          </div>

          {steps[currentStep].content}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <div>
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Progress text */}
          <span className="text-sm text-odc-text-muted-light dark:text-odc-text-muted-dark">
            Étape {currentStep + 1} sur {steps.length}
          </span>

          {/* Bouton retour */}
          {!isFirstStep && (
            <Button
              variant="secondary"
              onClick={handlePrev}
              disabled={loading}
              icon={<ChevronLeft size={16} />}
            >
              Retour
            </Button>
          )}

          {/* Bouton suivant / terminer */}
          <Button
            variant="primary"
            onClick={handleNext}
            loading={loading}
            icon={isLastStep ? <Check size={16} /> : <ChevronRight size={16} />}
            iconRight={!isLastStep ? undefined : undefined}
          >
            {isLastStep ? submitLabel : 'Suivant'}
          </Button>
        </div>
      </div>
    </div>
  );
}