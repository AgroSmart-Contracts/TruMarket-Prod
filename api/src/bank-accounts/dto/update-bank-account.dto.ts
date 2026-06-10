import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateBankAccountDto {
  @ApiProperty()
  @Expose()
  @IsString()
  @IsNotEmpty()
  currencyCode: string;

  @ApiProperty({ description: 'ISO2 country code' })
  @Expose()
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty()
  @Expose()
  @IsString()
  @IsNotEmpty()
  bankName: string;

  @ApiProperty()
  @Expose()
  @IsString()
  @IsNotEmpty()
  accountHolderName: string;

  @ApiProperty({
    description: 'Plain account number; will be encrypted server-side',
  })
  @Expose()
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty()
  @Expose()
  @IsString()
  @IsNotEmpty()
  swiftBic: string;

  @ApiProperty({ required: false })
  @Expose()
  @IsOptional()
  @IsString()
  accountHolderAddress?: string;

  @ApiProperty({ required: false })
  @Expose()
  @IsOptional()
  @IsString()
  routingNumber?: string;

  @ApiProperty({ required: false })
  @Expose()
  @IsOptional()
  @IsString()
  iban?: string;

  @ApiProperty({ required: false })
  @Expose()
  @IsOptional()
  @IsString()
  bankAddress?: string;
}
