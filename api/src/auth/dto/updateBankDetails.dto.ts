import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';

class BankDetailsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  beneficiaryName: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  country?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  addressLine1?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  city?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  postalCode?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @Expose()
  bankName?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  accountNumber: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Expose()
  swiftCode: string;
}

export class UpdateBankDetailsDto {
  @ApiProperty({
    type: BankDetailsDto,
    description:
      'Supplier bank account details needed for payouts (accountNumber and SWIFT/BIC, plus optional address)',
  })
  @ValidateNested()
  @Type(() => BankDetailsDto)
  @Expose()
  bankDetails: BankDetailsDto;
}

