import React from "react";
import Link from "next/link";
import { CaretRight, Wallet } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

import { CurrencyFormatter } from "src/lib/helpers";
import type { DrawbackSummary } from "src/lib/drawback";

interface DrawbackRecoveryBannerProps {
  summary: DrawbackSummary;
}

const DrawbackRecoveryBanner: React.FC<DrawbackRecoveryBannerProps> = ({ summary }) => {
  const { t } = useTranslation("dashboard");

  if (summary.eligibleCount === 0 || summary.totalRecovery <= 0) {
    return null;
  }

  const detailHref = summary.firstEligibleDealId
    ? `/dashboard/shipment-details/${summary.firstEligibleDealId}?tab=drawback`
    : "/dashboard";

  return (
    <div className="rounded-xl border border-tm-green/20 bg-tm-green-transparent px-4 py-4 sm:px-6 sm:py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-tm-green text-white shadow-sm">
            <Wallet size={26} weight="duotone" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-tm-primary-dark">
              {t("drawback.banner.label")}
            </p>
            <p className="mt-1 text-base font-bold leading-snug text-[#0F172A] sm:text-lg">
              {t("drawback.banner.headline", {
                amount: CurrencyFormatter(summary.totalRecovery),
                count: summary.eligibleCount,
              })}
            </p>
            <p className="mt-1 text-sm text-[#475569]">{t("drawback.banner.subtitle")}</p>
          </div>
        </div>
        <Link
          href={detailHref}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-tm-green hover:text-tm-primary-dark"
        >
          {t("drawback.banner.cta")}
          <CaretRight size={16} weight="bold" />
        </Link>
      </div>
    </div>
  );
};

export default DrawbackRecoveryBanner;
