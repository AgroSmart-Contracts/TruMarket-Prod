import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateMilestoneDto {
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Expose()
  submitToReview?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Expose()
  approve?: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  @Expose()
  deny?: boolean;
}
