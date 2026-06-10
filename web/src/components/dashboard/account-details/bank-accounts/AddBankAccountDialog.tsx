import React, { useMemo, useState } from "react";

import TMModal from "src/components/common/modal";
import Button, { ButtonSizes, ButtonVariants } from "src/components/common/button";
import CancelBackButton from "src/components/common/cancel-back-button";
import { Field, FieldContent, FieldLabel } from "src/components/ui/field";
import { Input } from "src/components/ui/input";
import type { BankAccountOwnerType, CreateBankAccountPayload } from "src/interfaces/bankAccount";

const Required = () => <span className="text-red">*</span>;

export const AddBankAccountDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  ownerType: BankAccountOwnerType;
  onSubmit: (payload: CreateBankAccountPayload) => Promise<void>;
  submitting?: boolean;
}> = ({ open, onClose, ownerType, onSubmit, submitting }) => {
  const [showOptional, setShowOptional] = useState(false);
  const [form, setForm] = useState({
    nickname: "",
    currencyCode: "USD",
    countryCode: "US",
    bankName: "",
    accountNumber: "",
    swiftBic: "",
    accountHolderName: "",
    routingNumber: "",
    iban: "",
    bankAddress: "",
    accountHolderAddress: "",
  });

  const canSubmit = useMemo(() => {
    return (
      form.currencyCode.trim() &&
      form.countryCode.trim() &&
      form.bankName.trim() &&
      form.accountHolderName.trim() &&
      form.accountNumber.trim() &&
      form.swiftBic.trim()
    );
  }, [form]);

  if (!open) return null;

  const submit = async () => {
    if (!canSubmit) return;
    await onSubmit({
      accountType: ownerType,
      provider: "OSN",
      nickname: form.nickname.trim() || undefined,
      currencyCode: form.currencyCode.trim().toUpperCase(),
      countryCode: form.countryCode.trim().toUpperCase(),
      bankName: form.bankName.trim(),
      accountHolderName: form.accountHolderName.trim(),
      accountNumber: form.accountNumber.trim(),
      swiftBic: form.swiftBic.trim().toUpperCase(),
      routingNumber: form.routingNumber.trim() || undefined,
      iban: form.iban.trim() || undefined,
      bankAddress: form.bankAddress.trim() || undefined,
      accountHolderAddress: form.accountHolderAddress.trim() || undefined,
    });
  };

  const renderField = (key: keyof typeof form, label: string, opts?: { required?: boolean }) => (
    <Field className="gap-0">
      <FieldLabel className="text-[13px] text-tm-black-80">
        {label} {opts?.required ? <Required /> : null}
      </FieldLabel>
      <FieldContent className="gap-0">
        <Input
          value={form[key]}
          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
          className="mt-2"
        />
      </FieldContent>
    </Field>
  );

  return (
    <TMModal
      open={open}
      handleClose={onClose}
      classOverrides="max-w-[720px]"
      showHeader
      headerText="Add bank account"
    >
      <div className="px-6 pb-5 pt-[70px] sm:pt-[72px]">
        <div className="mb-4 rounded-xl border border-[#F5D7A1] bg-[#FFF4E5] px-4 py-3 text-[13px] text-[#8A5A14]">
          You’re submitting a new bank account request for approval. Your current active account stays usable
          until this new request is approved.
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {renderField("nickname", "Nickname (optional)")}
          <div className="hidden md:block" />
          {renderField("currencyCode", "Currency code", { required: true })}
          {renderField("countryCode", "Country code (ISO2)", { required: true })}
          {renderField("bankName", "Bank name", { required: true })}
          {renderField("accountNumber", "Account number", { required: true })}
          {renderField("swiftBic", "SWIFT/BIC", { required: true })}
          {renderField("accountHolderName", "Account holder name", { required: true })}
        </div>

        <button
          type="button"
          onClick={() => setShowOptional((s) => !s)}
          className="mt-4 flex w-full items-center justify-between rounded-xl border border-[#E5EAF2] bg-white px-4 py-3 text-left text-[13px] font-semibold text-[#16233B]"
        >
          <span>Optional details</span>
          <span className="text-[#6F809B]">{showOptional ? "Hide" : "Show"}</span>
        </button>
        {showOptional ? (
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
            {renderField("routingNumber", "Routing number")}
            {renderField("iban", "IBAN")}
            {renderField("bankAddress", "Bank address")}
            {renderField("accountHolderAddress", "Account holder address")}
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between">
          <CancelBackButton type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </CancelBackButton>
          <Button
            onClick={submit}
            variant={ButtonVariants.FILLED_GREEN}
            size={ButtonSizes.MD}
            disabled={!canSubmit || submitting}
          >
            <p className="text-[13px] font-bold leading-[1.2em]">
              {submitting ? "Submitting..." : "Submit for approval"}
            </p>
          </Button>
        </div>
      </div>
    </TMModal>
  );
};

