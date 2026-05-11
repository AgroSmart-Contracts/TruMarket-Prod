import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import {
  BankAccountOwnerType,
  BankAccountProvider,
  BankAccountStatus,
} from '../bank-accounts.entities';

export class BankAccountResponseDto {
  constructor(res: BankAccountResponseDto) {
    Object.assign(this, res);
  }

  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  userId: string;

  @ApiProperty({ enum: BankAccountOwnerType })
  @Expose()
  accountType: BankAccountOwnerType;

  @ApiProperty({ enum: BankAccountProvider })
  @Expose()
  provider: BankAccountProvider;

  @ApiProperty()
  @Expose()
  providerAccountId: string;

  @ApiProperty({ required: false })
  @Expose()
  providerOrganizationId?: string;

  @ApiProperty({ enum: BankAccountStatus })
  @Expose()
  status: BankAccountStatus;

  @ApiProperty({ required: false })
  @Expose()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @Expose()
  isDefault?: boolean;

  @ApiProperty()
  @Expose()
  archived: boolean;

  @ApiProperty({ required: false })
  @Expose()
  nickname?: string;

  @ApiProperty({ required: false })
  @Expose()
  supersedesId?: string;

  @ApiProperty()
  @Expose()
  currencyCode: string;

  @ApiProperty()
  @Expose()
  countryCode: string;

  @ApiProperty()
  @Expose()
  bankName: string;

  @ApiProperty()
  @Expose()
  accountHolderName: string;

  @ApiProperty({ description: 'Masked; only last4 is returned' })
  @Expose()
  accountLast4: string;

  @ApiProperty()
  @Expose()
  swiftBic: string;

  @ApiProperty({ required: false })
  @Expose()
  routingNumber?: string;

  @ApiProperty({ required: false })
  @Expose()
  bankAddress?: string;

  @ApiProperty({ required: false })
  @Expose()
  accountHolderAddress?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty({ required: false })
  @Expose()
  lastSyncedAt?: Date;

  @ApiProperty({ required: false })
  @Expose()
  syncError?: string;
}

