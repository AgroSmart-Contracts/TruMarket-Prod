import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';

import { PaymentMethod } from '../payments.entities';
import { FeeQuoteSnapshotDto } from './fee-quote-snapshot.dto';

export class CreatePaymentDto {
  @ApiProperty()
  @Expose()
  amount: number;

  @ApiProperty()
  @Expose()
  currency: string;

  @ApiProperty()
  @Expose()
  supplierEmail: string;

  @ApiProperty({ required: false })
  @Expose()
  invoiceNumber?: string;

  @ApiProperty({ required: false })
  @Expose()
  description?: string;

  @ApiProperty({ required: false })
  @Expose()
  dueDate?: Date;

  @ApiProperty({ required: false })
  @Expose()
  method?: PaymentMethod;

  /**
   * Optional snapshot from admin `fee-quote` (same session as UI).
   * When present, must match `amount` / `currency`; persisted for display and audit.
   */
  @ApiProperty({ required: false, type: FeeQuoteSnapshotDto })
  @Expose()
  @IsOptional()
  @ValidateNested()
  @Type(() => FeeQuoteSnapshotDto)
  feeQuote?: FeeQuoteSnapshotDto;
}

