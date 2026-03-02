import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateNotificationsDto {
  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @Expose()
  id: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  @Expose()
  dealId: string;

  @ApiProperty({ required: false })
  @IsNotEmpty()
  @IsOptional()
  @IsBoolean()
  @Expose()
  read: boolean;
}
