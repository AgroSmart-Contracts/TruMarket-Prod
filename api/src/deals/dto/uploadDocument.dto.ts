import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

export class UploadDocumentDTO {
  @ApiProperty()
  @IsString()
  @Expose()
  description: string;

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
