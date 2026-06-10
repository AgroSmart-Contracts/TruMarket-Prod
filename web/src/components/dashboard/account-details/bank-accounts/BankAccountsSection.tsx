import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

import Button, { ButtonSizes, ButtonVariants } from "src/components/common/button";
import Loading from "src/components/common/loading";
import { BankAccountsService } from "src/controller/BankAccountsAPI.service";
import type { BankAccount, BankAccountOwnerType, CreateBankAccountPayload } from "src/interfaces/bankAccount";

import { BankAccountStatusPill } from "./status-pill";
import { formatAccountLabel, formatDetails } from "./utils";
import { BankAccountDetailsModal } from "./BankAccountDetailsModal";
import { AddBankAccountDialog } from "./AddBankAccountDialog";

export const BankAccountsSection: React.FC<{ ownerType: BankAccountOwnerType }> = ({ ownerType }) => {
  const [viewing, setViewing] = useState<BankAccount | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: accounts = [], isLoading, refetch } = useQuery({
    queryKey: ["bank-accounts"],
    queryFn: () => BankAccountsService.list(),
  });

  const sorted = useMemo(() => {
    const list = [...accounts];
    // Default active account first, then active, then pending.
    list.sort((a, b) => {
      const score = (x: BankAccount) =>
        (x.isDefault ? 100 : 0) + (x.status === "ACTIVE" ? 10 : 0) - new Date(x.createdAt).getTime() / 1e15;
      return score(b) - score(a);
    });
    return list;
  }, [accounts]);

  const hasPendingAccounts = useMemo(
    () => sorted.some((a) => a.status === "PENDING_APPROVAL"),
    [sorted],
  );

  useEffect(() => {
    if (!hasPendingAccounts) return;
    // Poll while pending accounts exist so UI auto-updates to ACTIVE after backend sync.
    const id = setInterval(() => {
      refetch();
    }, 20_000);
    return () => clearInterval(id);
  }, [hasPendingAccounts, refetch]);

  const openView = (a: BankAccount) => {
    setViewing(a);
    setViewOpen(true);
  };

  const setDefault = async (id: string) => {
    try {
      setSettingDefaultId(id);
      await BankAccountsService.setDefault(id);
      toast.success("Default bank account updated.");
      await refetch();
      if (viewing?.id === id) {
        const updated = await BankAccountsService.getById(id);
        setViewing(updated);
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to set default.");
    } finally {
      setSettingDefaultId(null);
    }
  };

  const submitNew = async (payload: CreateBankAccountPayload) => {
    try {
      setSubmitting(true);
      await BankAccountsService.create(payload);
      toast.success("Bank account submitted for approval.");
      setAddOpen(false);
      await refetch();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to create bank account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tm-card flex flex-col gap-[14px]">
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-semibold leading-[1.2em] tracking-normal text-tm-black-80">
          Bank accounts
        </h2>
        <Button
          onClick={() => setAddOpen(true)}
          variant={ButtonVariants.FILLED_GREEN}
          size={ButtonSizes.MD}
        >
          <p className="text-[13px] font-bold leading-[1.2em]">+ Add bank account</p>
        </Button>
      </div>

      <div className="rounded-xl border border-[#E5EAF2] bg-[#F8FAFC] px-4 py-3 text-[13px] text-[#6F809B]">
        Updating an account creates a new request that must be approved. Your current active account stays usable
        until the new one is approved.
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loading />
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-lg border border-[#E5EAF2] bg-white p-8 text-center">
          <p className="text-sm text-[#6F809B]">No bank accounts yet. Click “Add bank account” to create one.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-[#E5EAF2] bg-white">
          <table className="min-w-full text-sm bg-white table-fixed">
            <thead className="bg-[#F8FAFC]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6F809B] w-[320px]">Account</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6F809B] w-[340px]">Details</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#6F809B] w-[180px]">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#6F809B] w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDF1F6]">
              {sorted.map((a) => {
                const canSelectDefault = a.status === "ACTIVE";
                return (
                  <tr key={a.id} className="hover:bg-[#F4F7FB] h-16">
                    <td className="px-4 py-4 text-xs text-[#16233B]">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={!canSelectDefault}
                          onClick={() => setDefault(a.id)}
                          className={[
                            "flex h-5 w-5 items-center justify-center rounded-full border",
                            a.isDefault ? "border-[#4E8C37] bg-[#4E8C37]" : "border-[#CBD5E1] bg-white",
                            !canSelectDefault ? "opacity-40 cursor-not-allowed" : "hover:border-[#4E8C37]",
                          ].join(" ")}
                          aria-label={a.isDefault ? "Default bank account" : "Set as default"}
                        >
                          {a.isDefault ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
                        </button>

                        <div className="flex items-center gap-2">
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-[#0F172A]">{formatAccountLabel(a)}</span>
                            <span className="text-[11px] text-[#94A3B8]">{a.bankName}</span>
                          </div>
                          {a.isDefault ? (
                            <span className="inline-flex items-center rounded-full bg-[#EAF3E6] px-2 py-1 text-[11px] font-semibold text-[#2F6B1C]">
                              Default
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-[#16233B]">
                      {formatDetails(a)}
                    </td>
                    <td className="px-4 py-4 text-xs">
                      <BankAccountStatusPill status={a.status} />
                    </td>
                    <td className="px-4 py-4 text-right text-xs">
                      <button
                        type="button"
                        onClick={() => openView(a)}
                        className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#334155] hover:bg-slate-50"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <BankAccountDetailsModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        account={viewing}
        onSetDefault={setDefault}
        settingDefault={!!settingDefaultId && settingDefaultId === viewing?.id}
      />

      <AddBankAccountDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        ownerType={ownerType}
        onSubmit={submitNew}
        submitting={submitting}
      />
    </div>
  );
};

