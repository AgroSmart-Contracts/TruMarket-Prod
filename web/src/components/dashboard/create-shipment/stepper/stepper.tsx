import * as React from "react";
import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step, { stepClasses } from "@mui/material/Step";
import StepLabel, { stepLabelClasses } from "@mui/material/StepLabel";
import StepContent, { stepContentClasses } from "@mui/material/StepContent";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { StepIconProps } from "@mui/material/StepIcon";
import classNames from "classnames";

import StepCounter from "src/components/common/step-counter";

import { ColorlibConnector, stepContentStyles, stepLabelStyles } from "./stepper-mui-custom";

function ColorlibStepIcon(props: StepIconProps & { totalSteps: number; label: string }) {
  return (
    <div className="relative">
      <StepCounter
        currentStep={props.icon as number}
        classOverrides={classNames("!text-[13px] !rounded-[20px]  border border-tm-black-20  !py-[3px] bg-tm-white")}
        invert
        innerClassName="text-[13px] font-normal"
        totalSteps={props.totalSteps}
        label={props.label}
      />
    </div>
  );
}

export default function VerticalLinearStepper({ steps, selectedIndex }: { steps: any[]; selectedIndex: number }) {
  const stepperStyles = (index: number) => {
    if (selectedIndex > index && selectedIndex !== index) {
      return {
        backgroundColor: "#ffffff",
        padding: "0px 30px",
        borderBottom: "1px solid #0000000d",
      };
    } else if (selectedIndex < index) {
      return {
        backgroundColor: "#0000000d",
        padding: "0px 30px",
        borderBottom: "1px solid #0000000d",
      };
    } else {
      return { backgroundColor: "#ffffff", padding: "30px", borderRadius: "4px" };
    }
  };

  return (
    <Box>
      <Stepper
        activeStep={selectedIndex}
        sx={{ [`&.${stepClasses.root}`]: { position: "relative", flex: "1" } }}
        connector={<ColorlibConnector />}
        orientation="vertical"
      >
        {steps.map((step, index) => (
          <Step
            key={step.label}
            sx={{
              [`&.${stepClasses.root}`]: stepperStyles(index),
            }}
          >
            <StepLabel
              sx={stepLabelStyles}
              StepIconComponent={(props) => (
                // @ts-ignore
                <ColorlibStepIcon {...props} totalSteps={steps.length} label={step.label} />
              )}
            >
              <div className="mt-[7px]  flex items-center justify-end">
                {/* <div className="flex items-center justify-end rounded-[10px] bg-[red] px-[11px]">
                  <p className="text-[13px] font-medium leading-[1.2em] tracking-normal text-tm-black-80">
                    {step.label}
                  </p>
                </div> */}
                {selectedIndex > index ? <div>{step.filledValues}</div> : null}
              </div>
              {selectedIndex === index ? (
                <div className="relative mt-[20px] flex flex-col items-start gap-[20px] lg:flex-row lg:justify-between">
                  <div className="w-full text-[26px] font-bold leading-[1.1em] text-tm-black-80 lg:w-1/2 lg:text-[30px]">
                    {step?.subLabel}
                    <p className="mt-[10px] max-w-[400px] text-[12px] font-normal leading-[1.2em] tracking-normal text-tm-black-80">
                      {step.hint}
                    </p>
                  </div>
                  <div className="w-full lg:flex-1 lg:pr-[120px]">{step.nodeToRender}</div>
                </div>
              ) : null}

              {index === selectedIndex ? (
                <div className="absolute left-[22px] top-[15px] h-full  w-[1px] bg-tm-gray-light"></div>
              ) : null}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
}
