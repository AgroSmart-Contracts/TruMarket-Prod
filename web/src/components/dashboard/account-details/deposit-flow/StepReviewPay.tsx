import React from 'react';

import { CurrencyFormatter } from 'src/lib/helpers';
import type { BankAccount } from 'src/interfaces/bankAccount';
import type { OsnFeeQuoteData } from 'src/interfaces/osnFeeQuote';

import { DepositFlowInfoNote } from './DepositFlowInfoNote';
import type { PaymentDraft } from './deposit-types';
import { getBuyerFeePolicy, getBuyerPayableTotal, getUserVisibleTruMarketFee } from './fee-display';

interface StepReviewPayProps {
  draft: PaymentDraft;
  quote: OsnFeeQuoteData | null;
  quoteKey: string;
  fetchedKey: string | null;
  feeError?: string | null;
}

const fmt = (n: number, currency: string) => {
  const formatted = CurrencyFormatter(n).replace('$', '').trim();
  return `${currency} ${formatted}`;
};

function isOnrampFeeInactiveError(message: string | null): boolean {
  if (!message) return false;
  return /not marked active/i.test(message);
}

export const StepReviewPay: React.FC<StepReviewPayProps> = ({
  draft,
  quote,
  quoteKey,
  fetchedKey,
  feeError = null,
}) => {
  const supplierAccount: BankAccount | undefined =
    draft.supplierProfile?.bankAccounts?.find((a) => a.isDefault) ||
    draft.supplierProfile?.bankAccounts?.find((a) => a.status === 'ACTIVE') ||
    draft.supplierProfile?.bankAccounts?.[0];

  const manualBank = draft.recipientBankDetails;
  const bankSummary = supplierAccount
    ? {
      beneficiary: supplierAccount.accountHolderName,
      bank: supplierAccount.bankName,
      account: `••••${supplierAccount.accountLast4}`,
    }
    : manualBank
      ? {
        beneficiary: manualBank.accountHolderName || '—',
        bank: manualBank.bankName || '—',
        account: manualBank.accountNumber || '—',
      }
      : null;

  const amt = Number((draft.amount || '0').toString().replace(/,/g, ''));
  const quoteFresh = quote && fetchedKey === quoteKey;
  const freeTrialFees = !quoteFresh && isOnrampFeeInactiveError(feeError);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Payment summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Recipient email</span>
            <span className="text-right font-medium text-slate-900">{draft.recipientEmail}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-slate-500">Payment amount</span>
            <span className="font-bold text-slate-900">{fmt(amt, draft.currency)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-[#E5E7EB] bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Supplier bank confirmed</h3>
          {bankSummary ? (
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-slate-500">Beneficiary</p>
                <p className="font-medium text-slate-900">{bankSummary.beneficiary}</p>
              </div>
              <div>
                <p className="text-slate-500">Bank</p>
                <p className="font-medium text-slate-900">
                  {bankSummary.bank} · {bankSummary.account}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-600">No bank details</p>
          )}
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-slate-50 p-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-900">Fees confirmed</h3>
          {quoteFresh && quote ? (
            (() => {
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
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">TruMarket fee</span>
                    <span className="font-medium text-[#4E8C37]">{fmt(userVisibleTmFee, quote.currency)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Fee policy</span>
                    <span>{feePolicyText}</span>
                  </div>
                  <div className="flex justify-between border-t border-[#E5E7EB] pt-2">
                    <span className="font-medium text-slate-800">Total you pay</span>
                    <span className="font-bold text-[#4E8C37]">{fmt(buyerTotal, quote.currency)}</span>
                  </div>
                </div>
              );
            })()
          ) : freeTrialFees ? (
            <p className="text-sm text-[#4E8C37]">Fees are waived during free trial for this payment.</p>
          ) : (
            <p className="text-sm text-amber-800">Fee details are not available. Go back to the fees step.</p>
          )}
        </div>
      </div>

      <DepositFlowInfoNote>
        After you create the payment request, the supplier can upload payment documents for admin verification.
      </DepositFlowInfoNote>
    </div>
  );
};
