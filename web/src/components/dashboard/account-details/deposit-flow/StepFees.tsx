import React from 'react';
import { Info } from 'lucide-react';

import { CurrencyFormatter } from 'src/lib/helpers';
import type { OsnFeeQuoteData } from 'src/interfaces/osnFeeQuote';

import type { PaymentDraft } from './deposit-types';
import { getBuyerFeePolicy, getBuyerPayableTotal, getUserVisibleTruMarketFee } from './fee-display';
import { DEPOSIT_FLOW_PRIMARY_GREEN } from './Stepper';

interface StepFeesProps {
  draft: PaymentDraft;
  quote: OsnFeeQuoteData | null;
  loading: boolean;
  error: string | null;
  quoteKey: string;
  fetchedKey: string | null;
  onRetry: () => void;
}

const formatAmt = (n: number, currency: string) => {
  const formatted = CurrencyFormatter(n).replace('$', '').trim();
  return `${currency} ${formatted}`;
};

/** Admin-dashboard throws when on-ramp general `active` is off. */
function isOnrampFeeInactiveError(message: string | null): boolean {
  if (!message) return false;
  return /not marked active/i.test(message);
}

function NoFeesAppliedBanner({ variant }: { variant: 'inactive' | 'zero' }) {
  const isInactive = variant === 'inactive';
  const description = isInactive
    ? 'On-ramp fee settings are currently inactive.'
    : 'No TruMarket fee applies to this payment for the amount and currency you entered.';

  return (
    <div
      className="overflow-hidden rounded-2xl border p-4 shadow-sm sm:p-5"
      style={{
        borderColor: `${DEPOSIT_FLOW_PRIMARY_GREEN}40`,
        backgroundColor: `${DEPOSIT_FLOW_PRIMARY_GREEN}14`,
      }}
    >
      <div className="space-y-3">
        {isInactive ? (
          <span
            className="inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold tracking-tight"
            style={{
              backgroundColor: `${DEPOSIT_FLOW_PRIMARY_GREEN}18`,
              color: DEPOSIT_FLOW_PRIMARY_GREEN,
            }}
          >
            Free trial
          </span>
        ) : null}

        <div>
          <h4
            className="text-xl font-bold leading-tight sm:text-2xl"
            style={{ color: DEPOSIT_FLOW_PRIMARY_GREEN }}
          >
            No fees will be applied
          </h4>
          <p className="mt-1 max-w-xl text-sm font-normal leading-snug text-slate-600">{description}</p>
        </div>

        {!isInactive ? (
          <div
            className="flex gap-3 rounded-xl border bg-white/80 px-3 py-3 sm:px-4"
            style={{ borderColor: `${DEPOSIT_FLOW_PRIMARY_GREEN}33` }}
          >
            <Info className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={2} style={{ color: DEPOSIT_FLOW_PRIMARY_GREEN }} />
            <p className="text-sm leading-relaxed text-slate-700">
              You can continue to the next step. If you expected a fee, verify the amount or contact support.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export const StepFees: React.FC<StepFeesProps> = ({
  draft,
  quote,
  loading,
  error,
  quoteKey,
  fetchedKey,
  onRetry,
}) => {
  const amt = Number((draft.amount || '0').toString().replace(/,/g, ''));
  const quoteFresh = quote && fetchedKey === quoteKey;
  const inactiveProduction = !loading && error && isOnrampFeeInactiveError(error);
  const zeroFeeFromQuote =
    quoteFresh && quote != null && getUserVisibleTruMarketFee(quote) === 0 && !inactiveProduction;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Payment amount</h3>
        <div className="flex flex-wrap items-start justify-between gap-2 text-sm">
          <div>
            <p className="text-slate-500">Recipient</p>
            <p className="font-medium text-slate-900">{draft.recipientEmail}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-500">Amount</p>
            <p className="text-base font-bold text-slate-900">{formatAmt(amt, draft.currency)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Calculate and confirm fees</h3>

        {loading ? (
          <div className="flex flex-col items-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#4E8C37] border-t-transparent" />
            <p className="mt-3 text-sm text-slate-600">Loading fee quote…</p>
          </div>
        ) : inactiveProduction ? (
          <NoFeesAppliedBanner variant="inactive" />
        ) : error ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950">
            <p className="font-semibold text-amber-950">Could not load fee quote</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-900/90">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-lg border border-amber-300/80 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-100/80"
            >
              Retry
            </button>
          </div>
        ) : zeroFeeFromQuote ? (
          <NoFeesAppliedBanner variant="zero" />
        ) : quoteFresh && quote ? (
          <div className="space-y-3 rounded-xl bg-[#4E8C3712] p-4 text-sm">
            {(() => {
              const feePolicy = getBuyerFeePolicy(quote.buyerFeePercent);
              const userVisibleTmFee = getUserVisibleTruMarketFee(quote);
              const buyerTotal = getBuyerPayableTotal(quote);
              const feePolicyText =
                feePolicy === 'supplier'
                  ? 'Supplier pays TruMarket fee'
                  : feePolicy === 'shared'
                    ? 'TruMarket fee is shared'
                    : feePolicy === 'buyer'
                      ? 'Buyer pays TruMarket fee in full'
                      : `Buyer pays ${quote.buyerFeePercent}% of TruMarket fee`;

              return (
                <>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-700">Payment amount</span>
                    <span className="font-medium text-slate-900">{formatAmt(quote.paymentAmount, quote.currency)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-700">TruMarket fee</span>
                    <span className="font-medium text-slate-900">{formatAmt(userVisibleTmFee, quote.currency)}</span>
                  </div>
                  <div className="flex justify-between gap-4 text-xs text-slate-600">
                    <span>Fee policy</span>
                    <span className="font-medium text-slate-800">{feePolicyText}</span>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-[#4E8C3720] pt-3">
                    <span className="font-semibold text-slate-900">Total buyer pays</span>
                    <span className="font-bold text-[#4E8C37]">{formatAmt(buyerTotal, quote.currency)}</span>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <p className="text-sm text-slate-600">Enter a valid amount and currency on the previous step.</p>
        )}
      </div>
    </div>
  );
};
