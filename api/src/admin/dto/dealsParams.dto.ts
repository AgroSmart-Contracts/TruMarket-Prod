import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

import { DealStatus } from '@/deals/deals.entities';

export class DealsParamsDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Expose()
  offset?: number;

  @ApiProperty({ required: false, enum: DealStatus })
  @IsEnum(DealStatus)
  @IsOptional()
  @Expose()
  status?: DealStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  emailSearch?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  search?: string;
}
