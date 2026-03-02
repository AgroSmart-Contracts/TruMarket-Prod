import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateDocumentDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  description?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  @Expose()
  view?: boolean;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  @Expose()
  publiclyVisible?: boolean;
}
