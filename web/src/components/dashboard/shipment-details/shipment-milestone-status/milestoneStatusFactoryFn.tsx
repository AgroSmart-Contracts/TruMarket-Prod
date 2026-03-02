import { CheckCircle, Spinner, WarningCircle } from "@phosphor-icons/react";

import { MilestoneApprovalStatus, MilestoneStatus } from "src/interfaces/global";

export const milestoneStatusFactory = (
  isBuyer: boolean,
  active?: boolean,
  milestoneStatus?: MilestoneApprovalStatus,
) => {
  const conditions = [
    {
      condition: milestoneStatus === MilestoneApprovalStatus.Pending && active,
      result: {
        containerClass: `border-tm-white bg-tm-white/20`,
        iconClass: `!fill-tm-white !opacity-100`,
        pointerClass: `bg-tm-black-80 after:border-l-tm-black-80`,
      },
    },
    {
      condition: milestoneStatus === MilestoneApprovalStatus.Submitted && isBuyer,
      result: {
        containerClass: `border-2 border-tm-white bg-tm-yellow-transparent`,
        iconClass: `!fill-tm-white !opacity-100`,
        pointerClass: `bg-tm-yellow after:border-l-tm-yellow`,
      },
    },
    {
      condition: milestoneStatus === MilestoneApprovalStatus.Submitted && !isBuyer,
      result: {
        containerClass: `border-2 border-tm-white bg-tm-blue/10`,
        iconClass: `!fill-tm-white !opacity-100`,
        pointerClass: `bg-tm-blue after:border-l-tm-blue`,
      },
    },
    {
      condition: milestoneStatus === MilestoneApprovalStatus.Denied && isBuyer,
      result: {
        containerClass: `border-2 border-tm-white bg-tm-black-80/10`,
        iconClass: `!fill-tm-white !opacity-100`,
        pointerClass: `bg-tm-black-80 after:border-l-tm-black-80`,
      },
    },
    {
      condition: milestoneStatus === MilestoneApprovalStatus.Denied && !isBuyer,
      result: {
        containerClass: `border-2 border-tm-white bg-tm-red/10`,
        iconClass: `!fill-tm-white !opacity-100`,
        pointerClass: `!bg-tm-red after:border-l-tm-red`,
      },
    },
    {
      condition: milestoneStatus === MilestoneApprovalStatus.Approved,
      result: {
        containerClass: `bg-tm-black-80/10`,
        iconClass: `!fill-bg-tm-black-80 !opacity-100`,
        pointerClass: `!bg-tm-green after:border-l-tm-green`,
      },
    },
  ];

  const match = conditions.find(({ condition }) => condition);
  return match ? match.result : null;
};
