import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginResponseDto {
  constructor(res: LoginResponseDto) {
    Object.assign(this, res);
  }

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  token: string;
}
