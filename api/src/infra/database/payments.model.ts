import mongoose, { Schema } from 'mongoose';

import { Payment, PaymentStatus } from '@/payments/payments.entities';

const PaymentSchema: Schema = new Schema({
    dealId: { type: String, required: true },
    // Buyer who is making the payment
    buyerId: { type: String, required: true },
    // Supplier who will receive the payment
    supplierId: { type: String, required: false },
    // Supplier contact email (for notifications, remittance advice, etc.)
    supplierEmail: { type: String, required: true },
    sequence: { type: Number, required: false },
    dueDate: { type: Date, required: false },
    method: { type: String, required: false },
    amount: { type: Number, required: true },
    currency: { type: String, required: true },
    feeQuote: { type: Schema.Types.Mixed, required: false },
    invoiceNumber: { type: String, required: false },
    description: { type: String, required: false },
    bankDetails: {
        beneficiaryName: { type: String, required: false },
        country: { type: String, required: false },
        addressLine1: { type: String, required: false },
        city: { type: String, required: false },
        postalCode: { type: String, required: false },
        bankName: { type: String, required: false },
        accountNumber: { type: String, required: false },
        swiftCode: { type: String, required: false },
    },
    status: {
        type: String,
        enum: Object.values(PaymentStatus),
        default: PaymentStatus.PaymentRequested,
    },
    providerTransfers: [
        {
            provider: { type: String, required: true },
            transferId: { type: String, required: true },
            type: { type: String, required: true },
            status: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    activeProviderTransferId: { type: String, required: false },
    paymentDocuments: [{
        documentType: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        verifiedByAdmin: { type: Boolean, required: false, default: false },
        verifiedAt: { type: Date, required: false },
    }],
    // Whether the supplier has requested offramp for this completed payment
    isOfframpRequested: { type: Boolean, required: false, default: false },
    paymentInitiatedNotifiedAt: { type: Date, required: false },
    buyerTransferProofSubmittedAt: { type: Date, required: false },
    buyerProofVerifyingEmailSentAt: { type: Date, required: false },
    buyerProofAdminInAppNotifiedAt: { type: Date, required: false },
    osnDepositCompletedAt: { type: Date, required: false },
    osnDepositBuyerNotifiedAt: { type: Date, required: false },
    osnDepositAdminNotifiedAt: { type: Date, required: false },
    osnDepositSupplierNotifiedAt: { type: Date, required: false },
    supplierDocumentsVerifiedNotifiedAt: { type: Date, required: false },
    supplierPayoutSentNotifiedAt: { type: Date, required: false },
    createdAt: { type: Date, default: Date.now },
});

PaymentSchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = doc._id.toString();
    },
});

export const PaymentsModel = mongoose.model<Payment>('Payment', PaymentSchema);

