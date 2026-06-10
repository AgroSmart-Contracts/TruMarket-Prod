import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UploadPaymentDocumentDto {
  /**
   * How to classify and store the upload.
   * - payment: trade documents (invoice, BL, etc.) — counts toward required payment doc set.
   * - drawback: Peru drawback pack — does not count toward the five trade types.
   * - normal: invalid for this endpoint (use milestone upload for general files).
   */
  @ApiProperty({
    required: false,
    enum: ['payment', 'drawback', 'normal'],
    default: 'payment',
  })
  @IsOptional()
  @IsString()
  @IsIn(['payment', 'drawback', 'normal'])
  @Expose()
  documentUploadMode?: string;

  @ApiProperty({
    required: false,
    description:
      'Optional explicit type; otherwise inferred from PDF + filename.',
  })
  @IsOptional()
  @IsString()
  @Expose()
  documentType?: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
