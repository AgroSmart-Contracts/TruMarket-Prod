import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { Notification } from '../notifications.entities';

export class ListNotificationsResponseDto {
  constructor(res: Partial<Notification>) {
    Object.assign(this, res);
  }

  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  message: string;

  @Expose()
  @ApiProperty()
  subject: string;

  @Expose()
  @ApiProperty()
  redirectUrl: string;

  @Expose()
  @ApiProperty()
  read: boolean;

  @Expose()
  @ApiProperty()
  dealId: string;
}
