import { MilestoneStatus } from "src/interfaces/global";

import ShipmentBoxBadge from "./shipment-box-badge";

export const milestoneStatusFactory = (
  isBuyer: boolean,
  _nextMilestoneStatus: unknown,
  _milestoneStatus: unknown,
  hasNewDocuments: boolean,
  active: any,
) => {
  if (hasNewDocuments && active && isBuyer) {
    return {
      containerClass: `cursor-pointer border-2 border-tm-black-80 bg-tm-black-80/10 hover:bg-tm-black-80/20`,
      iconClass: `!fill-bg-tm-black-80 !opacity-100`,
      icon: null,
      badge: <ShipmentBoxBadge badgeTitle="New documents" classOverrides="bg-[#2d3e571a] !text-tm-black-80" />,
    };
  }

  if (hasNewDocuments && active && !isBuyer) {
    return {
      containerClass: `cursor-pointer bg-tm-black-80/10 hover:bg-tm-black-80/20`,
      iconClass: `!fill-bg-tm-black-80 !opacity-100`,
      icon: null,
      badge: null,
    };
  }

  return null;
};
