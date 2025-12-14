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
  const currentStepLabel = steps[currentStep]?.label || '';
  
  return (
    <div className={cn('w-full', className)}>
      {/* Mobile: Simple step indicator */}
      <div className="sm:hidden flex flex-col items-center gap-3">
        <div className="flex items-center gap-2">
          {steps.map((_, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isClickable = onStepClick && (isCompleted || index === currentStep);

            return (
              <React.Fragment key={index}>
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-all shrink-0',
                    isCompleted
                      ? 'bg-teal-600 text-white'
                      : isActive
                      ? 'bg-teal-600 text-white ring-2 ring-teal-600/20'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400',
                    isClickable && 'cursor-pointer',
                    !isClickable && 'cursor-not-allowed'
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="leading-none">{index + 1}</span>
                  )}
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'w-6 h-0.5 rounded-full',
                      isCompleted ? 'bg-teal-600' : 'bg-slate-300 dark:bg-slate-600'
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <p className="text-sm font-medium text-teal-600 dark:text-teal-400">
          {currentStepLabel}
        </p>
      </div>

      {/* Desktop: Full stepper with labels */}
      <div className="hidden sm:flex justify-between items-start">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isClickable = onStepClick && (isCompleted || index === currentStep);
          const showConnector = index < steps.length - 1;

          return (
            <React.Fragment key={index}>
              {/* Step */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => isClickable && onStepClick?.(index)}
                  disabled={!isClickable}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all shrink-0',
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
                    <span className="leading-none">{index + 1}</span>
                  )}
                </button>
                <p
                  className={cn(
                    'text-xs font-medium text-center mt-2 max-w-[80px]',
                    isActive
                      ? 'text-teal-600 dark:text-teal-400'
                      : isCompleted
                      ? 'text-slate-600 dark:text-slate-400'
                      : 'text-slate-400 dark:text-slate-500'
                  )}
                >
                  {step.label}
                </p>
              </div>

              {/* Connector with gap */}
              {showConnector && (
                <div className="flex-1 flex items-center px-1 mt-5">
                  <div
                    className={cn(
                      'h-0.5 w-full rounded-full',
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

