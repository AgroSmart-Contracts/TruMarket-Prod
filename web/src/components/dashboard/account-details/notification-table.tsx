import React from "react";

import Switcher from "src/components/common/switch";
import { Notification } from "src/interfaces/auth";

interface NotificationTableProps {
  handleChangeNotificationStatus: (status: boolean, notification: Notification, property: string) => void;
  mainHeaderTitle: string;
  showExtraHeaders?: boolean;
  notificationList: {
    text: string;
    status: {
      desktop?: boolean;
      email?: boolean;
      property: string;
    };
  }[];
}

const NotificationTable: React.FC<NotificationTableProps> = ({
  notificationList,
  mainHeaderTitle,
  handleChangeNotificationStatus,
  showExtraHeaders = true,
}) => {
  return (
    <div className="w-full">
      <div className="item-center mb-[20px] flex justify-between text-[13px] font-bold leading-[1.2em] text-tm-black-80">
        <div className="w-[33.33%]">
          <p>{mainHeaderTitle}</p>
        </div>
        {showExtraHeaders ? (
          <>
            <div className="flex w-[33.33%] justify-end pr-[8px]">
              <p>Desktop</p>
            </div>
            <div className="flex w-[33.33%] justify-end pr-[20px]">
              <p>E-mail</p>
            </div>
          </>
        ) : null}
      </div>
      <div>
        {notificationList.map((notification, i) => (
          <div
            className="item-center flex justify-between rounded-[4px] px-[12px] py-[10px] text-[13px] leading-[1.2em] text-tm-black-80 odd:bg-tm-black-transparent-05"
            key={i}
          >
            <div className="w-[33.33%]">
              <p className="mt-[5px] leading-[1.2em]">{notification.text}</p>
            </div>
            <div className="flex w-[33.33%] justify-end">
              <Switcher
                enabled={notification.status.desktop!}
                onChange={(value: boolean) =>
                  handleChangeNotificationStatus(value, Notification.DESKTOP, notification.status.property)
                }
              />
            </div>
            <div className="flex w-[33.33%] justify-end">
              <Switcher
                enabled={notification.status.email!}
                onChange={(value: boolean) =>
                  handleChangeNotificationStatus(value, Notification.EMAIL, notification.status.property)
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationTable;
