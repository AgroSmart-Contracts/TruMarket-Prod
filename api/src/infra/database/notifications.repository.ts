import { Injectable } from '@nestjs/common';

import { MongooseRepository } from '@/infra/database/repository.mongoose';
import { NotificationsRepository } from '@/notifications/notifications.repository';

import { Notification } from '../../notifications/notifications.entities';
import { NotificationsModel } from './notifications.model';

@Injectable()
export class NotificationsMongooseRepository
  extends MongooseRepository<Notification>
  implements NotificationsRepository
{
  constructor() {
    super(NotificationsModel);
  }

  bulkCreateByRecipent(
    recipients: string[],
    notification: Partial<Notification>,
  ): Promise<Notification[]> {
    const notifications = recipients.map((recipient) => ({
      userId: recipient,
      ...notification,
    }));

    return this.createMany(notifications);
  }

  markAsRead(userId: string, notificationId: string): Promise<number> {
    return this.update(
      { _id: notificationId, userId },
      { $set: { read: true } },
    );
  }

  markAsReadByDealId(userId: string, dealId: string): Promise<number> {
    return this.update({ dealId: dealId, userId }, { $set: { read: true } });
  }
}
