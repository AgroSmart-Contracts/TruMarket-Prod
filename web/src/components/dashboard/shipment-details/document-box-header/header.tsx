import LandscapeIcon from "@mui/icons-material/Landscape";
import classNames from "classnames";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { useQuery } from "@tanstack/react-query";

import { ShipmentService } from "src/controller/ShipmentAPI.service";
import { AccountTypeEnum, MilestoneEnum } from "src/interfaces/global";
import { Event, IMilestoneStatusInfo } from "src/interfaces/shipment";
import { useAppDispatch, useAppSelector } from "src/lib/hooks";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import EthereumRpc from "src/lib/web3/evm.web3";
import {
  selectMilestoneDetails,
  selectShipmentDetailsCurrentMilestone,
  setShipmentDetailsCurrentMilestone,
} from "src/store/shipmentDetailsSlice";
import { milestones } from "src/lib/static";
import InformationRowDivider from "src/components/common/information-row/information-row-divider";

import MilestoneActionRenderer from "../shipment-milestone-actions";
import { milestoneTwClasses } from "../shipment-milestone-status";

interface DocumentBoxHeaderProps {
  dealId: string;
  refetchShipmentData: () => void;
}

const DocumentBoxHeader: React.FC<DocumentBoxHeaderProps> = ({ dealId, refetchShipmentData }) => {
  const shipmentDetailsCurrentMilestone = useAppSelector(selectShipmentDetailsCurrentMilestone);
  const milestoneDetails = useAppSelector(selectMilestoneDetails);
  const currentMilestoneDetails =
    shipmentDetailsCurrentMilestone === MilestoneEnum.M7
      ? milestoneDetails[shipmentDetailsCurrentMilestone - 1]
      : milestoneDetails[shipmentDetailsCurrentMilestone];

  const milestoneIndex =
    shipmentDetailsCurrentMilestone === MilestoneEnum.M7
      ? shipmentDetailsCurrentMilestone - 1
      : shipmentDetailsCurrentMilestone;
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [rejectActionLoading, setRejectActionLoading] = useState(false);
  const { accountType } = useUserInfo();

  const isBuyer = accountType === AccountTypeEnum.BUYER;

  const buyerHandleApproveMilestone = async () => {
    try {
      setLoading(true);
      const currentMilestone = shipmentDetailsCurrentMilestone + 1;
      const provider = new EthereumRpc();
      const signature = await provider.signMessage(currentMilestone, "23");
      // await ShipmentService.updateShipmentDealDetails(dealId, {
      //   currentMilestone,
      //   signature: signature,
      // });
      await ShipmentService.updateMilestoneStatus(dealId, currentMilestoneDetails.id, { approve: true });
      dispatch(setShipmentDetailsCurrentMilestone({ currentMilestone }));
      toast.success("Milestone approved successfully!");
    } catch (err) {
      toast.error("Error occurred while trying to approve milestone!");
    } finally {
      await refetchShipmentData();
      setLoading(false);
    }
  };

  const {
    data: dealDataLog,
    isLoading: dealDataLogIsLoading,
    refetch,
    isSuccess,
  } = useQuery({
    queryKey: ["get-all-deals"],
    queryFn: () => ShipmentService.getNftLogs(dealId),
    select: (data) => {
      const getDealCreatedLog = data.filter((log) => log.event === Event.DealCreated);
      const getOnlyMilestoneChangedLogs = data.filter((log) => log.event === Event.DealMilestoneChanged);
      const newestItem = getOnlyMilestoneChangedLogs?.reduce((newest, item) => {
        return new Date(item.blockTimestamp) > new Date(newest.blockTimestamp) ? item : newest;
      }, getOnlyMilestoneChangedLogs[0]);

      return {
        milestone: newestItem,
        deal: getDealCreatedLog[0],
      };
    },
    placeholderData: [],
    enabled: Boolean(dealId),
  });

  const handleMilestoneAction = async (
    milestoneStatusInfo: IMilestoneStatusInfo,
    successMessage: string,
    setLoader: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    try {
      setLoader(true);
      await ShipmentService.updateMilestoneStatus(dealId, currentMilestoneDetails.id, milestoneStatusInfo);
      toast.success(successMessage);
    } catch (err) {
      toast.success("Error occurred!");
    } finally {
      await refetchShipmentData();
      setLoader(false);
    }
  };

  return (
    <div className="rounded-tl-[4px] rounded-tr-[4px] border-b border-b-tm-black-20 bg-tm-white px-[20px] py-[11px]">
      <div className="flex items-center justify-between">
        <div className="flex gap-[12px]">
          <div className={classNames("flex h-[39px] w-[39px] items-center justify-center")}>
            {React.cloneElement(milestones[milestoneIndex as MilestoneEnum].icon, { className: "!h-[36px] !w-[36px]" })}
          </div>
          <div>
            <p className="text-[18px] font-bold leading-[1.1em] text-tm-black-80">
              {milestones[milestoneIndex as MilestoneEnum]?.label}
            </p>
            <div className="mt-[2px] flex items-center">
              {dealDataLog?.milestone ? (
                <>
                  <span className="text-[12px] font-light leading-[1em]">
                    Started: {moment(dealDataLog?.milestone.blockTimestamp).format("DD.MM.YYYY")}
                  </span>
                  <InformationRowDivider />
                </>
              ) : null}

              {dealDataLog?.deal ? (
                <span className="text-[12px] font-light leading-[1em]">
                  Approved: {moment(dealDataLog?.deal.blockTimestamp).format("DD.MM.YYYY")}
                </span>
              ) : null}
            </div>
          </div>
        </div>
        <MilestoneActionRenderer
          loading={loading}
          setLoading={setLoading}
          setRejectActionLoading={setRejectActionLoading}
          isBuyer={isBuyer}
          handleMilestoneAction={handleMilestoneAction}
          buyerHandleApproveMilestone={buyerHandleApproveMilestone}
          approvalStatus={currentMilestoneDetails?.approvalStatus}
          rejectActionLoading={rejectActionLoading}
        />
      </div>
    </div>
  );
};

export default DocumentBoxHeader;
