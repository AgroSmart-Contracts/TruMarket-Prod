import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DealLogsDtoResponse {
  constructor(res: DealLogsDtoResponse) {
    Object.assign(this, res);
  }

  @ApiProperty()
  @Expose()
  message: string;

  @ApiProperty()
  @Expose()
  event: string;

  @ApiProperty()
  @Expose()
  txHash: string;

  @ApiProperty()
  @Expose()
  blockTimestamp: Date;
}
