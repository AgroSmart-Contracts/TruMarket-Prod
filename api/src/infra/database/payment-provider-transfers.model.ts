import mongoose, { Schema } from 'mongoose';

import {
  PaymentProvider,
  PaymentProviderTransferType,
} from '@/payments/payments.entities';
import { PaymentProviderTransfer } from '@/payments/provider-transfers.entities';

const PaymentProviderTransferSchema: Schema = new Schema(
  {
    paymentId: { type: String, required: true, index: true },
    actorUserId: { type: String, required: true, index: true },
    provider: {
      type: String,
      enum: Object.values(PaymentProvider),
      required: true,
      default: PaymentProvider.OSN,
    },
    type: {
      type: String,
      enum: Object.values(PaymentProviderTransferType),
      required: true,
      default: PaymentProviderTransferType.OSN_MINT,
    },
    request: { type: Schema.Types.Mixed, required: false },
    response: { type: Schema.Types.Mixed, required: false },
    providerMintRequestId: { type: String, required: false, index: true },
    providerPaymentId: { type: String, required: false, index: true },
    providerStatus: { type: String, required: false },
    depositInstructions: { type: Schema.Types.Mixed, required: false },
    estimatedFees: { type: Schema.Types.Mixed, required: false },
    payInBankDetails: { type: Schema.Types.Mixed, required: false },
    bankTxNumber: { type: String, required: false },
    lastOsnPaymentHistoryStatus: { type: String, required: false },
    lastOsnPaymentHistoryType: { type: String, required: false },
    lastOsnPaymentHistorySyncedAt: { type: Date, required: false },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
  },
  { minimize: false },
);

PaymentProviderTransferSchema.set('toJSON', {
  transform: function (doc, ret) {
    ret.id = doc._id.toString();
    delete ret.__v;
  },
});

export const PaymentProviderTransfersModel =
  mongoose.model<PaymentProviderTransfer>(
    'PaymentProviderTransfer',
    PaymentProviderTransferSchema,
  );
