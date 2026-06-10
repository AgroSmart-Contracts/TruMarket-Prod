import LandscapeIcon from "@mui/icons-material/Landscape";
import classNames from "classnames";
import React, { cloneElement } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";

import { ShipmentService } from "src/controller/ShipmentAPI.service";
import { MilestoneEnum } from "src/interfaces/global";
import { Event } from "src/interfaces/shipment";
import { useAppDispatch, useAppSelector } from "src/lib/hooks";
import {
  selectMilestoneDetails,
  selectShipmentDetailsCurrentMilestone,
} from "src/store/shipmentDetailsSlice";
import { milestones } from "src/lib/static";
import InformationRowDivider from "src/components/common/information-row/information-row-divider";

interface DocumentBoxHeaderProps {
  dealId: string;
  refetchShipmentData: () => void;
}

const DocumentBoxHeader: React.FC<DocumentBoxHeaderProps> = ({ dealId, refetchShipmentData }) => {
  const { t } = useTranslation("shipment");
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

  return (
    <div className="rounded-tl-[4px] rounded-tr-[4px] border-b border-b-tm-black-20 bg-tm-white px-[20px] py-[11px]">
      <div className="flex items-center justify-between">
        <div className="flex gap-[12px]">
          <div className={classNames("flex h-[39px] w-[39px] items-center justify-center")}>
            {cloneElement(milestones[milestoneIndex as MilestoneEnum].icon, { className: "!h-[36px] !w-[36px]" })}
          </div>
          <div>
            <p className="text-[18px] font-bold leading-[1.1em] text-tm-black-80">
              {t(`milestoneSteps.${milestones[milestoneIndex as MilestoneEnum]?.value}`, {
                defaultValue: milestones[milestoneIndex as MilestoneEnum]?.label,
              })}
            </p>
            <div className="mt-[2px] flex items-center">
              {dealDataLog?.milestone ? (
                <>
                  <span className="text-[12px] font-light leading-[1em]">
                    {t("labels.started")} {moment(dealDataLog?.milestone.blockTimestamp).format("DD.MM.YYYY")}
                  </span>
                  <InformationRowDivider />
                </>
              ) : null}

              {dealDataLog?.deal ? (
                <span className="text-[12px] font-light leading-[1em]">
                  {t("labels.approved")} {moment(dealDataLog?.deal.blockTimestamp).format("DD.MM.YYYY")}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentBoxHeader;
