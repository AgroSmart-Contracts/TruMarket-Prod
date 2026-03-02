import React, { useCallback } from "react";
import classNames from "classnames";

import { AccountTypeEnum, IMilestoneDetails, MilestoneEnum } from "src/interfaces/global";
import { DealStatus, AgreementPartyInfo } from "src/interfaces/shipment";
import { checkHowManyUserApprovedAgreement, checkIfUserConfirmedAgreement, isApprovedByAllUser } from "src/lib/helpers";
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
  entityId,
  accountType,
  userId,
  notStarted,
  isNew,
  newDocuments,
  status,
  supplierEmails,
  buyerEmails,
  milestones,
  currentMilestone,
  active,
}) => {
  const isBuyer = accountType === AccountTypeEnum.BUYER;
  const isSupplier = accountType === AccountTypeEnum.SUPPLIER;

  const createBadge = (title: string, classOverrides: string) => (
    <ShipmentBoxBadge badgeTitle={title} classOverrides={classOverrides} />
  );

  const renderBadges = (badge1: React.ReactNode) => <div className="flex items-center gap-[8px]">{badge1}</div>;

  const renderAgreementBadge = (
    emails: AgreementPartyInfo[],
    isCurrentUserType: boolean,
    userType: AccountTypeEnum,
    approvalQty: number,
    confirmed: boolean,
    status: DealStatus,
  ) => {
    if (status !== DealStatus.Proposal) {
      return null;
    }

    const pendingCurrentUserApproval = createBadge(
      `Pending your confirmation`,
      "bg-tm-yellow-transparent !text-tm-yellow",
    );

    const pendingTypeBadge = createBadge(
      `Pending ${userType} confirmation ${approvalQty}/${emails.length}`,
      "bg-tm-yellow-transparent !text-tm-yellow",
    );

    const confirmedByTypeBadge = createBadge(
      `Confirmed by ${userType} ${approvalQty}/${emails.length}`,
      "bg-tm-green-transparent !text-tm-green",
    );

    const confirmedByTypeBadgeBlue = createBadge(
      `Confirmed by ${userType} ${approvalQty}/${emails.length}`,
      "bg-tm-blue/10 !text-tm-blue",
    );

    if (isCurrentUserType) {
      const currentUserApprovalStatus = checkIfUserConfirmedAgreement(emails, userId);
      if (currentUserApprovalStatus) {
        if (confirmed) {
          return renderBadges(confirmedByTypeBadge);
        }
        if (approvalQty === 0) {
          return renderBadges(pendingTypeBadge);
        }
        if (approvalQty > 0) {
          return renderBadges(confirmedByTypeBadgeBlue);
        }
      } else {
        return renderBadges(pendingCurrentUserApproval);
      }
    } else {
      if (confirmed) {
        return renderBadges(confirmedByTypeBadge);
      }
      if (approvalQty === 0) {
        return renderBadges(pendingTypeBadge);
      }
      if (approvalQty > 0) {
        return renderBadges(confirmedByTypeBadgeBlue);
      }
    }

    return null;
  };

  const renderAgreementBadgeSupplier = () => {
    const supplierApprovalQty = checkHowManyUserApprovedAgreement(supplierEmails);
    const supplierConfirmed = isApprovedByAllUser(supplierEmails);
    return renderAgreementBadge(
      supplierEmails,
      isSupplier,
      AccountTypeEnum.SUPPLIER,
      supplierApprovalQty,
      supplierConfirmed,
      status,
    );
  };

  const renderAgreementBadgeBuyer = () => {
    const buyerApprovalQty = checkHowManyUserApprovedAgreement(buyerEmails);
    const buyerConfirmed = isApprovedByAllUser(buyerEmails);
    return renderAgreementBadge(buyerEmails, isBuyer, AccountTypeEnum.BUYER, buyerApprovalQty, buyerConfirmed, status);
  };

  const renderMilestoneInfoBadge = useCallback(() => {
    return MilestoneData.map((step) => {
      const milestoneInfoRenderer = milestoneStatusFactory(
        isBuyer,
        milestones[step.milestone + 1]?.approvalStatus,
        milestones[step.milestone]?.approvalStatus,
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
          {status === DealStatus.Proposal ? (
            <div
              className={classNames("flex gap-[10px]", {
                " flex-row-reverse": isBuyer,
                "flex-row": !isBuyer,
              })}
            >
              <div>{renderAgreementBadgeBuyer()}</div>
              <div>{renderAgreementBadgeSupplier()}</div>
            </div>
          ) : null}
          {renderMilestoneInfoBadge().map((milestoneInfo) => (
            <>{milestoneInfo?.badge}</>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShipmentBoxHeader;
