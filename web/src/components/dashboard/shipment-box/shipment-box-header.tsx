import React, { useCallback } from "react";

import { AccountTypeEnum, IMilestoneDetails, MilestoneEnum } from "src/interfaces/global";
import { DealStatus, AgreementPartyInfo } from "src/interfaces/shipment";
import { milestones as MilestoneData } from "src/lib/static";
import DrawbackDealBadge from "src/components/dashboard/drawback/DrawbackDealBadge";
import type { ShippingDetails } from "src/interfaces/shipment";

import ShipmentBoxBadge from "./shipment-box-badge";
import { milestoneStatusFactory } from "./milestoneStausFactoryFn";

interface ShipmentBoxHeaderProps {
  entityTitle: string;
  entityId: string;
  accountType: AccountTypeEnum;
  isNew: boolean;
  newDocuments: boolean;
  userId: string;
  status: DealStatus;
  supplierEmails: AgreementPartyInfo[];
  buyerEmails: AgreementPartyInfo[];
  milestones: IMilestoneDetails[];
  currentMilestone: MilestoneEnum;
  active: boolean;
  shipment?: ShippingDetails;
}

const renderBadge = (condition: boolean, title: string, className: string) => {
  return condition ? <ShipmentBoxBadge badgeTitle={title} classOverrides={className} /> : null;
};

const ShipmentBoxHeader: React.FC<ShipmentBoxHeaderProps> = ({
  entityTitle,
  accountType,
  isNew,
  newDocuments,
  status,
  milestones,
  currentMilestone,
  active,
  shipment,
}) => {
  const isBuyer = accountType === AccountTypeEnum.BUYER;

  const renderMilestoneInfoBadge = useCallback(() => {
    return MilestoneData.map((step) => {
      const milestoneInfoRenderer = milestoneStatusFactory(
        isBuyer,
        milestones[step.milestone + 1]?.status,
        milestones[step.milestone]?.status,
        false,
        active,
      );
      return milestoneInfoRenderer;
    });
  }, [currentMilestone, milestones, isBuyer]);

  return (
    <div className="border-b border-b-tm-black-20 px-4 py-3 sm:px-5 sm:py-[18px] lg:px-[20px]">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-[6px]">
          <p className="truncate font-sans text-[15px] font-bold capitalize leading-[1.2em] text-tm-black-80">{entityTitle}</p>
          {/* <span className="text-[13px] leading-[1em] text-tm-black-80">#{entityId}</span> */}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-[8px]">
          {shipment && accountType === AccountTypeEnum.SUPPLIER ? (
            <DrawbackDealBadge shipment={shipment} />
          ) : null}
          {renderBadge(isNew && isBuyer, "New", "bg-[#2d3e571a] !text-tm-black-80")}
          {renderBadge(
            status === DealStatus.Confirmed && newDocuments && isBuyer,
            "New documents",
            "bg-[#2d3e571a] !text-tm-black-80",
          )}
          {renderMilestoneInfoBadge().map((milestoneInfo) => (
            <>{milestoneInfo?.badge}</>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShipmentBoxHeader;
