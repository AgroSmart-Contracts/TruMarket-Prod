import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class documentResponseDTO {
  constructor(res: documentResponseDTO) {
    Object.assign(this, res);
  }

  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  url: string;
}
