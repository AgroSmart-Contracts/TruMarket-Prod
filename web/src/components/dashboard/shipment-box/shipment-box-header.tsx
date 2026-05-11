import React, { useCallback } from "react";

import { AccountTypeEnum, IMilestoneDetails, MilestoneEnum } from "src/interfaces/global";
import { DealStatus, AgreementPartyInfo } from "src/interfaces/shipment";
import { milestones as MilestoneData } from "src/lib/static";

import ShipmentBoxBadge from "./shipment-box-badge";
import { milestoneStatusFactory } from "./milestoneStausFactoryFn";

interface ShipmentBoxHeaderProps {
  entityTitle: string;
  entityId: string;
  accountType: AccountTypeEnum;
  notStarted: boolean;
  isNew: boolean;
  newDocuments: boolean;
  userId: string;
  status: DealStatus;
  supplierEmails: AgreementPartyInfo[];
  buyerEmails: AgreementPartyInfo[];
  milestones: IMilestoneDetails[];
  currentMilestone: MilestoneEnum;
  active: boolean;
}

const renderBadge = (condition: boolean, title: string, className: string) => {
  return condition ? <ShipmentBoxBadge badgeTitle={title} classOverrides={className} /> : null;
};

const ShipmentBoxHeader: React.FC<ShipmentBoxHeaderProps> = ({
  entityTitle,
  accountType,
  notStarted,
  isNew,
  newDocuments,
  status,
  milestones,
  currentMilestone,
  active,
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
    <div className="border-b border-b-tm-black-20 px-[20px] py-[18px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[6px]">
          <p className="font-sans text-[15px] font-bold capitalize leading-[1em]  text-tm-black-80">{entityTitle}</p>
          {/* <span className="text-[13px] leading-[1em] text-tm-black-80">#{entityId}</span> */}
        </div>
        <div className="flex items-center gap-[8px]">
          {}
          {renderBadge(isNew && isBuyer, "New", "bg-[#2d3e571a] !text-tm-black-80")}
          {renderBadge(
            status === DealStatus.Confirmed && notStarted && isBuyer,
            "Not Started",
            "bg-[#2d3e571a] !text-tm-black-80",
          )}
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
