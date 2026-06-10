import React from 'react';

import { Field, FieldContent, FieldDescription, FieldLabel } from 'src/components/ui/field';
import { Input } from 'src/components/ui/input';
import { NativeSelect } from 'src/components/ui/native-select';
import { CurrencyFormatter } from 'src/lib/helpers';

import type { PaymentDraft, Currency } from './deposit-types';

interface StepPaymentDetailsProps {
  draft: PaymentDraft;
  emailError: string;
  amountError: string;
  touchedEmail: boolean;
  touchedAmount: boolean;
  onChangeDraft: (update: Partial<PaymentDraft>) => void;
  onBlurEmail: () => void;
  onBlurAmount: () => void;
  onShowEscrowInfo: () => void;
  onAmountInput: (value: string) => void;
}

export const StepPaymentDetails: React.FC<StepPaymentDetailsProps> = ({
  draft,
  emailError,
  amountError,
  touchedEmail,
  touchedAmount,
  onChangeDraft,
  onBlurEmail,
  onBlurAmount,
  onShowEscrowInfo,
  onAmountInput,
}) => {
  const hasEmailError = touchedEmail && !!emailError;
  const hasAmountError = touchedAmount && !!amountError;

  const getFormattedAmount = () => {
    if (!draft.amount) return '';
    const numericValue = Number(draft.amount.replace(/,/g, '') || '0');
    // Use shared currency formatter and strip the currency symbol
    return CurrencyFormatter(numericValue).replace('$', '').trim();
  };

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
            invalid={hasEmailError}
            className="mt-2"
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
                value={getFormattedAmount()}
                onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, '');
                  onAmountInput(raw);
                }}
                onBlur={onBlurAmount}
                placeholder="0.00"
                inputMode="decimal"
                invalid={hasAmountError}
              />
              <FieldDescription className="ml-1 text-xs text-[#9CA3AF]">
                {hasAmountError ? amountError : 'Funds are held in escrow until shipment is confirmed.'}

              </FieldDescription>
            </div>

            <div>
              <label htmlFor="payment-currency" className="sr-only">
                Currency
              </label>
              <NativeSelect
                id="payment-currency"
                value={draft.currency}
                onChange={(e) => onChangeDraft({ currency: e.target.value as Currency })}
              >
                <option value="HKD">HKD</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </NativeSelect>
            </div>
          </div>
        </FieldContent>
      </Field>

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

            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

