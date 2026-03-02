import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import {
  DocumentFile,
  Milestone,
  MilestoneApprovalStatus,
  MilestoneStatus,
} from '../deals.entities';

export class MilestoneResponseDto {
  constructor(res: Partial<Milestone>) {
    Object.assign(this, res);
  }

  @ApiProperty()
  @Expose()
  id?: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  fundsDistribution: number;

  @ApiProperty()
  @Expose()
  docs?: DocumentFile[];

  @ApiProperty()
  @Expose()
  status?: MilestoneStatus;

  @ApiProperty()
  @Expose()
  approvalStatus?: MilestoneApprovalStatus;
}
