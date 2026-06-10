import React from "react";
import { toast } from "react-toastify";

import Button from "src/components/common/button";

interface AgreementDetailChangesAlertProps {
  changesCount: number;
  submitFormAction?: () => void;
  loading?: boolean;
  resetFormAction?: () => void;
}

const AgreementDetailChangesAlert: React.FC<AgreementDetailChangesAlertProps> = ({
  changesCount,
  submitFormAction,
  loading,
  resetFormAction,
}) => {
  return (
    <div className="rounded-lg sm:rounded-xl bg-tm-yellow p-4 sm:p-[16px] shadow-md">
      <div className="flex flex-col gap-3 sm:gap-[14px]">
        <div className="flex flex-col gap-2 sm:gap-[4px]">
          <p className="text-sm sm:text-[13px] font-bold leading-[1.3em] tracking-normal text-tm-black-80">
            You have ({changesCount}) unsubmitted changes.
          </p>
          <p
            onClick={() => {
              resetFormAction?.();
              toast.success("Agreement changes reset.");
            }}
            className="cursor-pointer text-xs sm:text-[12px] leading-[1.3em] text-tm-black-80 underline hover:text-tm-black-60 transition-colors"
          >
            Reset form
          </p>
        </div>
        <Button
          onClick={() => submitFormAction?.()}
          loading={loading}
          disabled={loading}
          classOverrides="w-full sm:w-auto"
        >
          <p className="text-xs sm:text-[13px] font-bold leading-[1.2em] tracking-normal">Submit changes</p>
        </Button>
      </div>
    </div>
  );
};

export default AgreementDetailChangesAlert;
