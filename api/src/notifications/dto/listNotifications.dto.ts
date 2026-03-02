import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class ListNotificationsDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  @Expose()
  offset: number;
}
