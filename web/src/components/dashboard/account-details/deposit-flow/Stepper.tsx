import React from 'react';
import type { PaymentStep } from './deposit-types';

const STEPS = [
  { id: 1 as const, label: 'Payment details' },
  { id: 2 as const, label: 'Supplier bank' },
  { id: 3 as const, label: 'Confirm bank' },
  { id: 4 as const, label: 'Review & pay' },
];

interface StepperProps {
  step: PaymentStep;
}

export const DepositStepper: React.FC<StepperProps> = ({ step }) => {
  return (
    <div className="mb-2">
      <div className="relative">
        <ol className="grid grid-cols-4 gap-2">
          {STEPS.map((s) => {
            const active = s.id === step;
            const done = s.id < step;
            return (
              <li key={s.id} className="flex flex-col items-center">
                <div
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-full border  text-sm font-semibold',
                    done
                      ? 'border-[#4E8C37] bg-[#4E8C37] text-white'
                      : active
                        ? 'border-[#4E8C37] bg-white text-[#4E8C37]'
                        : 'border-[#E5E7EB] bg-white text-slate-500',
                  ].join(' ')}
                  aria-current={active ? 'step' : undefined}
                >
                  {done ? (
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20 6L9 17l-5-5"
                      />
                    </svg>
                  ) : (
                    s.id
                  )}
                </div>
                <div className="mt-2 flex flex-col items-center">
                  <span
                    className={[
                      'text-xs font-medium',
                      active ? 'text-[#4E8C37]' : 'text-slate-600',
                    ].join(' ')}
                  >
                    {s.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
};

export function getNextStepLabel(step: PaymentStep): string {
  const next = (step + 1) as PaymentStep;
  const found = STEPS.find((s) => s.id === next);
  return found ? `Next: ${found.label}` : '';
}

