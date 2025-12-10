import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: { label: string; description?: string }[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  className?: string;
}

export function Stepper({ steps, currentStep, onStepClick, className }: StepperProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isClickable = onStepClick && (isCompleted || index === currentStep);

          return (
            <React.Fragment key={index}>
              {/* Step Circle and Label */}
              <div className="flex flex-col items-center flex-1 relative z-10">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all shrink-0 relative z-10',
                    isCompleted
                      ? 'bg-teal-600 text-white'
                      : isActive
                      ? 'bg-teal-600 text-white ring-4 ring-teal-600/20'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
                    isClickable && 'cursor-pointer hover:scale-110',
                    !isClickable && 'cursor-not-allowed'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>
                <div className="mt-2 text-center w-full">
                  <p
                    className={cn(
                      'text-xs font-medium',
                      isActive
                        ? 'text-teal-600 dark:text-teal-400'
                        : isCompleted
                        ? 'text-slate-600 dark:text-slate-400'
                        : 'text-slate-400 dark:text-slate-500'
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex items-center flex-1 mx-2 relative -mt-5">
                  <div
                    className={cn(
                      'h-1 w-full',
                      isCompleted
                        ? 'bg-teal-600'
                        : 'bg-slate-300 dark:bg-slate-600'
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

