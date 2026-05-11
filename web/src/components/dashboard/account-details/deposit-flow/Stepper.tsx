import React from 'react';

import type { PartAStep, PartBStep } from './deposit-types';

/** Primary green for stepper circles, connectors, and matching deposit fee UI (`StepFees`, etc.). */
export const DEPOSIT_FLOW_PRIMARY_GREEN = '#4E8C37';

/** Matches deposit flow stepper spec: solid green + white for done/current, grey outline for upcoming; connectors green after completed steps. */
const STEP_LINE_DONE = 'bg-[#4E8C37]';
const STEP_LINE_TODO = 'bg-[#E5E7EB]';
const STEP_UPCOMING_TEXT = 'text-[#5F6D7E]';

export const PART_A_STEPS = [
  { id: 1 as const, label: 'Payment details' },
  { id: 2 as const, label: 'Fees' },
  { id: 3 as const, label: 'Supplier bank' },
  { id: 4 as const, label: 'Review' },
];

export const PART_B_STEPS = [
  { id: 1 as const, label: 'Beneficiary bank details' },
  { id: 2 as const, label: 'Submit transaction number' },
  { id: 3 as const, label: 'Confirmation' },
];

export type DepositFlowStep = (typeof PART_A_STEPS)[number] | (typeof PART_B_STEPS)[number];

export interface DepositFlowStepperProps {
  /** Ordered steps with sequential numeric `id` (1..n). */
  steps: readonly DepositFlowStep[];
  /** Current step id (must match one of `steps[].id`). */
  currentStep: number;
}

function stepCircleClass(done: boolean, active: boolean): string {
  if (done || active) {
    return 'border-transparent bg-[#4E8C37] text-white';
  }
  return 'border border-[#E5E7EB] bg-white text-[#5F6D7E]';
}

function stepLabelClass(done: boolean, active: boolean): string {
  const base = 'text-[11px] sm:text-xs font-medium leading-tight';
  if (done || active) {
    return `${base} text-[#4E8C37]`;
  }
  return `${base} ${STEP_UPCOMING_TEXT}`;
}

/**
 * Shared horizontal stepper for deposit Part A (payment creation) and Part B (OSN / confirmation).
 */
export const DepositFlowStepper: React.FC<DepositFlowStepperProps> = ({ steps, currentStep }) => {
  return (
    <div className="mb-2">
      <ol className="flex w-full items-start">
        {steps.map((s, index) => {
          const active = s.id === currentStep;
          const done = s.id < currentStep;
          const lineToNextGreen = currentStep > s.id;
          return (
            <React.Fragment key={s.id}>
              <li className="flex min-w-0 flex-1 flex-col items-center">
                <div
                  className={[
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-semibold',
                    stepCircleClass(done, active),
                  ].join(' ')}
                  aria-current={active ? 'step' : undefined}
                >
                  {done ? (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
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
                <div className="mt-2 flex w-full flex-col items-center px-0.5 text-center">
                  <span className={stepLabelClass(done, active)}>{s.label}</span>
                </div>
              </li>
              {index < steps.length - 1 ? (
                <li
                  className="flex h-8 min-w-[10px] flex-1 items-center self-start px-0.5 pt-0 sm:min-w-[16px]"
                  aria-hidden
                >
                  <div
                    className={[
                      'h-[3px] w-full rounded-full',
                      lineToNextGreen ? STEP_LINE_DONE : STEP_LINE_TODO,
                    ].join(' ')}
                  />
                </li>
              ) : null}
            </React.Fragment>
          );
        })}
      </ol>
    </div>
  );
};

interface PartAStepperProps {
  step: PartAStep;
}

export const PartAStepper: React.FC<PartAStepperProps> = ({ step }) => (
  <DepositFlowStepper steps={PART_A_STEPS} currentStep={step} />
);

interface PartBStepperProps {
  step: PartBStep;
}

export const PartBStepper: React.FC<PartBStepperProps> = ({ step }) => (
  <DepositFlowStepper steps={PART_B_STEPS} currentStep={step} />
);

export function getNextPartALabel(step: PartAStep): string {
  const next = (step + 1) as PartAStep;
  const found = PART_A_STEPS.find((s) => s.id === next);
  return found ? `Next: ${found.label}` : '';
}
