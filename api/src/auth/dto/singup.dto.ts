import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

const accountType = ['supplier', 'buyer', 'investor'];

export class SignupDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  @Expose()
  auth0Token: string;

  @ApiProperty()
  @IsString()
  @Expose()
  web3authToken: string;

  @ApiProperty({ enum: accountType })
  @IsIn(accountType)
  @IsString()
  @Expose()
  accountType: string;
}
