import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

import type { BankAccount } from "src/interfaces/bankAccount";
import { BankAccountsService } from "src/controller/BankAccountsAPI.service";
import {
  BankDetailsForm,
  type BankDetails,
  type SupplierBankDetailsStatus,
} from "src/components/dashboard/account-details/BankDetailsForm";

function parseAddressLineParts(address?: string): Pick<BankDetails, "addressLine1" | "city" | "postalCode"> {
  if (!address) return { addressLine1: "" };
  // Heuristic: "line1, city postal" or "line1, city, postal"
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean);
  const addressLine1 = parts[0] || "";
  const rest = parts.slice(1).join(", ");
  if (!rest) return { addressLine1 };

  const tokens = rest.split(" ").filter(Boolean);
  const maybePostal = tokens.length > 1 ? tokens[tokens.length - 1] : undefined;
  const city = tokens.length > 1 ? tokens.slice(0, -1).join(" ") : rest;
  return { addressLine1, city, postalCode: maybePostal };
}

export const SupplierBankDetailsForm: React.FC<{
  bankAccounts?: BankAccount[];
  onRefetch?: () => Promise<any> | void;
}> = ({ bankAccounts, onRefetch }) => {
  const activeAccount = useMemo(() => {
    // Suppliers only have one usable account in the intended product flow.
    // Prefer `isDefault`, otherwise take the first non-archived record.
    const nonArchived = bankAccounts?.filter((a) => !a.archived) || [];
    return nonArchived.find((a) => a.isDefault) || nonArchived[0] || null;
  }, [bankAccounts]);

  // Suppliers don't require approval in this flow, so if the account exists it's considered linked.
  const supplierStatus: SupplierBankDetailsStatus = activeAccount ? "LINKED" : "NOT_LINKED";

  const [isEditing, setIsEditing] = useState<boolean>(supplierStatus !== "LINKED");
  const [saving, setSaving] = useState(false);

  const [bankDetails, setBankDetails] = useState<BankDetails>({
    beneficiaryName: "",
    country: "",
    addressLine1: "",
    city: "",
    postalCode: "",
    bankName: "",
    accountNumber: "",
    swiftCode: "",
  });

  useEffect(() => {
    if (supplierStatus === "LINKED" && activeAccount) {
      const addr = parseAddressLineParts(activeAccount.accountHolderAddress);
      setBankDetails({
        beneficiaryName: activeAccount.accountHolderName,
        country: activeAccount.countryCode || "",
        addressLine1: addr.addressLine1 || "",
        city: addr.city || "",
        postalCode: addr.postalCode || "",
        bankName: activeAccount.bankName || "",
        accountNumber: `•••• ${activeAccount.accountLast4}`,
        swiftCode: activeAccount.swiftBic || "",
      });
      setIsEditing(false);
      return;
    }

    // When not linked, default to editing mode (user can submit details for approval).
    setIsEditing(true);
  }, [activeAccount, supplierStatus]);

  const handleToggleEdit = () => {
    if (supplierStatus !== "LINKED") {
      setIsEditing(true);
      return;
    }

    if (isEditing) {
      // Cancel edit: restore masked view value.
      if (activeAccount) {
        const addr = parseAddressLineParts(activeAccount.accountHolderAddress);
        setBankDetails({
          beneficiaryName: activeAccount.accountHolderName,
          country: activeAccount.countryCode || "",
          addressLine1: addr.addressLine1 || "",
          city: addr.city || "",
          postalCode: addr.postalCode || "",
          bankName: activeAccount.bankName || "",
          accountNumber: `•••• ${activeAccount.accountLast4}`,
          swiftCode: activeAccount.swiftBic || "",
        });
      }
      setIsEditing(false);
      return;
    }

    // Enter editing: clear account number (re-enter required).
    if (activeAccount) {
      const addr = parseAddressLineParts(activeAccount.accountHolderAddress);
      setBankDetails({
        beneficiaryName: activeAccount.accountHolderName,
        country: activeAccount.countryCode || "",
        addressLine1: addr.addressLine1 || "",
        city: addr.city || "",
        postalCode: addr.postalCode || "",
        bankName: activeAccount.bankName || "",
        // Keep masked last4 visible when editing (same behavior users expect from the old UI).
        accountNumber: `•••• ${activeAccount.accountLast4}`,
        swiftCode: activeAccount.swiftBic || "",
      });
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    const beneficiaryName = bankDetails.beneficiaryName.trim();
    const country = bankDetails.country?.trim() || "";
    const bankName = (bankDetails.bankName || "").trim();
    const accountNumber = bankDetails.accountNumber?.trim() || "";
    const swiftCode = bankDetails.swiftCode?.trim() || "";

    if (!beneficiaryName) return toast.error("Beneficiary name is required.");
    if (!country) return toast.error("Country code is required.");
    if (!bankName) return toast.error("Bank name is required.");
    if (!accountNumber) return toast.error("Account number is required.");
    if (!swiftCode) return toast.error("SWIFT/BIC is required.");

    try {
      setSaving(true);
      const accountHolderAddress = [bankDetails.addressLine1, bankDetails.city, bankDetails.postalCode]
        .filter(Boolean)
        .join(", ");

      if (activeAccount) {
        await BankAccountsService.update(activeAccount.id, {
          currencyCode: "USD",
          countryCode: country.toUpperCase(),
          bankName,
          accountHolderName: beneficiaryName,
          accountNumber,
          swiftBic: swiftCode.toUpperCase(),
          accountHolderAddress: accountHolderAddress || undefined,
          routingNumber: undefined,
          iban: undefined,
        });
      } else {
        await BankAccountsService.create({
          accountType: "supplier",
          provider: "OSN",
          currencyCode: "USD",
          countryCode: country.toUpperCase(),
          bankName,
          accountHolderName: beneficiaryName,
          accountNumber,
          swiftBic: swiftCode.toUpperCase(),
          accountHolderAddress: accountHolderAddress || undefined,
          routingNumber: undefined,
          iban: undefined,
        });
      }

      toast.success(activeAccount ? "Bank account updated." : "Bank account created.");
      await onRefetch?.();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to submit bank account.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="tm-card flex flex-col gap-[20px]">
      <h2 className="text-[18px] font-semibold leading-[1.2em] tracking-normal text-tm-black-80">
        Bank account for payouts
      </h2>

      <BankDetailsForm
        value={bankDetails}
        status={supplierStatus}
        saving={saving}
        isEditing={isEditing}
        onChange={(patch) => setBankDetails((prev) => ({ ...prev, ...patch }))}
        onSave={handleSave}
        onToggleEdit={handleToggleEdit}
      />
    </div>
  );
};

