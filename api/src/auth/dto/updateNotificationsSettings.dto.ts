import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsNotEmpty, ValidateNested } from 'class-validator';

class NotificationsSettingsDto {
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  @Expose()
  assignedDeal: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  @Expose()
  submittedDealChanges: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  @Expose()
  confirmedDeal: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  @Expose()
  completedDeal: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  @Expose()
  cancelledDeal: boolean;

  // buyer
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  @Expose()
  buyerApprovedMilestone: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  @Expose()
  buyerDeniedMilestone: boolean;

  // supplier
  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  @Expose()
  supplierUploadedDocument: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  @Expose()
  supplierDeletedDocument: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  @Expose()
  supplierRequestedMilestoneApproval: boolean;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  @Expose()
  supplierCancelledMilestoneApproval: boolean;
}

export class UpdateNotificationsSettingsDto {
  @ApiProperty({ type: NotificationsSettingsDto })
  @ValidateNested()
  @Expose()
  desktopNotifications: NotificationsSettingsDto;

  @ApiProperty({ type: NotificationsSettingsDto })
  @ValidateNested()
  @Expose()
  emailNotifications: NotificationsSettingsDto;
}
