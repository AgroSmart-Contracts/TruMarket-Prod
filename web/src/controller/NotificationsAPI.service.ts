import axios, { AxiosError } from "axios";

import { INotification } from "src/interfaces/notifications";
import axiosInstance from "src/config/axios";

export class NotificationsService {
  static async subscribeNotifications(subscription: any): Promise<any> {
    const response = await axiosInstance.post(`/notifications/subscribe`, {
      subscription,
    });
    return response.data;
  }

  static async getNotificationsList(offset?: number): Promise<INotification[]> {
    const response = await axiosInstance.get(`/notifications`, {
      params: {
        offset,
      },
    });
    return response.data;
  }

  static async markNotificationAsSeen(id: string, dealId: string): Promise<INotification> {
    const response = await axiosInstance.put(`/notifications`, {
      id,
      dealId,
      read: true,
    });
    return response.data;
  }
}
