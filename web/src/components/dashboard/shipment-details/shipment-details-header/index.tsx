import React, { useEffect, useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

import { AccountTypeEnum } from "src/interfaces/global";
import { DealStatus } from "src/interfaces/shipment";

interface ShipmentDetailsHeaderProps {
  productName?: string;
  publish: () => void;
  isPublished?: boolean;
  userAccountType: string;
  dealStatus?: DealStatus;
}

function dealStatusLabel(status: DealStatus | undefined, t: (key: string) => string): string | null {
  if (status === DealStatus.Confirmed) return t("status.active");
  if (status === DealStatus.Finished) return t("status.finished");
  if (status === DealStatus.Repaid) return t("status.repaid");
  if (status === DealStatus.Proposal) return t("status.proposal");
  return null;
}

const ShipmentDetailsHeader: React.FC<ShipmentDetailsHeaderProps> = ({
  productName,
  publish,
  isPublished,
  userAccountType,
  dealStatus,
}) => {
  const { t } = useTranslation("shipment");
  const [publishEnabled, setPublishEnabled] = useState(false);
  const statusLabel = dealStatusLabel(dealStatus, t);

  useEffect(() => {
    setPublishEnabled(true);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-[26px]">
        {productName}
      </h1>
      {statusLabel ? (
        <span className="inline-flex items-center rounded-md border border-tm-green/30 bg-tm-green-transparent px-2.5 py-0.5 text-xs font-semibold text-tm-primary-dark">
          {statusLabel}
        </span>
      ) : null}
      {publishEnabled &&
        userAccountType === AccountTypeEnum.BUYER &&
        (isPublished ? (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-tm-green">
            {t("published")}
            <CheckCircle size={16} weight="fill" />
          </span>
        ) : (
          <button
            type="button"
            onClick={publish}
            className="rounded-md bg-tm-green px-2.5 py-1 text-sm font-semibold text-white hover:bg-[#3A6A28]"
          >
            {t("publish")}
          </button>
        ))}
    </div>
  );
};

export default ShipmentDetailsHeader;
