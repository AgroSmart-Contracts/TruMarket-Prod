import React from 'react';
import { Field, FieldContent, FieldDescription, FieldLabel } from 'src/components/ui/field';
import { Input } from 'src/components/ui/input';
import { Textarea } from 'src/components/ui/textarea';
import { cn } from 'src/lib/utils';
import type { PaymentDraft, Currency } from './deposit-types';

interface StepPaymentDetailsProps {
  draft: PaymentDraft;
  emailError: string;
  amountError: string;
  touchedEmail: boolean;
  touchedAmount: boolean;
  showDetails: boolean;
  onChangeDraft: (update: Partial<PaymentDraft>) => void;
  onBlurEmail: () => void;
  onBlurAmount: () => void;
  onToggleDetails: () => void;
  onShowEscrowInfo: () => void;
  onAmountInput: (value: string) => void;
}

export const StepPaymentDetails: React.FC<StepPaymentDetailsProps> = ({
  draft,
  emailError,
  amountError,
  touchedEmail,
  touchedAmount,
  showDetails,
  onChangeDraft,
  onBlurEmail,
  onBlurAmount,
  onToggleDetails,
  onShowEscrowInfo,
  onAmountInput,
}) => {
  const hasEmailError = touchedEmail && !!emailError;
  const hasAmountError = touchedAmount && !!amountError;

  return (
    <div className="space-y-3">
      {/* Recipient */}
      <Field className="gap-0" data-invalid={hasEmailError || undefined}>
        <FieldLabel htmlFor="recipient-email">Recipient email</FieldLabel>
        <FieldContent className="gap-0">
          <Input
            id="recipient-email"
            value={draft.recipientEmail}
            onChange={(e) => onChangeDraft({ recipientEmail: e.target.value })}
            onBlur={onBlurEmail}
            placeholder="recipient@example.com"
            type="email"
            inputMode="email"
            autoComplete="email"
            className={cn(
              'mt-2 h-auto w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-[#4E8C37]',
            )}
          />
          <FieldDescription className="ml-1 text-xs text-[#9CA3AF]">
            {hasEmailError ? (
              emailError
            ) : (
              'We will notify the supplier by email.'
            )}
          </FieldDescription>
        </FieldContent>
      </Field>

      {/* Amount + Currency group */}
      <Field className="gap-0" data-invalid={hasAmountError || undefined}>
        <FieldLabel htmlFor="payment-amount">Amount</FieldLabel>
        <FieldContent className="gap-0">
          <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px]">
            <div>
              <Input
                id="payment-amount"
                value={draft.amount}
                onChange={(e) => onAmountInput(e.target.value)}
                onBlur={onBlurAmount}
                placeholder="0.00"
                inputMode="decimal"
                className={cn(
                  'h-auto w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-[#4E8C37]',
                )}
              />
              <FieldDescription className="ml-1 text-xs text-[#9CA3AF]">
                {hasAmountError ? amountError : 'Funds are held in escrow until shipment is confirmed.'}

              </FieldDescription>
            </div>

            <div>
              <label htmlFor="payment-currency" className="sr-only">
                Currency
              </label>
              <select
                id="payment-currency"
                value={draft.currency}
                onChange={(e) => onChangeDraft({ currency: e.target.value as Currency })}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-slate-900 focus-visible:border-[#4E8C37]"
              >
                <option value="HKD">HKD</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>
        </FieldContent>
      </Field>

      {/* Add details (optional) */}
      <div className="space-y-4 rounded-2xl border border-[#E5E7EB] p-4">
        <button
          type="button"
          onClick={onToggleDetails}
          className="flex w-full items-center justify-between text-left"
        >
          <div className="flex flex-col">
            <span className="text-sm font-medium text-slate-800">Add details (optional)</span>
            <span className="text-xs font-medium text-[#9CA3AF]">Invoice number and description</span>
          </div>
          <span className="text-xl font-semibold text-slate-500">{showDetails ? '−' : '+'}</span>
        </button>

        {showDetails && (
          <div className="space-y-4 pt-2">
            <Field className="gap-0">
              <FieldLabel htmlFor="invoice-number">Invoice number (optional)</FieldLabel>
              <FieldContent className="gap-0">
                <Input
                  id="invoice-number"
                  value={draft.invoiceNumber}
                  onChange={(e) => onChangeDraft({ invoiceNumber: e.target.value })}
                  placeholder="INV-2026-001"
                  className="mt-2 h-auto w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-[#4E8C37]"
                />
              </FieldContent>
            </Field>

            <Field className="gap-0">
              <FieldLabel htmlFor="payment-description">Description (optional)</FieldLabel>
              <FieldContent className="gap-0">
                <Textarea
                  id="payment-description"
                  value={draft.description}
                  onChange={(e) => onChangeDraft({ description: e.target.value })}
                  placeholder="Payment description..."
                  className="mt-2 min-h-[50px] w-full resize-none rounded-xl border border-[#E5E7EB] bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus-visible:border-[#4E8C37]"
                />
              </FieldContent>
            </Field>
          </div>
        )}
      </div>

      {/* Info callout */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-[#4E8C3720] p-2 text-[#4E8C37]">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
              <path
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 11V8m0 8h.01M5.5 12a6.5 6.5 0 1 0 13 0a6.5 6.5 0 0 0-13 0Z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Escrow protection</p>
            <p className="mt-1 text-sm text-slate-600">
              Funds are held until the recipient confirms shipment.
              <button
                type="button"
                className="ml-2 text-sm font-medium text-[#4E8C37] hover:underline"
                onClick={onShowEscrowInfo}
              >
                Learn more
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

