import React from 'react';

import { Input } from 'src/components/ui/input';
import { CurrencyFormatter } from 'src/lib/helpers';
import type { OsnFeeQuoteData } from 'src/interfaces/osnFeeQuote';
import type { PaymentProviderTransfer } from 'src/interfaces/payment';

import {
  getDisplayFeeAndTotal,
  parseDepositReference,
  payInDetailRows,
} from './osn-transfer-display';
import { getBuyerPayableTotal } from './fee-display';

const fmtMoney = (n: number, currency: string) => {
  const formatted = CurrencyFormatter(n).replace('$', '').trim();
  return `$${formatted} ${currency}`;
};

interface BeneficiaryStepProps {
  transfer: PaymentProviderTransfer;
  paymentAmount: number;
  paymentCurrency: string;
  confirmedFeeQuote: OsnFeeQuoteData | null;
}

export const PartBBeneficiaryStep: React.FC<BeneficiaryStepProps> = ({
  transfer,
  paymentAmount,
  paymentCurrency,
  confirmedFeeQuote,
}) => {
  const hiddenLabels = new Set([
    'id',
    'is active',
    'created at',
    'updated at',
    'organization id',
    'account holder address',
    'bank address',
    'address',
  ]);
  const rows = payInDetailRows(transfer.payInBankDetails).filter(
    (r) => !hiddenLabels.has(r.label.trim().toLowerCase()),
  );
  const { fee, total } = getDisplayFeeAndTotal({
    paymentAmount,
    paymentCurrency,
    transfer,
    confirmedFeeQuote,
  });

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-[#E5EAF2] bg-white p-4 sm:p-5">
        <h3 className="text-base sm:text-[18px] font-bold leading-[1.1em] text-tm-black-80">
          Beneficiary bank details
        </h3>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          Use these exact details in your banking app.
        </p>

        {rows.length ? (
          <div className="mt-4 grid gap-x-6 gap-y-0 border-t border-[#E5EAF2] pt-3 sm:grid-cols-2">
            {rows.map((r) => (
              <div key={`${r.label}-${r.value}`} className="border-b border-[#E5EAF2] py-3 sm:[&:nth-last-child(-n+2)]:border-b-0">
                <p className="text-sm text-slate-500">{r.label}</p>
                <p className="break-words text-sm sm:text-base font-semibold leading-snug text-slate-700">
                  {r.value}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-amber-800">
            Bank details were not returned for this transfer. Refresh or contact support.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E5EAF2] pt-3">
          <span className="inline-flex rounded-full bg-[#4E8C3714] px-4 py-1 text-sm font-medium text-[#4E8C37]">
            {fee != null ? `Buyer fee: ${fmtMoney(fee, paymentCurrency)}` : 'Buyer fee: —'}
          </span>
          <span className="text-base sm:text-lg font-semibold text-slate-700">
            {total != null
              ? `Total to send: ${fmtMoney(total, paymentCurrency)}`
              : confirmedFeeQuote
                ? `Total to send: ${fmtMoney(getBuyerPayableTotal(confirmedFeeQuote), paymentCurrency)}`
                : 'Total to send: —'}
          </span>
        </div>
      </div>
    </div>
  );
};

interface SubmitTxStepProps {
  transfer: PaymentProviderTransfer;
  paymentAmount: number;
  paymentCurrency: string;
  confirmedFeeQuote: OsnFeeQuoteData | null;
  bankTxNumber: string;
  onChangeBankTxNumber: (v: string) => void;
  touched: boolean;
}

export const PartBSubmitTxStep: React.FC<SubmitTxStepProps> = ({
  transfer,
  paymentAmount,
  paymentCurrency,
  confirmedFeeQuote,
  bankTxNumber,
  onChangeBankTxNumber,
  touched,
}) => {
  const { total } = getDisplayFeeAndTotal({
    paymentAmount,
    paymentCurrency,
    transfer,
    confirmedFeeQuote,
  });
  const displayTotal = total ?? (confirmedFeeQuote ? getBuyerPayableTotal(confirmedFeeQuote) : null) ?? null;
  const txErr = touched && !bankTxNumber.trim();

  return (
    <div className="space-y-4">
      <div className="space-y-4 rounded-3xl border border-[#E5EAF2] bg-white p-4 sm:p-5">
        <div className="rounded-xl border border-[#E5EAF2] bg-white p-3 sm:p-4">
          <div className="flex items-start gap-2">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-[#4E8C3720] text-[#4E8C37]">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {displayTotal != null
                  ? `Transfer initiated for ${fmtMoney(displayTotal, paymentCurrency)}`
                  : 'Transfer initiated'}
              </p>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="bank-tx-number" className="text-sm font-medium text-slate-800">
            Transaction number <span className="text-red-500">*</span>
          </label>
          <Input
            id="bank-tx-number"
            value={bankTxNumber}
            onChange={(e) => onChangeBankTxNumber(e.target.value)}
            placeholder="e.g. TRX-89344201"
            invalid={txErr}
            className="mt-2"
          />
          {txErr ? <p className="mt-1 text-xs text-red-600">Transaction number is required.</p> : null}
        </div>
      </div>
    </div>
  );
};

interface PendingStepProps {
  paymentAmount: number;
  paymentCurrency: string;
  confirmedFeeQuote: OsnFeeQuoteData | null;
  transfer: PaymentProviderTransfer;
  bankTxNumber: string;
}

export const PartBPendingStep: React.FC<PendingStepProps> = ({
  paymentAmount,
  paymentCurrency,
  confirmedFeeQuote,
  transfer,
  bankTxNumber,
}) => {
  const { total } = getDisplayFeeAndTotal({
    paymentAmount,
    paymentCurrency,
    transfer,
    confirmedFeeQuote,
  });
  const displayTotal = total ?? (confirmedFeeQuote ? getBuyerPayableTotal(confirmedFeeQuote) : null) ?? null;
  const ref =
    bankTxNumber.trim() ||
    parseDepositReference(transfer.depositInstructions) ||
    transfer.providerMintRequestId ||
    '—';

  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#4E8C37] text-white shadow-md">
        <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Transfer submitted</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
          We received the bank transaction number and submitted it to OSN. The payment will move forward
          after provider confirmation.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E5EAF2] bg-slate-50 py-3 text-sm">
          <p className="font-semibold text-slate-800">Amount</p>
          <p className="mt-1 text-slate-900">
            {displayTotal != null ? fmtMoney(displayTotal, paymentCurrency) : '—'}
          </p>
        </div>
        <div className="rounded-xl border border-[#E5EAF2] bg-slate-50 py-3 text-sm">
          <p className="font-semibold text-slate-800">Reference</p>
          <p className="mt-1 break-all font-mono text-xs text-slate-900">{ref}</p>
        </div>
        <div className="rounded-xl border border-[#E5EAF2] bg-slate-50 py-3 text-sm">
          <p className="font-semibold text-slate-800">Status</p>
          <p className="mt-1 font-semibold text-[#4E8C37]">Pending</p>
        </div>
      </div>
    </div>
  );
};
