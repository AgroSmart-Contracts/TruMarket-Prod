import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';

import { DealStatus } from '../deals.entities';

@Exclude()
export class ListDealsDto {
  @ApiProperty({ required: false, enum: DealStatus })
  @IsEnum(DealStatus)
  @IsOptional()
  @Expose()
  status?: DealStatus;

  /** Comma-separated statuses, e.g. `confirmed,finished` (dashboard). */
  @ApiProperty({ required: false, enum: DealStatus, isArray: true })
  @IsEnum(DealStatus, { each: true })
  @IsOptional()
  @Expose()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string' && value.trim()) {
      return value.split(',').map((s) => s.trim());
    }
    return undefined;
  })
  statuses?: DealStatus[];
}
