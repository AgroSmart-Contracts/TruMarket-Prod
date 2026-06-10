import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UploadDocumentDTO {
  @ApiProperty()
  @IsString()
  @Expose()
  description: string;

  @ApiProperty({
    required: false,
    enum: ['normal', 'payment', 'drawback'],
    default: 'normal',
    description:
      'PDF classification: normal = no classifier; payment = trade docs; drawback = Peru drawback.',
  })
  @IsOptional()
  @IsString()
  @IsIn(['normal', 'payment', 'drawback'])
  @Expose()
  documentUploadMode?: string;

  @ApiProperty({
    type: 'file',
    items: {
      type: 'string',
      format: 'binary',
    },
  })
  @Expose()
  file: any;
}
