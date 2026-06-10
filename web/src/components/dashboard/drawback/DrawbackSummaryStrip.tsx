import React from "react";
import {
  CalendarBlank,
  CheckCircle,
  CircleDashed,
  Clock,
  CurrencyDollar,
  WarningCircle,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

import { CurrencyFormatter } from "src/lib/helpers";
import {
  dealEndDate,
  dealFobValue,
  daysUntilDrawbackDeadline,
  drawbackClaimDeadlineMoment,
  drawbackRecoveryAmount,
  DRAWBACK_RECOVERY_RATE,
  resolveDrawbackClaimStatus,
  type DrawbackClaimStatus,
} from "src/lib/drawback";
import { pickPrimaryDrawbackFinding } from "src/lib/drawback-decision-tree";
import type {
  DrawbackRequirementRow,
  DrawbackValidationResult,
} from "src/lib/drawback-requirements";
import type { ShippingDetails } from "src/interfaces/shipment";

const statusIconStyles: Record<DrawbackClaimStatus, { icon: Icon; className: string }> = {
  not_started: { icon: CircleDashed, className: "text-[#64748B]" },
  has_error_in_data: { icon: WarningCircle, className: "text-[#DC2626]" },
  primarily_accepted: { icon: CheckCircle, className: "text-tm-green" },
  pending_tax_approval: { icon: Clock, className: "text-[#D97706]" },
};

interface DrawbackSummaryStripProps {
  shipment: ShippingDetails;
  requirements: DrawbackRequirementRow[];
  validation: DrawbackValidationResult;
}

const StatBlock: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
}> = ({ icon, label, value, subtitle }) => (
  <div className="flex min-w-0 flex-1 items-center gap-3 py-2">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-tm-green-transparent">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="text-xs font-medium text-[#64748B]">{label}</p>
      <p className="text-sm font-bold leading-snug text-[#0F172A] sm:text-base">{value}</p>
      {subtitle ? (
        <p className="mt-0.5 line-clamp-2 text-xs text-[#64748B]" title={subtitle}>
          {subtitle}
        </p>
      ) : null}
    </div>
  </div>
);

const BarDivider: React.FC = () => (
  <div className="hidden h-10 w-px shrink-0 bg-[#E2E8F0] sm:block" aria-hidden />
);

const DrawbackSummaryStrip: React.FC<DrawbackSummaryStripProps> = ({
  shipment,
  requirements,
  validation,
}) => {
  const { t } = useTranslation("dashboard");
  const fob = dealFobValue(shipment);
  const recovery = drawbackRecoveryAmount(fob);
  const ratePct = Math.round(DRAWBACK_RECOVERY_RATE * 100);
  const endDate = dealEndDate(shipment);
  const daysLeft = daysUntilDrawbackDeadline(endDate);
  const deadlineMoment = drawbackClaimDeadlineMoment(endDate);
  const deadlineLabel = deadlineMoment ? deadlineMoment.format("DD MMM YYYY") : null;
  const claimStatus = resolveDrawbackClaimStatus(requirements, validation);
  const StatusIcon = statusIconStyles[claimStatus].icon;
  const primaryFinding = pickPrimaryDrawbackFinding(validation.findings);
  const statusSubtitle =
    claimStatus === "has_error_in_data" && primaryFinding
      ? primaryFinding.message
      : t(`drawback.summaryStrip.statusHint.${claimStatus}`);

  return (
    <div className="w-full rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 shadow-sm sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-4 lg:gap-6">
        <StatBlock
          icon={<CurrencyDollar size={20} className="text-tm-green" weight="duotone" />}
          label={t("drawback.summaryStrip.potentialRecovery")}
          value={t("drawback.summaryStrip.upTo", { amount: CurrencyFormatter(recovery) })}
          subtitle={t("drawback.summaryStrip.recoveryHint", { rate: ratePct })}
        />
        <BarDivider />
        <StatBlock
          icon={<CalendarBlank size={20} className="text-tm-green" weight="duotone" />}
          label={t("drawback.summaryStrip.deadlineToClaim")}
          value={daysLeft != null ? t("drawback.context.daysLeft", { count: daysLeft }) : "—"}
          subtitle={
            deadlineLabel
              ? t("drawback.summaryStrip.claimBy", { date: deadlineLabel })
              : undefined
          }
        />
        <BarDivider />
        <StatBlock
          icon={
            <StatusIcon
              size={20}
              className={statusIconStyles[claimStatus].className}
              weight="duotone"
            />
          }
          label={t("drawback.summaryStrip.statusLabel")}
          value={t(`drawback.summaryStrip.status.${claimStatus}`)}
          subtitle={statusSubtitle}
        />
      </div>
    </div>
  );
};

export default DrawbackSummaryStrip;
