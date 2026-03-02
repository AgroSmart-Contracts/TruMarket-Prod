import { CheckCircle, Spinner, WarningCircle } from "@phosphor-icons/react";

import { MilestoneApprovalStatus, MilestoneStatus } from "src/interfaces/global";

import ShipmentBoxBadge from "./shipment-box-badge";

export const milestoneStatusFactory = (
  isBuyer: boolean,
  nextMilestoneStatus: MilestoneApprovalStatus,
  milestoneStatus: MilestoneApprovalStatus,
  hasNewDocuments: boolean,
  active: any,
) => {
  const conditions = [
    {
      condition: milestoneStatus === MilestoneApprovalStatus.Submitted && active && isBuyer,
      result: {
        containerClass: `border-2 border-tm-yellow cursor-pointer bg-tm-yellow-transparent hover:bg-[#EDAD21]/20`,
        iconClass: `!fill-tm-yellow !opacity-100`,
        icon: <Spinner height={26} width={26} color="#FCB13F" />,
        badge: null,
      },
    },
    {
      condition:
        !isBuyer &&
        nextMilestoneStatus === MilestoneApprovalStatus.Pending &&
        milestoneStatus === MilestoneApprovalStatus.Approved,
      result: {
        containerClass: `border-2 border-tm-green cursor-pointer bg-tm-green-transparent hover:bg-tm-green/20`,
        iconClass: `!fill-tm-green !opacity-100`,
        icon: <CheckCircle height={26} width={26} color="#278F7C" weight="duotone" />,
        badge: (
          <ShipmentBoxBadge badgeTitle="Milestone confirmed" classOverrides="bg-tm-green-transparent !text-tm-green" />
        ),
      },
    },
    {
      condition: milestoneStatus === MilestoneApprovalStatus.Submitted && isBuyer,
      result: {
        containerClass: `border-2 border-tm-yellow cursor-pointer bg-tm-yellow-transparent hover:bg-[#EDAD21]/20`,
        iconClass: `!fill-tm-yellow !opacity-100`,
        icon: <Spinner height={26} width={26} color="#FCB13F" />,
        badge: (
          <ShipmentBoxBadge
            badgeTitle="Pending your confirmation"
            classOverrides="bg-tm-yellow-transparent !text-tm-yellow"
          />
        ),
      },
    },
    {
      condition: milestoneStatus === MilestoneApprovalStatus.Submitted && !isBuyer,
      result: {
        containerClass: `border-2 border-tm-blue cursor-pointer bg-tm-blue/10 hover:bg-tm-blue/20`,
        iconClass: `!fill-tm-blue !opacity-100`,
        icon: <Spinner height={26} width={26} color="#4EA4D9" />,
        badge: (
          <ShipmentBoxBadge badgeTitle="Pending buyer confirmation" classOverrides="bg-tm-blue/10 !text-tm-blue" />
        ),
      },
    },
    {
      condition: milestoneStatus === MilestoneApprovalStatus.Denied && !isBuyer,
      result: {
        containerClass: `border-2 border-tm-red cursor-pointer bg-tm-red/10 hover:bg-tm-red/20`,
        iconClass: `!fill-tm-red !opacity-100`,
        icon: <WarningCircle height={26} width={26} color="#D9486E" />,
        badge: <ShipmentBoxBadge badgeTitle="Milestone denied" classOverrides="bg-tm-red/10 !text-tm-red" />,
      },
    },
    {
      condition: milestoneStatus === MilestoneApprovalStatus.Denied && isBuyer,
      result: {
        containerClass: `cursor-pointer bg-tm-black-80/10 hover:bg-tm-black-80/20`,
        iconClass: `!fill-tm-black-80 !opacity-100`,
        icon: null,
        badge: null,
      },
    },
    {
      condition: milestoneStatus === MilestoneApprovalStatus.Approved,
      result: {
        containerClass: `cursor-pointer bg-tm-black-80/10 hover:bg-tm-black-80/20`,
        iconClass: `!fill-bg-tm-black-80 !opacity-100`,
        icon: <CheckCircle height={26} width={26} color="#2D3E57" weight="duotone" />,
        badge: null,
      },
    },
    {
      condition: hasNewDocuments && active && isBuyer,
      result: {
        containerClass: `cursor-pointer border-2 border-tm-black-80 bg-tm-black-80/10 hover:bg-tm-black-80/20`,
        iconClass: `!fill-bg-tm-black-80 !opacity-100`,
        icon: null,
        badge: null,
      },
    },
    {
      condition: hasNewDocuments && active && !isBuyer,
      result: {
        containerClass: `cursor-pointer  bg-tm-black-80/10 hover:bg-tm-black-80/20`,
        iconClass: `!fill-bg-tm-black-80 !opacity-100`,
        icon: null,
        badge: null,
      },
    },
  ];

  const match = conditions.find(({ condition }) => condition);
  return match ? match.result : null;
};
