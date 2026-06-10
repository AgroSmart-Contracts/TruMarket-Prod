import React from "react";
import { useTranslation } from "react-i18next";
import {
  Package,
  CurrencyCircleDollar,
  MapPin,
  EnvelopeSimple,
  FileText,
} from "@phosphor-icons/react";

import {
  CurrencyFormatter,
  normalizeCreatableSelectOptions,
  safeNumber,
  safeString,
} from "src/lib/helpers";

interface ShipmentSummarySidebarProps {
  name: string;
  quantity: string;
  offerUnitPrice: string;
  originLabel: string;
  destinationLabel: string;
  addresseeParticipants: { label: string; value: string }[];
  documentCount: number;
  isBuyer: boolean;
}

const SummaryRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 py-1.5">
    <span className="mt-0.5 text-tm-green/80">{icon}</span>
    <div className="min-w-0 flex-1">
      <p className="text-[11px] text-[#64748B]">{label}</p>
      <p className="text-[13px] font-semibold text-tm-black-80 break-words">{value || "—"}</p>
    </div>
  </div>
);

const ShipmentSummarySidebar: React.FC<ShipmentSummarySidebarProps> = ({
  name,
  quantity,
  offerUnitPrice,
  originLabel,
  destinationLabel,
  addresseeParticipants,
  documentCount,
  isBuyer,
}) => {
  const { t } = useTranslation("dashboard");
  const total = safeNumber(quantity) * safeNumber(offerUnitPrice);
  const emails =
    normalizeCreatableSelectOptions(addresseeParticipants)
      .map((p) => p.label)
      .join(", ") || "—";

  const steps = [
    { key: "create", label: t("createShipment.howItWorksSteps.create"), active: true },
    { key: "confirm", label: t("createShipment.howItWorksSteps.confirm"), active: false },
    { key: "contract", label: t("createShipment.howItWorksSteps.contract"), active: false },
    { key: "track", label: t("createShipment.howItWorksSteps.track"), active: false },
  ];

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-6">
      <div className="tm-card !p-4">
        <h3 className="mb-2 text-[14px] font-semibold text-tm-black-80">
          {t("createShipment.shipmentSummary")}
        </h3>
        <SummaryRow
          icon={<Package size={16} weight="duotone" />}
          label={t("createShipment.summary.product")}
          value={safeString(name)}
        />
        <SummaryRow
          icon={<CurrencyCircleDollar size={16} weight="duotone" />}
          label={t("createShipment.summary.totalValue")}
          value={total > 0 ? CurrencyFormatter(total) : "—"}
        />
        <SummaryRow
          icon={<MapPin size={16} weight="duotone" />}
          label={t("createShipment.summary.origin")}
          value={originLabel}
        />
        <SummaryRow
          icon={<MapPin size={16} weight="duotone" />}
          label={t("createShipment.summary.destination")}
          value={destinationLabel}
        />
        <SummaryRow
          icon={<EnvelopeSimple size={16} weight="duotone" />}
          label={
            isBuyer
              ? t("createShipment.summary.supplier")
              : t("createShipment.summary.buyer")
          }
          value={emails}
        />
        <SummaryRow
          icon={<FileText size={16} weight="duotone" />}
          label={t("createShipment.summary.documents")}
          value={
            documentCount > 0
              ? t("createShipment.steps.filledDocumentsCount", { count: documentCount })
              : t("createShipment.steps.filledDocumentsNone")
          }
        />
      </div>

      <div className="tm-card !p-4">
        <h3 className="mb-3 text-[14px] font-semibold text-tm-black-80">
          {t("createShipment.howItWorks")}
        </h3>
        <ol className="relative space-y-3 pl-1">
          {steps.map((step, index) => (
            <li key={step.key} className="relative flex gap-3 pl-1">
              {index < steps.length - 1 && (
                <span
                  className="absolute left-[11px] top-6 h-[calc(100%+4px)] w-px bg-[#E2E8F0]"
                  aria-hidden
                />
              )}
              <span
                className={`relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                  step.active
                    ? "bg-tm-green text-white"
                    : "border border-[#E2E8F0] bg-white text-[#94A3B8]"
                }`}
              >
                {index + 1}
              </span>
              <span
                className={`pt-0.5 text-[13px] leading-snug ${
                  step.active ? "font-medium text-tm-black-80" : "text-[#64748B]"
                }`}
              >
                {step.label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default ShipmentSummarySidebar;
