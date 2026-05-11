import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UploadPaymentDocumentDto {
  @ApiProperty()
  @Expose()
  documentType: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;
}
