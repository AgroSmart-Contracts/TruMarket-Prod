import { MilestoneStatus } from "src/interfaces/global";

export const milestoneStatusFactory = (
  _isBuyer: boolean,
  active?: boolean,
  milestoneStatus?: MilestoneStatus,
) => {
  if (active) {
    return {
      containerClass: `border-tm-white bg-tm-white/20`,
      iconClass: `!fill-tm-white !opacity-100`,
      pointerClass: `bg-tm-black-80 after:border-l-tm-black-80`,
    };
  }

  if (milestoneStatus === MilestoneStatus.COMPLETED) {
    return {
      containerClass: `bg-tm-black-80/10`,
      iconClass: `!fill-bg-tm-black-80 !opacity-100`,
      pointerClass: `!bg-tm-green after:border-l-tm-green`,
    };
  }

  return {
    containerClass: `bg-tm-black-80/10`,
    iconClass: `!fill-bg-tm-black-80 !opacity-100`,
    pointerClass: `bg-tm-black-80 after:border-l-tm-black-80`,
  };
};
