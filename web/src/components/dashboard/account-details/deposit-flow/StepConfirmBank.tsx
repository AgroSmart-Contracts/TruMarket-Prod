import React from 'react';
import type { UserProfileInfo } from 'src/interfaces/auth';

interface StepConfirmBankProps {
  supplierProfile: UserProfileInfo | null;
}

export const StepConfirmBank: React.FC<StepConfirmBankProps> = ({ supplierProfile }) => {
  if (!supplierProfile?.bankDetails) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">Supplier has not provided bank account details.</p>
      </div>
    );
  }

  const { bankDetails } = supplierProfile;
  const isLinked = supplierProfile.isBankLinked ?? !!bankDetails;

  return (
    <div className="space-y-4">
      <p className="mb-4 text-sm text-slate-600">
        Please review and confirm the supplier&apos;s bank account details.
      </p>

      <div className="space-y-3 rounded-xl border border-[#E5E7EB] bg-slate-50 p-4">
        <h3 className="mb-3 font-semibold text-slate-900">Supplier Bank Details</h3>

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

        <div className="mt-4 border-t border-[#E5E7EB] pt-4">
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`h-3 w-3 rounded-full ${
                isLinked ? 'bg-[#4E8C37]' : 'bg-red-500'
              }`}
            />
            <span
              className={isLinked ? 'text-[#4E8C37]' : 'text-red-700'}
            >
              Bank Account Status: {isLinked ? 'Linked' : 'Not Linked'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

