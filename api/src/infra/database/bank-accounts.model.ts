import mongoose, { Schema } from 'mongoose';

import {
  BankAccount,
  BankAccountProvider,
  BankAccountStatus,
} from '@/bank-accounts/bank-accounts.entities';

const BankAccountSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    accountType: { type: String, required: true },

    provider: {
      type: String,
      enum: Object.values(BankAccountProvider),
      required: true,
    },
    providerAccountId: { type: String, required: true },
    providerOrganizationId: { type: String, required: false },

    status: {
      type: String,
      enum: Object.values(BankAccountStatus),
      required: true,
      default: BankAccountStatus.PENDING_APPROVAL,
    },
    isActive: { type: Boolean, required: false },
    isDefault: { type: Boolean, required: false, default: false },
    archived: { type: Boolean, required: true, default: false, index: true },
    nickname: { type: String, required: false },
    supersedesId: { type: String, required: false },

    currencyCode: { type: String, required: true },
    countryCode: { type: String, required: true },
    bankName: { type: String, required: true },
    accountHolderName: { type: String, required: true },
    accountNumberEncrypted: { type: String, required: true },
    accountLast4: { type: String, required: true },
    swiftBic: { type: String, required: true },
    ibanEncrypted: { type: String, required: false },
    routingNumber: { type: String, required: false },
    bankAddress: { type: String, required: false },
    accountHolderAddress: { type: String, required: false },

    providerPayload: { type: Schema.Types.Mixed, required: false },
    lastSyncedAt: { type: Date, required: false, index: true },
    syncError: { type: String, required: false },
    approvalInAppNotificationSentAt: { type: Date, required: false },
    approvalEmailSentAt: { type: Date, required: false },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { minimize: false },
);

BankAccountSchema.index(
  { provider: 1, providerAccountId: 1 },
  { unique: true },
);

// Enforce only ONE default per user per provider among non-archived records
// (partial indexes require MongoDB support; this is best-effort at DB level)
BankAccountSchema.index({ userId: 1, provider: 1, isDefault: 1 }, {
  unique: true,
  partialFilterExpression: { isDefault: true, archived: false },
} as any);

BankAccountSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = doc._id.toString();
    delete ret.__v;
  },
});

export const BankAccountsModel = mongoose.model<BankAccount>(
  'BankAccount',
  BankAccountSchema,
);
