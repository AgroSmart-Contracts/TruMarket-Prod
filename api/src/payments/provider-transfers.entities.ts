import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { PaymentProvider, PaymentProviderTransferType } from './payments.entities';

export class PaymentProviderTransfer {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  paymentId: string;

  @ApiProperty()
  @Expose()
  actorUserId: string;

  @ApiProperty({ enum: PaymentProvider })
  @Expose()
  provider: PaymentProvider;

  @ApiProperty({ enum: PaymentProviderTransferType })
  @Expose()
  type: PaymentProviderTransferType;

  @ApiProperty({ required: false, type: 'object' })
  @Expose()
  request?: any;

  @ApiProperty({ required: false, type: 'object' })
  @Expose()
  response?: any;

  @ApiProperty({ required: false })
  @Expose()
  providerMintRequestId?: string;

  @ApiProperty({ required: false })
  @Expose()
  providerPaymentId?: string;

  /**
   * OSN source-of-truth status for the provider transfer lifecycle.
   * Payment.status remains TruMarket document verification / business workflow.
   */
  @ApiProperty({ required: false })
  @Expose()
  providerStatus?: string;

  @ApiProperty({ required: false })
  @Expose()
  depositInstructions?: any;

  @ApiProperty({ required: false })
  @Expose()
  estimatedFees?: any;

  @ApiProperty({ required: false })
  @Expose()
  payInBankDetails?: any;

  @ApiProperty({ required: false })
  @Expose()
  bankTxNumber?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty({ required: false })
  @Expose()
  lastOsnPaymentHistoryStatus?: string;

  @ApiProperty({ required: false })
  @Expose()
  lastOsnPaymentHistoryType?: string;

  @ApiProperty({ required: false })
  @Expose()
  lastOsnPaymentHistorySyncedAt?: Date;
}

