import React from 'react';

import type { UserProfileInfo } from 'src/interfaces/auth';
import type { BankAccount } from 'src/interfaces/bankAccount';

interface StepConfirmBankProps {
  supplierProfile: UserProfileInfo | null;
  onUseDifferentBank?: () => void;
}

export const StepConfirmBank: React.FC<StepConfirmBankProps> = ({
  supplierProfile,
  onUseDifferentBank,
}) => {
  const bestAccount: BankAccount | undefined =
    supplierProfile?.bankAccounts?.find((a) => a.status === 'ACTIVE' && a.isDefault) ||
    supplierProfile?.bankAccounts?.find((a) => a.status === 'ACTIVE') ||
    supplierProfile?.bankAccounts?.[0];

  if (!bestAccount) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">We could not read a linked supplier bank account.</p>
        {onUseDifferentBank ? (
          <button
            type="button"
            onClick={onUseDifferentBank}
            className="mt-3 text-sm font-semibold text-[#4E8C37] hover:underline"
          >
            Enter bank details manually
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-slate-50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Supplier bank details</h3>
            <p className="mt-0.5 text-xs text-slate-600">
              Use existing linked bank details or collect them here when missing.
            </p>
          </div>
          {onUseDifferentBank ? (
            <button
              type="button"
              onClick={onUseDifferentBank}
              className="text-xs font-semibold text-[#4E8C37] hover:underline"
            >
              Enter different bank
            </button>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-slate-500">Account holder name</p>
            <p className="font-medium text-slate-900">{bestAccount.accountHolderName}</p>
          </div>
          <div>
            <p className="text-slate-500">Country</p>
            <p className="font-medium text-slate-900">{bestAccount.countryCode}</p>
          </div>
          {bestAccount.bankName && (
            <div>
              <p className="text-slate-500">Bank Name</p>
              <p className="font-medium text-slate-900">{bestAccount.bankName}</p>
            </div>
          )}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-slate-500">Account number</p>
            <p className="font-medium text-slate-900">•••• {bestAccount.accountLast4}</p>
          </div>
          {bestAccount.swiftBic && (
            <div>
              <p className="text-slate-500">SWIFT/BIC</p>
              <p className="font-medium text-slate-900">{bestAccount.swiftBic}</p>
            </div>
          )}
          {bestAccount.accountHolderAddress && (
            <div className="col-span-2">
              <p className="text-slate-500">Address</p>
              <p className="font-medium text-slate-900">
                {bestAccount.accountHolderAddress}
              </p>
            </div>
          )}
        </div>

        <div className="mt-2">
          <span className="inline-flex rounded-full bg-[#4E8C3714] px-3 py-1 text-xs font-medium text-[#4E8C37]">
            Linked bank found — confirm or use a different account above
          </span>
        </div>
      </div>
    </div>
  );
};

