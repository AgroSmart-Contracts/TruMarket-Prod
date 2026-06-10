import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class SignupResponseDto {
  constructor(res: SignupResponseDto) {
    Object.assign(this, res);
  }

  @ApiProperty()
  @Expose()
  token: string;
}
