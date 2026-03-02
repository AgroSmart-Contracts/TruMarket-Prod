import React from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";

import MilestoneApprovalBox from "src/components/common/milestone-approval";
import MilestoneActionButton from "src/components/common/milestone-approval/milestone-action-button";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import { AccountTypeEnum } from "src/interfaces/global";
import { AgreementPartyInfo } from "src/interfaces/shipment";
import { checkHowManyUserApprovedAgreement, checkIfUserConfirmedAgreement, isApprovedByAllUser } from "src/lib/helpers";

interface AgreementActionsProps {
  handleOpenAcceptModal: () => void;
  buyerEmails: AgreementPartyInfo[];
  supplierEmails: AgreementPartyInfo[];
  handleShowCancelAcceptanceModal: () => void;
}

const AgreementActions: React.FC<AgreementActionsProps> = ({
  handleOpenAcceptModal,
  buyerEmails,
  supplierEmails,
  handleShowCancelAcceptanceModal,
}) => {
  const { accountType, userInfo } = useUserInfo();
  const isBuyer = accountType === AccountTypeEnum.BUYER;

  const renderResultContent = () => {
    const getEmails = () => (isBuyer ? supplierEmails : buyerEmails);
    const getButtonText = () => <span>{isBuyer ? "Supplier" : "Buyer"} acceptance</span>;
    const approvalCount = checkHowManyUserApprovedAgreement(getEmails());
    const allApproved = isApprovedByAllUser(getEmails());
    const isPending = !allApproved && !approvalCount;
    const isPartiallyApproved = !allApproved && approvalCount;

    const renderMilestoneApprovalBox = (bgColor: string, content: React.ReactNode) => (
      <MilestoneApprovalBox buttonPlaceholderText={getButtonText()} milestoneBgColor={bgColor}>
        <div className="mt-[3px] flex gap-[6px] text-[14px] font-bold text-tm-white">{content}</div>
      </MilestoneApprovalBox>
    );

    if (allApproved) {
      return renderMilestoneApprovalBox(
        "bg-tm-green",
        <>
          <p>accepted</p>
          <CheckCircleIcon />
        </>,
      );
    }

    if (isPending) {
      return renderMilestoneApprovalBox(
        "bg-tm-blue",
        <>
          <p>Pending</p>
          <PendingIcon />
        </>,
      );
    }

    if (isPartiallyApproved) {
      return renderMilestoneApprovalBox(
        "bg-tm-blue",
        <>
          <p>
            {approvalCount}/{getEmails().length} Accepted
          </p>
          <PendingIcon />
        </>,
      );
    }

    return null;
  };

  const renderActionContent = () => {
    const getEmails = () => (isBuyer ? buyerEmails : supplierEmails);
    const getButtonText = () => <span>{isBuyer ? "Buyer" : "Supplier"} acceptance</span>;
    const approvalCount = checkHowManyUserApprovedAgreement(getEmails());
    const allApproved = isApprovedByAllUser(getEmails());

    const renderMilestoneApprovalBox = (bgColor: string, childContainerClasses: string, content: React.ReactNode) => (
      <MilestoneApprovalBox
        buttonPlaceholderText={getButtonText()}
        milestoneBgColor={bgColor}
        childContainerClasses={childContainerClasses}
      >
        <div className="flex gap-[6px] text-[14px] font-bold text-tm-white">{content}</div>
      </MilestoneApprovalBox>
    );

    if (allApproved) {
      return renderMilestoneApprovalBox(
        "bg-tm-green",
        "",
        <div
          onClick={handleShowCancelAcceptanceModal}
          className="mt-[3px] flex gap-[6px] text-[14px] font-bold text-tm-white"
        >
          <p>Accepted</p>
          <CheckCircleIcon />
        </div>,
      );
    }

    if (!allApproved) {
      const acceptedByCurrentUser = checkIfUserConfirmedAgreement(getEmails(), userInfo?.user?.id);

      const approvalContent = (
        <div className="flex items-center gap-[6px]">
          <p className="text-tm-white">
            {approvalCount}/{getEmails().length} Accepted
          </p>
          {acceptedByCurrentUser ? <CheckCircleIcon /> : null}
        </div>
      );

      const actionButton = (
        <MilestoneActionButton action={handleOpenAcceptModal} loading={false}>
          <p>Accept</p>
        </MilestoneActionButton>
      );

      return renderMilestoneApprovalBox(
        acceptedByCurrentUser ? "bg-tm-green" : "bg-tm-orange",
        acceptedByCurrentUser ? "!py-[5px] mt-[1px] h-full flex" : "!py-[5px] mt-[1px]",
        <>
          {approvalContent}
          {!acceptedByCurrentUser ? (
            <div className="flex gap-[6px] text-[14px] font-bold text-tm-white">{actionButton}</div>
          ) : null}
        </>,
      );
    }

    return null;
  };

  return (
    <div className="mt-[19px] flex items-center justify-between">
      <div>{renderResultContent()}</div>
      <div>{renderActionContent()}</div>
    </div>
  );
};

export default AgreementActions;
