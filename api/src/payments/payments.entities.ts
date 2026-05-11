import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import type { OsnFeeQuoteData } from '@/admin-dashboard/admin-dashboard-fee-quote.service';
import { BankDetails } from '@/users/users.entities';

export enum PaymentMethod {
    BANK_TRANSFER = 'BANK_TRANSFER',
    OSN_ONRAMP = 'OSN_ONRAMP',
}

export enum PaymentStatus {
    PaymentRequested = 'payment_requested',
    InProgress = 'in_progress',
    VerifyingDocuments = 'verifying_documents',
    Completed = 'completed',
    Failed = 'failed',
}

export enum PaymentProvider {
    OSN = 'OSN',
}

export enum PaymentProviderTransferType {
    OSN_MINT = 'OSN_MINT',
}

export class PaymentProviderTransferRef {
    @ApiProperty({ enum: PaymentProvider })
    @Expose()
    provider: PaymentProvider;

    @ApiProperty()
    @Expose()
    transferId: string;

    @ApiProperty({ enum: PaymentProviderTransferType })
    @Expose()
    type: PaymentProviderTransferType;

    @ApiProperty()
    @Expose()
    status: string;

    @ApiProperty()
    @Expose()
    createdAt: Date | string;
}

export class Payment {
    @ApiProperty()
    @Expose()
    id: string;

    @ApiProperty()
    @Expose()
    dealId: string;

    @ApiProperty()
    @Expose()
    buyerId: string;

    @ApiProperty()
    @Expose()
    supplierId?: string;

    @ApiProperty()
    @Expose()
    supplierEmail: string;

    @ApiProperty({ required: false })
    @Expose()
    sequence?: number;

    @ApiProperty({ required: false })
    @Expose()
    dueDate?: Date;

    @ApiProperty({ required: false })
    @Expose()
    method?: PaymentMethod;

    @ApiProperty()
    @Expose()
    amount: number;

    @ApiProperty()
    @Expose()
    currency: string;

    /**
     * Pre-mint fee snapshot from admin-dashboard fee-quote API (if supplied at creation).
     * Buyer-facing totals: `buyerFeeAmount`, `totalBuyerPays` — do not recompute.
     */
    @ApiProperty({ required: false })
    @Expose()
    feeQuote?: OsnFeeQuoteData;

    @ApiProperty({ required: false })
    @Expose()
    invoiceNumber?: string;

    @ApiProperty({ required: false })
    @Expose()
    description?: string;

    @ApiProperty({ required: false, type: () => BankDetails })
    @Expose()
    bankDetails?: BankDetails;

    @ApiProperty({ required: false, type: () => [PaymentProviderTransferRef] })
    @Expose()
    providerTransfers?: PaymentProviderTransferRef[];

    @ApiProperty({ required: false })
    @Expose()
    activeProviderTransferId?: string;

    @ApiProperty({ enum: PaymentStatus })
    @Expose()
    /**
     * TruMarket business workflow status (admin/supplier doc verification).
     * Provider transfer lifecycle (OSN mint/submit) is tracked separately in
     * `PaymentProviderTransfer.providerStatus`.
     */
    status: PaymentStatus;

    @ApiProperty({ required: false })
    @Expose()
    isOfframpRequested?: boolean;

    @ApiProperty({ required: false })
    @Expose()
    paymentInitiatedNotifiedAt?: Date;

    @ApiProperty({ required: false })
    @Expose()
    buyerTransferProofSubmittedAt?: Date;

    @ApiProperty({ required: false })
    @Expose()
    buyerProofVerifyingEmailSentAt?: Date;

    @ApiProperty({ required: false })
    @Expose()
    buyerProofAdminInAppNotifiedAt?: Date;

    @ApiProperty({ required: false })
    @Expose()
    osnDepositCompletedAt?: Date;

    @ApiProperty({ required: false })
    @Expose()
    osnDepositBuyerNotifiedAt?: Date;

    @ApiProperty({ required: false })
    @Expose()
    osnDepositAdminNotifiedAt?: Date;

    @ApiProperty({ required: false })
    @Expose()
    osnDepositSupplierNotifiedAt?: Date;

    @ApiProperty({ required: false })
    @Expose()
    supplierDocumentsVerifiedNotifiedAt?: Date;

    @ApiProperty({ required: false })
    @Expose()
    supplierPayoutSentNotifiedAt?: Date;

    @ApiProperty({ required: false, type: 'array' })
    @Expose()
    paymentDocuments?: Array<{
        documentType: string;
        url: string;
        uploadedAt: Date;
        verifiedByAdmin?: boolean;
        verifiedAt?: Date;
    }>;

    @ApiProperty()
    @Expose()
    createdAt: Date;
}

