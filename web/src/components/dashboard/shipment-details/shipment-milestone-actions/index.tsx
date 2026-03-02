import React from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import CancelIcon from "@mui/icons-material/Cancel";

import MilestoneActionButton from "src/components/common/milestone-approval/milestone-action-button";
import MilestoneApprovalBox from "src/components/common/milestone-approval";
import { MilestoneApprovalStatus } from "src/interfaces/global";
import { IMilestoneStatusInfo } from "src/interfaces/shipment";
import { ButtonVariants } from "src/components/common/button";

interface MilestoneActionRendererProps {
  isBuyer: boolean;
  approvalStatus: MilestoneApprovalStatus;
  handleMilestoneAction: (
    milestoneStatusInfo: IMilestoneStatusInfo,
    successMessage: string,
    setLoader: React.Dispatch<React.SetStateAction<boolean>>,
  ) => Promise<void>;
  buyerHandleApproveMilestone: () => void;
  loading: boolean;
  rejectActionLoading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setRejectActionLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const MilestoneActionRenderer: React.FC<MilestoneActionRendererProps> = ({
  isBuyer,
  approvalStatus,
  handleMilestoneAction,
  loading,
  rejectActionLoading,
  buyerHandleApproveMilestone,
  setLoading,
  setRejectActionLoading,
}) => {
  if (!isBuyer && approvalStatus === MilestoneApprovalStatus.Pending) {
    return (
      <MilestoneApprovalBox
        buttonPlaceholderText={<span>Milestone approval</span>}
        childContainerClasses="!py-2 sm:!py-[5px]"
        milestoneBgColor="bg-tm-dark-secondary"
        toolTipText="Submit the approval request to ask the buyer to close the milestone."
        withOverlay={false}
      >
          <MilestoneActionButton
            action={() =>
              handleMilestoneAction({ submitToReview: true }, "Milestone submitted successfully!", setLoading)
            }
            loading={loading}
          >
          <span className="text-xs sm:text-[12px]">Submit Request</span>
          </MilestoneActionButton>
      </MilestoneApprovalBox>
    );
  }

  if (!isBuyer && approvalStatus === MilestoneApprovalStatus.Submitted) {
    return (
      <MilestoneApprovalBox
        buttonPlaceholderText={<span>Milestone approval</span>}
        milestoneBgColor="bg-tm-blue"
        toolTipText="Buyer has been notified about your approval request. You will be notified when he confirms or denies the request."
      >
        <div className="flex items-center gap-2 sm:gap-[6px] text-xs sm:text-[12px] font-bold uppercase text-tm-white">
          <span>Pending</span>
          <PendingIcon className="!h-4 !w-4 sm:!h-[15px] sm:!w-[15px]" />
        </div>
      </MilestoneApprovalBox>
    );
  }

  if (isBuyer && approvalStatus === MilestoneApprovalStatus.Pending) {
    return (
      <MilestoneApprovalBox
        buttonPlaceholderText={<span>Milestone approval</span>}
        milestoneBgColor="bg-tm-dark-secondary"
        toolTipText="You will be able to approve the milestone after the Supplier submits the approval request."
        withOverlay={false}
        childContainerClasses="bg-tm-dark-secondary/50 rounded-md"
      >
        <div className="flex items-center gap-2 sm:gap-[6px] text-xs sm:text-[12px] font-bold text-tm-white">
          <span className="truncate">Wait for supplier request</span>
          <PendingIcon className="!h-4 !w-4 sm:!h-[15px] sm:!w-[15px] flex-shrink-0" />
        </div>
      </MilestoneApprovalBox>
    );
  }

  if (isBuyer && approvalStatus === MilestoneApprovalStatus.Submitted) {
    return (
      <MilestoneApprovalBox
        buttonPlaceholderText={<span>Milestone approval</span>}
        childContainerClasses="!py-2 sm:!py-[5px]"
        milestoneBgColor="bg-tm-yellow"
        withOverlay={false}
        toolTipText="Supplier asked you to approve this milestone. Approval will close it permanently and set it as done. After the denial, the supplier will be able to correct the submitted documents/media."
      >
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-[6px] w-full sm:w-auto">
          <MilestoneActionButton
            action={() => handleMilestoneAction({ deny: true }, "Milestone denied!", setRejectActionLoading)}
            loading={rejectActionLoading}
            variant={ButtonVariants.FILLED_RED}
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-[6px]">
              <span className="text-tm-white text-xs sm:text-[12px] font-semibold">Deny</span>
              <CancelIcon className="!h-4 !w-4 sm:!h-[18px] sm:!w-[18px] text-tm-white flex-shrink-0" />
            </div>
          </MilestoneActionButton>
          <MilestoneActionButton
            action={() => buyerHandleApproveMilestone()}
            loading={loading}
            variant={ButtonVariants.FILLED_GREEN}
          >
            <div className="flex items-center justify-center gap-1.5 sm:gap-[6px]">
              <span className="text-tm-white text-xs sm:text-[12px] font-semibold">Approve</span>
              {!loading ? (
                <CheckCircleIcon className="!h-4 !w-4 sm:!h-[18px] sm:!w-[18px] text-tm-white flex-shrink-0" />
              ) : null}
            </div>
          </MilestoneActionButton>
        </div>
      </MilestoneApprovalBox>
    );
  }

  if (!isBuyer && approvalStatus === MilestoneApprovalStatus.Denied) {
    return (
      <MilestoneApprovalBox
        buttonPlaceholderText={<span>Milestone approval</span>}
        childContainerClasses="!py-2 sm:!py-[5px]"
        milestoneBgColor="bg-tm-red"
        toolTipText="Buyer denied to approve this milestone. Contact him about the reasons. After correcting the documents/media resubmit the request."
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-[10px] w-full sm:w-auto">
          <div className="flex items-center gap-2 sm:gap-[6px] text-xs sm:text-[12px] font-bold uppercase text-tm-white">
            <span>Denied</span>
            <CancelIcon className="!h-4 !w-4 sm:!h-[15px] sm:!w-[15px] flex-shrink-0" />
          </div>
            <MilestoneActionButton
              action={() =>
                handleMilestoneAction({ submitToReview: true }, "Milestone resubmitted successfully!", setLoading)
              }
              loading={loading}
            >
            <span className="text-xs sm:text-[12px]">Resubmit Request</span>
            </MilestoneActionButton>
        </div>
      </MilestoneApprovalBox>
    );
  }

  if (isBuyer && approvalStatus === MilestoneApprovalStatus.Denied) {
    return (
      <MilestoneApprovalBox
        buttonPlaceholderText={<span>Milestone approval</span>}
        milestoneBgColor="bg-tm-dark-secondary"
        toolTipText="You denied to approve this milestone. Contact the supplier about the reasons. You will be notified when he corrects the submitted documents/media."
        withOverlay={false}
        childContainerClasses="bg-tm-dark-secondary/50 rounded-md"
      >
        <div className="flex items-center gap-2 sm:gap-[6px] text-xs sm:text-[12px] font-bold text-tm-white">
          <span className="truncate">Wait for supplier request</span>
          <PendingIcon className="!h-4 !w-4 sm:!h-[15px] sm:!w-[15px] flex-shrink-0" />
        </div>
      </MilestoneApprovalBox>
    );
  }

  if (approvalStatus === MilestoneApprovalStatus.Approved) {
    return (
      <MilestoneApprovalBox
        buttonPlaceholderText={<span>Milestone approval</span>}
        milestoneBgColor="bg-tm-green"
        toolTipText={`This milestone has been approved by the ${isBuyer ? "buyer" : "supplier"}`}
      >
        <div className="flex items-center gap-2 sm:gap-[6px] text-xs sm:text-[12px] font-bold text-tm-white">
          <span>Approved</span>
          <CheckCircleIcon className="!h-4 !w-4 sm:!h-[15px] sm:!w-[15px] flex-shrink-0" />
        </div>
      </MilestoneApprovalBox>
    );
  }

  return null;
};

export default MilestoneActionRenderer;
