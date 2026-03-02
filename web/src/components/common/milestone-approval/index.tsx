import classNames from "classnames";
import React from "react";

import MuiTooltip from "../mui-tooltip";

interface MilestoneApprovalBoxProps {
  withOverlay?: boolean;
  milestoneBgColor: string;
  children: React.ReactNode;
  toolTipText?: string;
  buttonPlaceholderText: React.ReactNode;
  buttonPlaceholderIcon?: React.ReactNode;
  childContainerClasses?: string;
}

const MilestoneApprovalBox: React.FC<MilestoneApprovalBoxProps> = ({
  withOverlay = true,
  milestoneBgColor,
  children,
  toolTipText,
  buttonPlaceholderText,
  buttonPlaceholderIcon,
  childContainerClasses,
}) => {
  return (
    <div className="inline-block w-auto max-w-full rounded-lg shadow-md overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className={classNames("h-full flex-shrink-0", toolTipText ? "cursor-pointer" : "pointer-events-none")}>
          <MuiTooltip tooltipText={toolTipText}>
            <div
              className={classNames(
                "flex items-center gap-2 sm:gap-[10px] rounded-tl-lg rounded-tr-lg sm:rounded-tr-none sm:rounded-bl-lg px-3 sm:px-4 py-3 sm:py-[15px] text-xs sm:text-[12px] font-semibold leading-[1.2em] text-tm-white whitespace-nowrap",
                milestoneBgColor,
              )}
            >
              {buttonPlaceholderIcon && <span className="flex-shrink-0">{buttonPlaceholderIcon}</span>}
              <span className="truncate">{buttonPlaceholderText}</span>
            </div>
          </MuiTooltip>
        </div>
        <div
          className={classNames(
            "relative flex flex-1 items-center justify-end sm:justify-start rounded-bl-lg rounded-br-lg sm:rounded-bl-none sm:rounded-tr-lg min-h-[48px] sm:min-h-0",
            milestoneBgColor,
          )}
        >
          {withOverlay ? (
            <div className="absolute h-full w-full bg-black/20 backdrop-blur-[1px]"></div>
          ) : null}
          <div
            className={classNames(
              "relative z-50 flex h-full w-full items-center justify-center sm:justify-end gap-2 sm:gap-[6px] px-3 sm:px-4 py-2 sm:py-0",
              childContainerClasses,
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneApprovalBox;
