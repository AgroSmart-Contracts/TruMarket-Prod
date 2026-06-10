import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { Payment, PaymentStatus } from '../payments.entities';

export class PaymentResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  dealId: string;

  @ApiProperty()
  @Expose()
  buyerId: string;

  @ApiProperty({ required: false })
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

  @ApiProperty()
  @Expose()
  amount: number;

  @ApiProperty()
  @Expose()
  currency: string;

  @ApiProperty({
    required: false,
    description: 'Admin fee-quote snapshot at creation, if provided',
  })
  @Expose()
  feeQuote?: Record<string, unknown>;

  @ApiProperty({ required: false })
  @Expose()
  method?: string;

  @ApiProperty({ required: false })
  @Expose()
  invoiceNumber?: string;

  @ApiProperty({ required: false })
  @Expose()
  description?: string;

  @ApiProperty({ enum: PaymentStatus })
  @Expose()
  status: PaymentStatus;

  @ApiProperty({ required: false })
  @Expose()
  isOfframpRequested?: boolean;

  @ApiProperty({ required: false, type: 'array' })
  @Expose()
  paymentDocuments?: Array<{
    documentType: string;
    url: string;
    uploadedAt: Date;
    verifiedByAdmin?: boolean;
    verifiedAt?: Date;
    documentUploadMode?: string;
    tradePdfClassification?: {
      detectedType: string;
      score: number;
      matchedKeywords: string[];
    };
    peruDrawbackClassification?: {
      detectedType: string;
      score: number;
      matchedKeywords: string[];
      processStage?: number;
      documentDateIso?: string;
      boxCount?: number | null;
      validationRulesetId?: string;
      validationRulesVersion?: number;
    };
  }>;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  constructor(payment: Payment) {
    Object.assign(this, payment);
  }
}
