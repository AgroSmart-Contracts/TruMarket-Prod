import React from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import Flag from "react-world-flags";

import ShipmentInfo from "src/components/common/shipment-info";
import ShipmentFinance from "src/components/dashboard/shipment-details/shipment-details-header/ShipmentFinance";
import ShipmentMilestoneStatus from "src/components/dashboard/shipment-details/shipment-milestone-status";
import { IMilestoneDetails, MilestoneEnum } from "src/interfaces/global";
import type { ShippingDetails } from "src/interfaces/shipment";
import { formatRouteLabel, getCountryCode } from "src/lib/helpers";

interface ShipmentMilestonesPanelProps {
  shipment: ShippingDetails;
  currentMilestone: MilestoneEnum;
  currentMilestoneDetails: IMilestoneDetails;
  isBuyer: boolean;
  onSelectMilestone: (milestone: MilestoneEnum) => void;
  onComplete: () => Promise<void>;
  completing: boolean;
}

const ShipmentMilestonesPanel: React.FC<ShipmentMilestonesPanelProps> = ({
  shipment,
  currentMilestone,
  currentMilestoneDetails,
  isBuyer,
  onSelectMilestone,
  onComplete,
  completing,
}) => {
  const { t } = useTranslation("shipment");

  return (
    <>
      <div className="rounded-[4px] border border-[#E5EAF2] bg-[#FFFFFF] shadow-[0_10px_25px_rgba(15,23,42,0.08)]">
        <div className="border-b border-b-[#E2E8F0] px-4 py-4 sm:px-[24px]">
          <p className="text-sm font-semibold leading-[1.2em] text-[#0F172A] sm:text-[15px]">
            {t("milestonesTitle")}
          </p>
        </div>
        <div className="px-4 pb-5 pt-4 sm:px-[24px] sm:pb-[24px] sm:pt-[20px]">
          <div className="flex items-start gap-2 sm:gap-[10px]">
            <div className="h-[20px] w-[20px] flex-shrink-0">
              <Flag code={getCountryCode(shipment.origin as string)} />
            </div>
            <ShipmentInfo
              title={formatRouteLabel(shipment.portOfOrigin, shipment.origin)}
              value={`${moment(shipment.shippingStartDate).format("DD.MM.YYYY")} | ${moment(
                shipment.shippingStartDate,
              )
                .endOf("day")
                .fromNow()}`}
            />
          </div>
          <div className="py-2 sm:py-[8px]">
            <ShipmentMilestoneStatus
              step={currentMilestone || 0}
              milestoneInfo={shipment.milestones || []}
              currentActiveMilestoneDetails={currentMilestoneDetails}
              isBuyer={isBuyer}
              handleSelectMilestone={onSelectMilestone}
              transport={shipment.transport}
            />
          </div>
          <div className="flex items-start gap-2 sm:gap-[10px]">
            <div className="h-[20px] w-[20px] flex-shrink-0">
              <Flag code={getCountryCode(shipment.destination as string)} />
            </div>
            <ShipmentInfo
              title={formatRouteLabel(shipment.portOfDestination, shipment.destination)}
              value={`${moment(shipment.expectedShippingEndDate).format("DD.MM.YYYY")} | ${moment(
                shipment.expectedShippingEndDate,
              )
                .endOf("day")
                .fromNow()}`}
            />
          </div>
        </div>
      </div>

      {shipment.investmentAmount && shipment.vaultAddress ? (
        <ShipmentFinance
          currentMilestone={shipment.currentMilestone}
          requestFundAmount={shipment.investmentAmount}
          vaultAddress={shipment.vaultAddress}
          nftID={shipment.nftID}
          shipmentStatus={shipment.status}
          handleComplete={onComplete}
          borrowerAddress={
            shipment.buyers.length && shipment.buyers[0].walletAddress
              ? shipment.buyers[0].walletAddress
              : ""
          }
          completing={completing}
        />
      ) : null}
    </>
  );
};

export default ShipmentMilestonesPanel;
