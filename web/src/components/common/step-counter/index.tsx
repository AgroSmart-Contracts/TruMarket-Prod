import classNames from "classnames";
import React from "react";

interface StepCounterProps {
  currentStep?: number | string;
  totalSteps?: number | string;
  classOverrides?: string;
  invert?: boolean;
  label?: string;
  innerClassName?: string;
}

const StepCounter: React.FC<StepCounterProps> = ({
  currentStep = 1,
  totalSteps = 2,
  innerClassName = "text-[14px] font-bold ",
  classOverrides,
  label,
  invert = false,
}) => {
  return (
    <div>
      <div>
        <div
          className={classNames(
            "relative z-40 flex items-center justify-center gap-[10px] rounded-[50px] bg-tm-black-80 px-[12px] py-[8px]",
            classOverrides,
          )}
        >
          <span
            className={classNames("whitespace-nowrap leading-[1.2em] tracking-normal ", innerClassName, {
              "text-tm-black-80": invert,
              "text-tm-white": !invert,
            })}
          >
            {currentStep}/{totalSteps}
          </span>
          {label}
        </div>
      </div>
    </div>
  );
};

export default StepCounter;
