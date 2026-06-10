import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator';

export class WhitelistWalletDto {
  @ApiProperty({
    example: '0xAb8483F64d9C6d1EcF9b849Ae677dD3315835cb2',
    description:
      'Ethereum wallet address starting with 0x followed by 40 hex characters',
  })
  @IsString()
  @IsNotEmpty()
  @IsEthereumAddress()
  @Expose()
  address: string;
}
