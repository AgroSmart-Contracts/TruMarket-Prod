import React from "react";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import MilestoneApprovalBox from "src/components/common/milestone-approval";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import { AccountTypeEnum } from "src/interfaces/global";
import { AgreementPartyInfo } from "src/interfaces/shipment";

interface AgreementActionsProps {
  buyerEmails: AgreementPartyInfo[];
  supplierEmails: AgreementPartyInfo[];
  handleShowCancelAcceptanceModal: () => void;
}

const AgreementActions: React.FC<AgreementActionsProps> = ({
  buyerEmails,
  supplierEmails,
  handleShowCancelAcceptanceModal,
}) => {
  const { accountType, userInfo } = useUserInfo();
  const currentUserId = userInfo?.user?.id;
  const currentUserEmail = userInfo?.user?.email;
  const isCurrentUserInParty = (party: AgreementPartyInfo[]) =>
    party.some((participant) => participant.id === currentUserId || participant.email === currentUserEmail);
  const isBuyerParticipant = isCurrentUserInParty(buyerEmails);
  const isSupplierParticipant = isCurrentUserInParty(supplierEmails);
  const isBuyer =
    isBuyerParticipant && !isSupplierParticipant ? true : !isBuyerParticipant && isSupplierParticipant ? false : accountType === AccountTypeEnum.BUYER;

  const renderResultContent = () => {
    const getButtonText = () => <span>{isBuyer ? "Supplier" : "Buyer"} acceptance</span>;

    const renderMilestoneApprovalBox = (bgColor: string, content: React.ReactNode) => (
      <MilestoneApprovalBox buttonPlaceholderText={getButtonText()} milestoneBgColor={bgColor}>
        <div className="mt-[3px] flex gap-[6px] text-[14px] font-bold text-tm-white">{content}</div>
      </MilestoneApprovalBox>
    );

    return renderMilestoneApprovalBox(
      "bg-tm-green",
      <>
        <p>Accepted</p>
        <CheckCircleIcon />
      </>,
    );
  };

  const renderActionContent = () => {
    const getButtonText = () => <span>{isBuyer ? "Buyer" : "Supplier"} acceptance</span>;

    const renderMilestoneApprovalBox = (bgColor: string, childContainerClasses: string, content: React.ReactNode) => (
      <MilestoneApprovalBox
        buttonPlaceholderText={getButtonText()}
        milestoneBgColor={bgColor}
        childContainerClasses={childContainerClasses}
      >
        <div className="flex gap-[6px] text-[14px] font-bold text-tm-white">{content}</div>
      </MilestoneApprovalBox>
    );

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
  };

  return (
    <div className="mt-[19px] flex items-center justify-between">
      <div>{renderResultContent()}</div>
      <div>{renderActionContent()}</div>
    </div>
  );
};

export default AgreementActions;
