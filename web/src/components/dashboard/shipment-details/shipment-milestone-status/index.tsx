import Stack from "@mui/material/Stack";
import Step, { stepClasses } from "@mui/material/Step";
import { StepIconProps } from "@mui/material/StepIcon";
import StepLabel, { stepLabelClasses } from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import { AirplaneTilt, CheckCircle } from "@phosphor-icons/react";
import classNames from "classnames";
import * as React from "react";

import { IMilestoneDetails, ITransportType, MilestoneApprovalStatus, MilestoneEnum } from "src/interfaces/global";
import { milestones } from "src/lib/static";

import { milestoneStatusFactory } from "./milestoneStatusFactoryFn";
import { ColorlibConnector } from "./mui-custom";

export const milestoneTwClasses: any = {
  [MilestoneApprovalStatus.Submitted]: "bg-tm-blue after:border-l-tm-blue",
  [MilestoneApprovalStatus.Approved]: "bg-tm-green after:border-l-tm-green",
  [MilestoneApprovalStatus.Denied]: "bg-tm-red after:border-l-tm-red",
  [MilestoneApprovalStatus.Pending]: "bg-tm-black-80",
};

function ColorlibStepIcon(
  props: StepIconProps & {
    milestoneStatus?: MilestoneApprovalStatus;
    documentCount: number;
    customIcon: React.ReactElement;
    isBuyer: boolean;
    label: string;
  },
) {
  const { active, completed, className, icon, customIcon, isBuyer, milestoneStatus, label } = props;

  const milestoneIconStyles = milestoneStatusFactory(isBuyer, active, milestoneStatus);
  const extendedCustomIcon =
    milestoneStatus === MilestoneApprovalStatus.Approved ? <CheckCircle weight="duotone" /> : customIcon;
  const IconWithStyle = React.cloneElement(extendedCustomIcon, {
    className: classNames("opacity-30 !h-[26px] !w-[26px]", milestoneIconStyles?.iconClass),
  });

  return (
    <div className="relative flex  w-full justify-between">
      {active ? (
        <div
          className={classNames(
            "rectangle absolute left-[10px] top-[2.5px] z-10 h-[45px] w-[108%]  rounded-[4px] shadow-lg  after:border-l-[22px]",
            milestoneIconStyles?.pointerClass,
          )}
        ></div>
      ) : null}
      <div className="relative z-[99] flex w-full justify-between py-[6px] pl-[30px]">
        <div className={classNames("mt-[2px] flex w-full items-center", active ? "text-tm-white" : "text-tm-black-80")}>
          <p className="flex-shrink-0 text-[13px] leading-[1.2em]">{label}</p>
          <p className="mx-[10px] h-[1px] w-full bg-tm-black-20"></p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-[10px]">
          <div
            className={classNames(
              "relative flex h-[38px] w-[38px] items-center justify-center rounded-[4px]",
              milestoneIconStyles?.containerClass,
            )}
          >
            {IconWithStyle}
          </div>
          <p
            className={classNames(
              "mt-[2px] flex w-[88px] cursor-pointer items-center text-[13px]",
              active ? "text-tm-white" : "text-tm-black-80",
            )}
          >
            {props?.documentCount
              ? `${props?.documentCount} ${props.documentCount === 1 ? "Document" : "Documents"}`
              : null}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ShipmentMilestoneStatus({
  step,
  milestoneInfo,
  currentActiveMilestoneDetails,
  isBuyer,
  handleSelectMilestone,
  transport,
}: {
  step: MilestoneEnum;
  milestoneInfo?: IMilestoneDetails[];
  currentActiveMilestoneDetails: IMilestoneDetails;
  isBuyer: boolean;
  handleSelectMilestone: (milestone: MilestoneEnum) => void;
  transport?: ITransportType;
}) {
  // Hide milestones that have 0% funds distribution in the details timeline
  const visibleMilestones = milestones.filter((m) => {
    const info = milestoneInfo?.[m.milestone];
    const percentage = (info as any)?.fundsDistribution ?? 0;
    return percentage > 0;
  });

  const activeIndex = Math.max(
    0,
    visibleMilestones.findIndex((m) => m.milestone === step),
  );

  return (
    <Stack sx={{ width: "100%" }}>
      <Stepper
        // alternativeLabel
        activeStep={activeIndex}
        sx={{ [`&.${stepClasses.root}`]: { position: "relative", flex: "1" } }}
        orientation="vertical"
        connector={<ColorlibConnector />}
      >
        {visibleMilestones.map((milestone, i) => (
          <Step key={milestone.value}>
            <StepLabel
              onClick={() => handleSelectMilestone(milestone.milestone)}
              StepIconComponent={(props) => (
                // @ts-ignore
                <ColorlibStepIcon
                  {...props}
                  milestoneStatus={milestoneInfo?.[milestone.milestone]?.approvalStatus}
                  documentCount={milestoneInfo?.[i]?.docs?.length as number}
                  label={milestone.label}
                  customIcon={
                    milestone.milestone === MilestoneEnum.M5 && transport === ITransportType.BY_AIR ? (
                      <AirplaneTilt size={26} weight="duotone" />
                    ) : (
                      milestone.icon
                    )
                  }
                  isBuyer={isBuyer}
                />
              )}
              sx={{
                [`& .${stepLabelClasses.labelContainer}`]: { width: 0 },
                [`& .${stepLabelClasses.iconContainer}`]: { width: "100%" },
                [`&.${stepLabelClasses.root}`]: {
                  padding: "8px 0 0 0",
                },
              }}
            ></StepLabel>
          </Step>
        ))}
      </Stepper>
    </Stack>
  );
}
