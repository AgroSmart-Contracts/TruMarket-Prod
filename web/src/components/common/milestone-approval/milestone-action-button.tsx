import React from "react";
import classNames from "classnames";

import Button, { ButtonVariants } from "../button";

interface MilestoneActionButtonProps {
  action: () => void;
  loading: boolean;
  children: React.ReactNode;
  variant?: ButtonVariants;
}

const MilestoneActionButton: React.FC<MilestoneActionButtonProps> = ({ action, loading, children, variant }) => {
  return (
      <Button
        loading={loading}
        disabled={loading}
      classOverrides={classNames(
        "!h-auto !min-h-[40px] sm:!min-h-[36px] !py-2 sm:!py-[7px] !px-3 sm:!px-[20px] !text-xs sm:!text-[12px] !font-semibold !rounded-md !transition-all !duration-200 hover:!scale-105 active:!scale-95",
        "!min-w-[80px] sm:!min-w-[100px]"
      )}
        onClick={() => action()}
      innerClassOverrides="!gap-1 sm:!gap-[6px]"
        variant={variant}
      >
        {children}
      </Button>
  );
};

export default MilestoneActionButton;
