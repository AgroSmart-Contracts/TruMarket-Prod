import React, { useState } from "react";
import { useRouter } from "next/router";
import moment from "moment";
import Link from "next/link";

import { AccountTypeEnum, IMilestoneDetails, MilestoneEnum } from "src/interfaces/global";
import ShipmentInfo from "src/components/common/shipment-info";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import { getCountryCode, hasDocsWithLength } from "src/lib/helpers";
import { AgreementPartyInfo, DealStatus, ShippingDetails } from "src/interfaces/shipment";

import ShipmentBoxImage from "./shipment-box-image";
import ShipmentBoxHeader from "./shipment-box-header";
import ShipmentBoxFooter from "./shipment-box-footer";
import HorizontalMilestones from "./horizontal-milestones";

interface ShipmentBoxProps {
  shipment: ShippingDetails;
  status: DealStatus;
  notStarted: boolean;
  isNew: boolean;
  newDocuments: boolean;
  supplierEmails: AgreementPartyInfo[];
  buyerEmails: AgreementPartyInfo[];
}

const ShipmentBox: React.FC<ShipmentBoxProps> = ({
  shipment,
  status,
  notStarted,
  isNew,
  newDocuments,
  supplierEmails,
  buyerEmails,
}) => {
  const router = useRouter();
  const { accountType, userInfo } = useUserInfo();
  const isBuyer = accountType === AccountTypeEnum.BUYER;
  const [active, setActive] = useState<boolean>(false);
  const actionButtonText = status === DealStatus.Proposal ? "Review" : "Details";

  const link =
    status === DealStatus.Confirmed || status === DealStatus.Finished
      ? `/dashboard/shipment-details/${shipment.id}`
      : `/dashboard/agreement-details/${shipment.id}`;

  const handleNavigate = () => {
    router.push(link);
  };

  const generateMilestoneStatus = () => {
    //check if milestone is on first stage and has document uploaded
    if (shipment.currentMilestone === MilestoneEnum.M && !hasDocsWithLength(shipment.milestones)) {
      return undefined;
    } else {
      return shipment.currentMilestone;
    }
  };

  const detectIfDealIsUnseenByCurrentUser = () => {
    //only for buyers
    if (isBuyer) {
      const status = buyerEmails.find((buyer) => buyer.id === userInfo?.user?.id)?.new;
      return status as boolean;
    }
    return false;
  };

  return (
    <div className="rounded-[12px] bg-tm-white shadow-md transition-shadow duration-200 hover:shadow-lg">
      <div className="flex flex-col">
        <div className="flex flex-1 flex-col">
          <Link href={link}>
            <ShipmentBoxHeader
              entityTitle={shipment.name}
              entityId={shipment.id}
              notStarted={notStarted}
              isNew={detectIfDealIsUnseenByCurrentUser()}
              supplierEmails={supplierEmails}
              buyerEmails={buyerEmails}
              newDocuments={newDocuments}
              accountType={accountType}
              status={status}
              userId={userInfo?.user?.id}
              active={active}
              milestones={shipment.milestones}
              currentMilestone={shipment.currentMilestone}
            />
            <div className="px-4 sm:px-[20px] py-4 sm:py-[28px]">
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8 px-2 sm:px-6 lg:px-[40px]">
                <div className="w-full lg:w-auto flex justify-start lg:justify-end text-left lg:text-right">
                  <ShipmentInfo
                    title={`${shipment.portOfOrigin}, ${shipment.origin}`}
                    value={`${moment(shipment.shippingStartDate).format("DD.MM.YYYY")}`}
                    titleClassOverrides="text-left"
                    countryCode={getCountryCode(shipment.origin)}
                    subValue="ETD"
                    showFlag
                  />
                </div>
                <div className="w-full">
                  <div className="overflow-x-auto -mx-2 sm:mx-0">
                    <div className="min-w-0 px-2 sm:px-0">
                  <HorizontalMilestones
                    status={generateMilestoneStatus()}
                    milestones={shipment.milestones}
                    isBuyer={isBuyer}
                    hasNewDocuments={shipment.newDocuments!}
                    transport={shipment.transport!}
                    setActive={setActive}
                  />
                </div>
                  </div>
                </div>
                <div className="w-full lg:w-auto flex justify-start lg:justify-end text-left lg:text-right">
                <ShipmentInfo
                  title={`${shipment.portOfDestination}, ${shipment.destination}`}
                  value={`${moment(shipment.expectedShippingEndDate).format("DD.MM.YYYY")}`}
                  countryCode={getCountryCode(shipment.destination)}
                    valueClassOverrides="flex-row lg:flex-row-reverse"
                    titleClassOverrides="text-left lg:text-right"
                  subValue="ETA"
                  showFlag
                />
                </div>
              </div>
            </div>
          </Link>
          <div className="border-t border-t-tm-black-20">
            <ShipmentBoxFooter
              accountType={accountType}
              emailInfo={(isBuyer ? shipment.suppliers : shipment.buyers) || ""}
              value={shipment.totalValue}
              contract={`${shipment.contractId}` || "0"}
              actionButtonText={actionButtonText}
              entityId={shipment.id}
              action={() => handleNavigate()}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShipmentBox;
