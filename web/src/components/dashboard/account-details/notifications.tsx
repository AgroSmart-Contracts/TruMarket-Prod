import React from "react";

import Switcher from "src/components/common/switch";
import { useUserInfo } from "src/lib/hooks/useUserInfo";
import { AccountTypeEnum } from "src/interfaces/global";
import { Notification, UserProfileInfo } from "src/interfaces/auth";
import { AuthService } from "src/controller/AuthAPI.service";

import NotificationTable from "./notification-table";

interface NotificationsProps {
  userProfileInfo?: UserProfileInfo;
  refetch: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ userProfileInfo, refetch }) => {
  const { accountType } = useUserInfo();
  const prefix = accountType === AccountTypeEnum.BUYER ? "Supplier" : "Buyer";

  const agreementNotification = [
    {
      text: "You have been assigned to an agreement",

      status: {
        desktop: userProfileInfo?.desktopNotifications?.assignedDeal ?? true,
        email: userProfileInfo?.emailNotifications?.assignedDeal ?? true,
        property: "assignedDeal",
      },
    },
    {
      text: `${prefix} submitted changes in the agreement`,

      status: {
        desktop: userProfileInfo?.desktopNotifications?.submittedDealChanges ?? true,
        email: userProfileInfo?.emailNotifications?.submittedDealChanges ?? true,
        property: "submittedDealChanges",
      },
    },
    {
      text: `${prefix} confirmed the agreement`,
      status: {
        desktop: userProfileInfo?.desktopNotifications?.confirmedDeal ?? true,
        email: userProfileInfo?.emailNotifications?.confirmedDeal ?? true,
        property: "confirmedDeal",
      },
    },
    {
      text: `${prefix} cancelled his confirmation`,

      status: {
        desktop: userProfileInfo?.desktopNotifications?.cancelledDeal ?? true,
        email: userProfileInfo?.emailNotifications?.cancelledDeal ?? true,
        property: "cancelledDeal",
      },
    },
  ];

  const milestoneNotificationsBuyer = [
    {
      text: `Supplier submitted a milestone`,
      status: {
        desktop: userProfileInfo?.desktopNotifications?.supplierRequestedMilestoneApproval ?? true,
        email: userProfileInfo?.emailNotifications?.supplierRequestedMilestoneApproval ?? true,
        property: "supplierRequestedMilestoneApproval",
      },
    },
    {
      text: `Supplier uploaded document`,
      status: {
        desktop: userProfileInfo?.desktopNotifications?.supplierUploadedDocument ?? true,
        email: userProfileInfo?.emailNotifications?.supplierUploadedDocument ?? true,
        property: "supplierUploadedDocument",
      },
    },
  ];

  const milestoneNotificationsSupplier = [
    {
      text: `${prefix} approved a milestone`,
      status: {
        desktop: userProfileInfo?.desktopNotifications?.buyerApprovedMilestone ?? true,
        email: userProfileInfo?.emailNotifications?.buyerApprovedMilestone ?? true,
        property: "buyerApprovedMilestone",
      },
    },
    {
      text: `${prefix} denied a milestone`,
      status: {
        desktop: userProfileInfo?.desktopNotifications?.buyerDeniedMilestone ?? true,
        email: userProfileInfo?.emailNotifications?.buyerDeniedMilestone ?? true,
        property: "buyerDeniedMilestone",
      },
    },
  ];

  const handleChangeNotificationStatus = async (status: boolean, notification: Notification, property: string) => {
    if (notification === Notification.DESKTOP) {
      await AuthService.changeNotificationsSettings({
        desktopNotifications: {
          assignedDeal: userProfileInfo?.desktopNotifications?.assignedDeal ?? true,
          submittedDealChanges: userProfileInfo?.desktopNotifications?.submittedDealChanges ?? true,
          confirmedDeal: userProfileInfo?.desktopNotifications?.confirmedDeal ?? true,
          completedDeal: userProfileInfo?.desktopNotifications?.completedDeal ?? true,
          cancelledDeal: userProfileInfo?.desktopNotifications?.cancelledDeal ?? true,
          buyerApprovedMilestone: userProfileInfo?.desktopNotifications?.buyerApprovedMilestone ?? true,
          buyerDeniedMilestone: userProfileInfo?.desktopNotifications?.buyerDeniedMilestone ?? true,
          supplierUploadedDocument: userProfileInfo?.desktopNotifications?.supplierUploadedDocument ?? true,
          supplierDeletedDocument: userProfileInfo?.desktopNotifications?.supplierDeletedDocument ?? true,
          supplierRequestedMilestoneApproval:
            userProfileInfo?.desktopNotifications?.supplierRequestedMilestoneApproval ?? true,
          supplierCancelledMilestoneApproval:
            userProfileInfo?.desktopNotifications?.supplierCancelledMilestoneApproval ?? true,
          [property]: status,
        },
      });
    } else {
      await AuthService.changeNotificationsSettings({
        emailNotifications: {
          assignedDeal: userProfileInfo?.emailNotifications?.assignedDeal ?? true,
          submittedDealChanges: userProfileInfo?.emailNotifications?.submittedDealChanges ?? true,
          confirmedDeal: userProfileInfo?.emailNotifications?.confirmedDeal ?? true,
          completedDeal: userProfileInfo?.emailNotifications?.completedDeal ?? true,
          cancelledDeal: userProfileInfo?.emailNotifications?.cancelledDeal ?? true,
          buyerApprovedMilestone: userProfileInfo?.emailNotifications?.buyerApprovedMilestone ?? true,
          buyerDeniedMilestone: userProfileInfo?.emailNotifications?.buyerDeniedMilestone ?? true,
          supplierUploadedDocument: userProfileInfo?.emailNotifications?.supplierUploadedDocument ?? true,
          supplierDeletedDocument: userProfileInfo?.emailNotifications?.supplierDeletedDocument ?? true,
          supplierRequestedMilestoneApproval:
            userProfileInfo?.emailNotifications?.supplierRequestedMilestoneApproval ?? true,
          supplierCancelledMilestoneApproval:
            userProfileInfo?.emailNotifications?.supplierCancelledMilestoneApproval ?? true,
          [property]: status,
        },
      });
    }

    await refetch();
  };

  return (
    <div className="flex flex-col gap-[16px]">
      <NotificationTable
        mainHeaderTitle="Agreements"
        handleChangeNotificationStatus={handleChangeNotificationStatus}
        notificationList={agreementNotification}
      />
      <NotificationTable
        mainHeaderTitle="Milestones"
        showExtraHeaders={false}
        handleChangeNotificationStatus={handleChangeNotificationStatus}
        notificationList={
          userProfileInfo?.accountType === "buyer" ? milestoneNotificationsBuyer : milestoneNotificationsSupplier
        }
      />
    </div>
  );
};

export default Notifications;
