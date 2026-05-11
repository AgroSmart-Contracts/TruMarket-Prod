import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

/**
 * Snapshot of admin-dashboard `POST /api/internal/osn/fee-quote` response `data`.
 * Buyer-facing fee amounts must match this object — do not recompute on the client.
 */
export class FeeQuoteSnapshotDto {
  @ApiProperty()
  @Expose()
  @IsNumber()
  paymentAmount: number;

  @ApiProperty()
  @Expose()
  @IsString()
  currency: string;

  @ApiProperty()
  @Expose()
  @IsNumber()
  @Min(0)
  osnFee: number;

  @ApiProperty()
  @Expose()
  @IsNumber()
  @Min(0)
  trumarketFee: number;

  @ApiProperty()
  @Expose()
  @IsNumber()
  @Min(0)
  totalFee: number;

  @ApiProperty()
  @Expose()
  @IsNumber()
  buyerFeePercent: number;

  @ApiProperty({ description: 'Buyer’s fee share from admin quote (display / escrow UX).' })
  @Expose()
  @IsNumber()
  @Min(0)
  buyerFeeAmount: number;

  @ApiProperty()
  @Expose()
  @IsNumber()
  @Min(0)
  supplierFeeAmount: number;

  @ApiProperty({ description: 'Total fiat the buyer must send per admin quote.' })
  @Expose()
  @IsNumber()
  @Min(0)
  totalBuyerPays: number;

  @ApiProperty({ required: false })
  @Expose()
  @IsOptional()
  @IsString()
  source?: string;
}
