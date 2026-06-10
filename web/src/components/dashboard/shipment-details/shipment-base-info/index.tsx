import React from "react";
import { useTranslation } from "react-i18next";

import { AccountTypeEnum } from "src/interfaces/global";
import { CurrencyFormatter } from "src/lib/helpers";
import MuiTooltip from "src/components/common/mui-tooltip";
import { AgreementPartyInfo } from "src/interfaces/shipment";

interface ShipmentBaseInfoProps {
  accountType: AccountTypeEnum;
  emailInfo?: AgreementPartyInfo[];
  value: number;
  identifier: string;
}

const CompactRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex min-w-0 items-baseline gap-2.5">
    <span className="w-[5.5rem] shrink-0 text-xs font-medium text-[#64748B] sm:w-24">
      {label}
    </span>
    <div className="min-w-0 flex-1 text-sm font-semibold leading-snug text-[#0F172A]">{children}</div>
  </div>
);

const ShipmentBaseInfo: React.FC<ShipmentBaseInfoProps> = ({
  accountType,
  emailInfo,
  value,
  identifier,
}) => {
  const { t } = useTranslation("shipment");
  const isBuyer = accountType === AccountTypeEnum.BUYER;
  const otherCount = emailInfo?.length ? emailInfo.length - 1 : 0;
  const partyLabel = isBuyer ? t("summary.supplierLabel") : t("summary.buyerLabel");

  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 sm:px-5">
      <p className="mb-2.5 text-sm font-semibold leading-[1.2em] text-[#0F172A] sm:text-[15px]">
        {t("summary.dealDetailsTitle")}
      </p>
      <dl className="space-y-2">
        <CompactRow label={partyLabel}>
          {emailInfo?.length ? (
            <MuiTooltip
              titleHidden={emailInfo.length === 1}
              tooltipText={emailInfo
                .slice(1)
                .map((user) => user.email)
                .join("\n")}
            >
              <span className="block truncate" title={emailInfo[0].email}>
                {`${emailInfo[0].email}${otherCount > 0 ? ` ${t("summary.andOthers", { count: otherCount })}` : ""}`}
              </span>
            </MuiTooltip>
          ) : (
            <span className="text-[#64748B]">—</span>
          )}
        </CompactRow>
        <CompactRow label={t("summary.valueLabel")}>{CurrencyFormatter(value)}</CompactRow>
        <CompactRow label={t("summary.identifierLabel")}>
          <span className="block truncate font-mono text-sm" title={`#${identifier}`}>
            #{identifier}
          </span>
        </CompactRow>
      </dl>
    </div>
  );
};

export default ShipmentBaseInfo;
