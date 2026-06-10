import React from "react";

import TMModal from "src/components/common/modal";
import Button, { ButtonSizes, ButtonVariants } from "src/components/common/button";
import CancelBackButton from "src/components/common/cancel-back-button";
import type { BankAccount } from "src/interfaces/bankAccount";

import { BankAccountStatusPill } from "./status-pill";

const Row: React.FC<{ label: string; value?: React.ReactNode }> = ({ label, value }) => {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="grid grid-cols-[180px,1fr] gap-x-6 px-6 py-3 text-[13px]">
      <span className="text-tm-black-60">{label}</span>
      <span className="font-semibold text-tm-black-80 break-words">{value}</span>
    </div>
  );
};

export const BankAccountDetailsModal: React.FC<{
  open: boolean;
  onClose: () => void;
  account?: BankAccount | null;
  onSetDefault?: (id: string) => void;
  settingDefault?: boolean;
}> = ({ open, onClose, account, onSetDefault, settingDefault }) => {
  if (!open) return null;

  const canSetDefault =
    !!account &&
    account.status === "ACTIVE" &&
    !account.isDefault;

  return (
    <TMModal
      open={open}
      handleClose={onClose}
      classOverrides="max-w-[720px]"
      showHeader
      headerText="Bank account details"
    >
      <div className="px-0 pb-5 pt-[70px] sm:pt-[72px]">
        {account?.status === "PENDING_APPROVAL" ? (
          <div className="mx-6 mb-4 rounded-xl border border-[#F5D7A1] bg-[#FFF4E5] px-4 py-3 text-[13px] text-[#8A5A14]">
            This bank account can’t be used yet. We’ll notify you once it’s approved.
          </div>
        ) : null}

        <div className="mx-6 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {account ? <BankAccountStatusPill status={account.status} /> : null}
            {account?.isDefault ? (
              <span className="inline-flex items-center rounded-full bg-[#EAF3E6] px-2.5 py-1 text-[12px] font-semibold text-[#2F6B1C]">
                Default
              </span>
            ) : null}
          </div>

          {canSetDefault ? (
            <Button
              onClick={() => onSetDefault?.(account.id)}
              variant={ButtonVariants.FILLED_GREEN}
              size={ButtonSizes.MD}
              disabled={settingDefault}
            >
              <p className="text-[13px] font-bold leading-[1.2em]">
                {settingDefault ? "Setting..." : "Set as default"}
              </p>
            </Button>
          ) : null}
        </div>

        <div className="mx-6 overflow-hidden rounded-xl border border-[#E5EAF2] bg-white">
          <div className="divide-y divide-[#EDF1F6]">
            <Row label="Nickname" value={account?.nickname} />
            <Row label="Currency code" value={account?.currencyCode} />
            <Row label="Country code (ISO2)" value={account?.countryCode} />
            <Row label="Bank name" value={account?.bankName} />
            <Row label="Account holder name" value={account?.accountHolderName} />
            <Row label="Account number" value={account ? `•••• ${account.accountLast4}` : undefined} />
            <Row label="SWIFT/BIC" value={account?.swiftBic} />
            <Row label="Routing number" value={account?.routingNumber} />
            <Row label="Bank address" value={account?.bankAddress} />
            <Row label="Account holder address" value={account?.accountHolderAddress} />
          </div>
        </div>

        <div className="mt-5 flex justify-end px-6">
          <CancelBackButton type="button" onClick={onClose}>
            Close
          </CancelBackButton>
        </div>
      </div>
    </TMModal>
  );
};

