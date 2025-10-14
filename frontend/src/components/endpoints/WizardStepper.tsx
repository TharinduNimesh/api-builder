import { CheckCircle2 } from 'lucide-react';
import { WizardStep } from './types';

interface WizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick: (step: number) => void;
  canProceedToStep: (step: number) => boolean;
}

export const WizardStepper = ({ steps, currentStep, onStepClick, canProceedToStep }: WizardStepperProps) => {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-700 -z-10">
          <div 
            className="h-full bg-orange-500 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.num;
          const isCompleted = currentStep > step.num;
          const canAccess = idx === 0 || canProceedToStep(step.num);
          
          return (
            <button
              key={step.num}
              onClick={() => canAccess && onStepClick(step.num)}
              disabled={!canAccess && !isCompleted}
              className={`
                flex flex-col items-center gap-2 relative z-10 group transition-all
                ${!canAccess && !isCompleted ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300
                ${isActive 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50 scale-110' 
                  : isCompleted 
                    ? 'bg-green-500 text-white' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                }
                ${canAccess || isCompleted ? 'group-hover:scale-105' : ''}
              `}>
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span className={`
                text-xs font-medium whitespace-nowrap transition-colors
                ${isActive 
                  ? 'text-orange-600 dark:text-orange-400' 
                  : isCompleted
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-slate-600 dark:text-slate-400'
                }
              `}>
                {step.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
