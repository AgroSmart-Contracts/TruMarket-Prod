import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";
import { StepIconProps } from "@mui/material/StepIcon";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import { styled } from "@mui/material/styles";
import { AirplaneTilt } from "@phosphor-icons/react";
import classNames from "classnames";
import * as React from "react";

import { IMilestoneDetails, ITransportType, MilestoneApprovalStatus, MilestoneEnum } from "src/interfaces/global";
import { milestones as MilestoneData } from "src/lib/static";

import { milestoneStatusFactory } from "./milestoneStausFactoryFn";

const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 15,
    display: "flex",
    justifyContent: "center",
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: "2px",
    border: 0,
    width: "20px",
    backgroundColor: "#00000033",
    borderRadius: 1,
    top: "5px",
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      right: "-9px",
      top: "-1px",
      transform: "translateY(-50%)",
      rotate: "270deg",
      width: 0,
      height: 0,
      borderLeft: "5px solid transparent",
      borderRight: "5px solid transparent",
      borderTop: "5px solid #00000033",
    },
  },
}));

function ColorlibStepIcon(
  props: StepIconProps & {
    milestoneStatus: MilestoneApprovalStatus;
    status: MilestoneEnum | undefined;
    icon: React.ReactElement;
    isBuyer: boolean;
    hasNewDocuments: boolean;
    prevMilestoneStatus: MilestoneApprovalStatus;
    nextMilestoneStatus: MilestoneApprovalStatus;
    setActive: React.Dispatch<React.SetStateAction<boolean>>;
  },
) {
  const {
    active,
    completed,
    className,
    icon,
    milestoneStatus,
    isBuyer,
    hasNewDocuments,
    prevMilestoneStatus,
    nextMilestoneStatus,
    setActive,
  } = props;

  const milestoneInfoRenderer = milestoneStatusFactory(
    isBuyer,
    nextMilestoneStatus,
    milestoneStatus,
    hasNewDocuments,
    active,
  );

  const IconWithStyle = React.cloneElement(icon, {
    className: classNames("opacity-30", milestoneInfoRenderer?.iconClass),
  });

  React.useEffect(() => {
    setActive(active!);
  }, [active]);

  return (
    <div className="relative">
      <div>
        <div
          className={classNames(
            "flex h-[40px] max-w-[80px] items-center justify-center gap-[10px] rounded-[4px] px-[10px]",
            milestoneInfoRenderer?.containerClass,
          )}
        >
          {IconWithStyle}
          {milestoneInfoRenderer?.icon}
        </div>
      </div>
    </div>
  );
}

export default function HorizontalMilestones({
  status,
  milestones,
  isBuyer,
  hasNewDocuments,
  setActive,
  transport,
}: {
  status: MilestoneEnum | undefined;
  milestones: IMilestoneDetails[];
  isBuyer: boolean;
  hasNewDocuments: boolean;
  setActive: React.Dispatch<React.SetStateAction<boolean>>;
  transport: ITransportType;
}) {
  return (
    <Stack sx={{ width: "100%" }}>
      <Stepper alternativeLabel activeStep={status} connector={<ColorlibConnector />}>
        {MilestoneData.map((step) => (
          <Step key={step.milestone} sx={{ paddingLeft: 0, paddingRight: 0, width: "30px" }}>
            <StepLabel
              // ColorlibStepIcon expects additional props beyond MUI's StepIconProps
              // which are provided here, so the cast is safe.
              StepIconComponent={(props) => (
                // @ts-ignore
                <ColorlibStepIcon
                  {...props}
                  milestoneStatus={milestones[step.milestone]?.approvalStatus}
                  prevMilestoneStatus={milestones[step.milestone - 1]?.approvalStatus}
                  nextMilestoneStatus={milestones[step.milestone + 1]?.approvalStatus}
                  icon={
                    step.milestone === MilestoneEnum.M5 && transport === ITransportType.BY_AIR ? (
                      <AirplaneTilt size={26} weight="duotone" />
                    ) : (
                      step.icon
                    )
                  }
                  status={status}
                  isBuyer={isBuyer}
                  hasNewDocuments={hasNewDocuments}
                  setActive={setActive}
                />
              )}
            ></StepLabel>
          </Step>
        ))}
      </Stepper>
    </Stack>
  );
}
