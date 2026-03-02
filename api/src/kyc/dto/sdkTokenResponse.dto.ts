import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SDKResponseDto {
  constructor(res: SDKResponseDto) {
    Object.assign(this, res);
  }

  @ApiProperty()
  @Expose()
  sdkToken: string;

  @ApiProperty()
  @Expose()
  workflowRunId: string;
}
