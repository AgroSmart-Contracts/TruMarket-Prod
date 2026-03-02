import React, { useEffect } from 'react';

interface StepCheckBankProps {
  isCheckingBank: boolean;
  onCheckSupplierBank: () => void;
}

export const StepCheckBank: React.FC<StepCheckBankProps> = ({
  isCheckingBank,
  onCheckSupplierBank,
}) => {
  useEffect(() => {
    onCheckSupplierBank();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      <p className="mb-4 text-sm text-slate-600">
        Checking if the supplier has linked their bank account details...
      </p>

      <div className="rounded-xl border border-[#E5E7EB] bg-slate-50 p-6 text-center">
        {isCheckingBank ? (
          <div className="space-y-3">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-[#4E8C37]" />
            <p className="text-sm text-slate-600">Checking supplier bank details...</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Ready to check supplier bank details</p>
            <p className="text-xs text-slate-500">
              We will redirect you to confirm the supplier&apos;s bank information.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

