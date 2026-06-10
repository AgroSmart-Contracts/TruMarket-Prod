import React from 'react';
import classNames from 'classnames';

export interface DepositFlowInfoNoteProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Neutral helper text for deposit / AgroPay flows.
 * Uses the same border and surface treatment as summary cards (`StepReviewPay`, etc.),
 * not sky/alert styling.
 */
export const DepositFlowInfoNote: React.FC<DepositFlowInfoNoteProps> = ({ children, className }) => (
  <div
    className={classNames(
      'rounded-2xl border border-[#E5E7EB] bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-700',
      className,
    )}
  >
    {children}
  </div>
);
