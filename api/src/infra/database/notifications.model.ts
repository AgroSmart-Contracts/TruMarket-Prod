import mongoose, { Schema } from 'mongoose';

import { Notification } from '../../notifications/notifications.entities';

const NotificationSchema: Schema = new Schema({
  message: { type: String, required: true },
  subject: { type: String, required: true },
  redirectUrl: { type: String, required: false },
  read: { type: Boolean, default: false },
  dealId: { type: String, required: false },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

NotificationSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = doc._id.toString();
  },
});

export const NotificationsModel = mongoose.model<Notification>(
  'Notification',
  NotificationSchema,
);
