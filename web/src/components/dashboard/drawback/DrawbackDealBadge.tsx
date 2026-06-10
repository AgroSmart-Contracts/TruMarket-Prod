import React from "react";
import { useTranslation } from "react-i18next";

import { CurrencyFormatter } from "src/lib/helpers";
import { DealStatus } from "src/interfaces/shipment";
import { drawbackRecoveryAmount, dealFobValue, isDrawbackClaimable } from "src/lib/drawback";
import type { ShippingDetails } from "src/interfaces/shipment";

interface DrawbackDealBadgeProps {
  shipment: ShippingDetails;
}

const DrawbackDealBadge: React.FC<DrawbackDealBadgeProps> = ({ shipment }) => {
  const { t } = useTranslation("dashboard");
  if (!isDrawbackClaimable(shipment)) return null;

  const amount = drawbackRecoveryAmount(dealFobValue(shipment));
  if (amount <= 0) return null;

  const isFinished = shipment.status === DealStatus.Finished;

  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-tm-green/20 bg-tm-green-transparent px-2 py-1 text-[11px] font-semibold text-tm-primary-dark">
      <span aria-hidden>💰</span>
      {isFinished
        ? t("drawback.badge.recovered", { amount: CurrencyFormatter(amount) })
        : t("drawback.badge.recoverable", { amount: CurrencyFormatter(amount) })}
    </span>
  );
};

export default DrawbackDealBadge;
