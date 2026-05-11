import mongoose, { Schema } from 'mongoose';

import {
  TruMarketSettings,
  TruMarketSettingsProvider,
} from '@/settings/trumarket-settings.entities';

const TruMarketSettingsSchema: Schema = new Schema(
  {
    provider: {
      type: String,
      enum: Object.values(TruMarketSettingsProvider),
      required: true,
      unique: true,
      index: true,
    },

    organizationId: { type: String, required: false },
    defaultOrganizationBankId: { type: String, required: false },
    defaultWalletId: { type: String, required: false },
    defaultRecipientId: { type: String, required: false },
    defaultCurrencyCode: { type: String, required: false },
    defaultChainId: { type: String, required: false },

    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { minimize: false },
);

TruMarketSettingsSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = doc._id.toString();
    delete ret.__v;
  },
});

export const TruMarketSettingsModel = mongoose.model<TruMarketSettings>(
  'TruMarketSettings',
  TruMarketSettingsSchema,
);

