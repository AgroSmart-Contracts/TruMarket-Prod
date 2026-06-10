import classNames from "classnames";
import React from "react";

interface ShipmentBoxBadgeProps {
  classOverrides?: string;
  badgeTitle: string;
}

const ShipmentBoxBadge: React.FC<ShipmentBoxBadgeProps> = ({ classOverrides, badgeTitle }) => {
  return (
    <div
      className={classNames(
        classOverrides,
        "rounded-[4px] px-[10px] py-[3px] text-[12px] font-medium capitalize text-tm-white",
      )}
    >
      {badgeTitle}
    </div>
  );
};

export default ShipmentBoxBadge;
