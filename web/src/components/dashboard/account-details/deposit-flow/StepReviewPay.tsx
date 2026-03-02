import React, { useState } from 'react';
import type { PaymentDraft } from './deposit-types';

interface StepReviewPayProps {
  draft: PaymentDraft;
}

export const StepReviewPay: React.FC<StepReviewPayProps> = ({ draft }) => {
  const [showBankDetails, setShowBankDetails] = useState(false);
  const bankDetails = draft.supplierProfile?.bankDetails || draft.recipientBankDetails;

  return (
    <div className="space-y-4">
      <p className="mb-4 text-sm text-slate-600">
        Review all payment details before proceeding.
      </p>

      <div className="space-y-3 rounded-xl border border-[#E5E7EB] bg-slate-50 p-4">
        <h3 className="mb-3 font-semibold text-slate-900">Payment Summary</h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-500">Recipient Email:</span>
            <span className="font-medium text-slate-900">{draft.recipientEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Amount:</span>
            <span className="font-medium text-slate-900">
              {draft.currency} {draft.amount}
            </span>
          </div>
          {draft.invoiceNumber && (
            <div className="flex justify-between">
              <span className="text-slate-500">Invoice Number:</span>
              <span className="font-medium text-slate-900">{draft.invoiceNumber}</span>
            </div>
          )}
          {draft.description && (
            <div className="flex justify-between">
              <span className="text-slate-500">Description:</span>
              <span className="font-medium text-slate-900">{draft.description}</span>
            </div>
          )}
        </div>
      </div>

      {/* Bank Details (collapsible) */}
      {bankDetails && (
        <div className="space-y-4 rounded-2xl border border-[#E5E7EB] p-4">
          <button
            type="button"
            onClick={() => setShowBankDetails(!showBankDetails)}
            className="flex w-full items-center justify-between text-left"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-800">Bank Details Confirmed</span>
              <span className="text-xs font-medium text-slate-500">
                {bankDetails.beneficiaryName} - {bankDetails.country}
              </span>
            </div>
            <span className="text-xl font-semibold text-slate-500">{showBankDetails ? '−' : '+'}</span>
          </button>

          {showBankDetails && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-500">Beneficiary Name</p>
                  <p className="font-medium text-slate-900">{bankDetails.beneficiaryName}</p>
                </div>
                <div>
                  <p className="text-slate-500">Country</p>
                  <p className="font-medium text-slate-900">{bankDetails.country}</p>
                </div>
                {bankDetails.bankName && (
                  <div>
                    <p className="text-slate-500">Bank Name</p>
                    <p className="font-medium text-slate-900">{bankDetails.bankName}</p>
                  </div>
                )}
                {bankDetails.accountNumber && (
                  <div>
                    <p className="text-slate-500">Account Number</p>
                    <p className="font-medium text-slate-900">{bankDetails.accountNumber}</p>
                  </div>
                )}
                {bankDetails.swiftCode && (
                  <div>
                    <p className="text-slate-500">SWIFT/BIC</p>
                    <p className="font-medium text-slate-900">{bankDetails.swiftCode}</p>
                  </div>
                )}
                {bankDetails.addressLine1 && (
                  <div className="col-span-2">
                    <p className="text-slate-500">Address</p>
                    <p className="font-medium text-slate-900">
                      {bankDetails.addressLine1}
                      {bankDetails.city && `, ${bankDetails.city}`}
                      {bankDetails.postalCode && ` ${bankDetails.postalCode}`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

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
              Funds will be held securely until the recipient confirms shipment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

