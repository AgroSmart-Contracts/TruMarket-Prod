import { Repository } from '@/repository';

import { Notification } from './notifications.entities';

export interface NotificationsRepository extends Repository<Notification> {
  bulkCreateByRecipent(
    recipients: string[],
    notification: Partial<Notification>,
  ): Promise<Notification[]>;

  markAsRead(userId: string, notificationId: string): Promise<number>;

  markAsReadByDealId(userId: string, dealId: string): Promise<number>;
}
