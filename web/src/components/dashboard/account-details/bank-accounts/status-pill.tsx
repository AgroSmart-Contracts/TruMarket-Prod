import React from "react";

import type { BankAccountStatus } from "src/interfaces/bankAccount";

export const BankAccountStatusPill: React.FC<{ status: BankAccountStatus }> = ({ status }) => {
  const base =
    "inline-flex items-center justify-center rounded-full px-3 py-[6px] text-[13px] font-semibold whitespace-nowrap border";

  if (status === "ACTIVE") {
    return (
      <span className={`${base} bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]`}>
        Active
      </span>
    );
  }

  return (
    <span className={`${base} bg-[#FFF4E5] text-[#B76A15] border-[#F5D7A1]`}>
      Pending approval
    </span>
  );
};

