import { Check } from 'lucide-react';

import { cn } from '@/lib/cn';

export interface WizardStep {
  key: string;
  label: string;
  optional?: boolean;
}

interface AdmissionStepperProps {
  steps: WizardStep[];
  currentIndex: number;
  /** Steps already validated — clicking one jumps back to it. */
  furthestIndex: number;
  onStepClick: (index: number) => void;
}

/**
 * Progress indicator for the admission wizard.
 *
 * Only steps already reached are clickable — jumping ahead would skip the
 * validation that gates each step.
 */
export function AdmissionStepper({
  steps,
  currentIndex,
  furthestIndex,
  onStepClick,
}: AdmissionStepperProps) {
  return (
    <ol className="scrollbar-thin flex gap-1 overflow-x-auto pb-1" aria-label="Admission progress">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isReachable = index <= furthestIndex;

        return (
          <li key={step.key} className="min-w-0 flex-1">
            <button
              type="button"
              disabled={!isReachable}
              onClick={() => onStepClick(index)}
              aria-current={isCurrent ? 'step' : undefined}
              className={cn(
                'flex w-full min-w-36 items-center gap-2.5 rounded-lg border-b-2 px-3 py-2.5 text-left',
                'transition-colors duration-150',
                isCurrent && 'border-brand-600 bg-brand-50/60',
                !isCurrent && isComplete && 'border-emerald-500 hover:bg-slate-50',
                !isCurrent && !isComplete && 'border-slate-200',
                isReachable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60',
              )}
            >
              <span
                className={cn(
                  'flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  isComplete && 'bg-emerald-500 text-white',
                  isCurrent && 'bg-brand-600 text-white',
                  !isComplete && !isCurrent && 'bg-slate-200 text-slate-600',
                )}
              >
                {isComplete ? <Check className="size-3.5" aria-hidden /> : index + 1}
              </span>

              <span className="min-w-0">
                <span
                  className={cn(
                    'block truncate text-sm font-medium',
                    isCurrent ? 'text-brand-800' : 'text-slate-700',
                  )}
                >
                  {step.label}
                </span>
                {step.optional && <span className="block text-xs text-slate-400">Optional</span>}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
