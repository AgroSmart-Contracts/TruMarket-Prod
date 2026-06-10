import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class OsnFeeQuoteRequestDto {
  @ApiProperty({ example: 121 })
  @Expose()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ example: 'USD' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  currency: string;

  @ApiProperty({
    required: false,
    example: 'OSN',
    description: 'On-ramp partner; must be production-enabled in admin.',
  })
  @Expose()
  @IsOptional()
  @IsString()
  partner?: string;

  @ApiProperty({
    required: false,
    description:
      'Optional promotion code configured in admin on-ramp settings.',
  })
  @Expose()
  @IsOptional()
  @IsString()
  promoCode?: string;
}
