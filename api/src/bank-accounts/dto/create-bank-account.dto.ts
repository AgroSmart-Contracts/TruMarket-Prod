import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

import {
  BankAccountOwnerType,
  BankAccountProvider,
} from '../bank-accounts.entities';

export class CreateBankAccountDto {
  @ApiProperty({ enum: BankAccountOwnerType })
  @Expose()
  @IsEnum(BankAccountOwnerType)
  accountType: BankAccountOwnerType;

  @ApiProperty({ enum: BankAccountProvider, default: BankAccountProvider.OSN })
  @Expose()
  @IsEnum(BankAccountProvider)
  provider: BankAccountProvider;

  @ApiProperty({ required: false })
  @Expose()
  @IsOptional()
  @IsString()
  nickname?: string;

  @ApiProperty({
    required: false,
    description: 'If creating an update request for an existing account',
  })
  @Expose()
  @IsOptional()
  @IsString()
  supersedesId?: string;

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
  iban?: string;

  @ApiProperty({ required: false })
  @Expose()
  @IsOptional()
  @IsString()
  routingNumber?: string;

  @ApiProperty({ required: false })
  @Expose()
  @IsOptional()
  @IsString()
  bankAddress?: string;

  @ApiProperty({ required: false })
  @Expose()
  @IsOptional()
  @IsString()
  accountHolderAddress?: string;

  @ApiProperty({ required: false, default: false })
  @Expose()
  @IsOptional()
  @IsBoolean()
  archived?: boolean;
}
