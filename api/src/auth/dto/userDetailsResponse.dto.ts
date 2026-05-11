import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { BankAccountResponseDto } from '@/bank-accounts/dto/bank-account-response.dto';

export class CompanyDto {
  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  country: string;

  @ApiProperty()
  @Expose()
  taxId: string;
}

export class NotificationsSettingsDto {
  @ApiProperty()
  @Expose()
  assignedDeal: boolean;

  @ApiProperty()
  @Expose()
  submittedDealChanges: boolean;

  @ApiProperty()
  @Expose()
  confirmedDeal: boolean;

  @ApiProperty()
  @Expose()
  completedDeal: boolean;

  @ApiProperty()
  @Expose()
  cancelledDeal: boolean;

  // buyer
  @ApiProperty()
  @Expose()
  buyerApprovedMilestone: boolean;

  @ApiProperty()
  @Expose()
  buyerDeniedMilestone: boolean;

  // supplier
  @ApiProperty()
  @Expose()
  supplierUploadedDocument: boolean;

  @ApiProperty()
  @Expose()
  supplierDeletedDocument: boolean;

  @ApiProperty()
  @Expose()
  supplierRequestedMilestoneApproval: boolean;

  @ApiProperty()
  @Expose()
  supplierCancelledMilestoneApproval: boolean;
}

export class UserDetailsResponseDto {
  constructor(res: UserDetailsResponseDto) {
    Object.assign(this, res);
  }

  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  accountType: string;

  @ApiProperty()
  @Expose()
  walletAddress: string;

  @ApiProperty({ type: [BankAccountResponseDto], required: false })
  @Expose()
  bankAccounts?: BankAccountResponseDto[];

  @ApiProperty({ type: NotificationsSettingsDto })
  @Expose()
  desktopNotifications?: NotificationsSettingsDto;

  @ApiProperty({ type: NotificationsSettingsDto })
  @Expose()
  emailNotifications?: NotificationsSettingsDto;

  @ApiProperty({ type: CompanyDto })
  @Expose()
  company?: CompanyDto;
}
