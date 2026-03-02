import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { KYCVerificationResult, KYCVerificationStatus } from '../kyc.entities';

export class KYCVerification {
  constructor(res: Partial<KYCVerification> = {}) {
    Object.assign(this, res);
  }

  @ApiProperty()
  @Expose()
  readonly id: string;

  @ApiProperty()
  @Expose()
  attempts: number;

  @ApiProperty()
  @Expose()
  applicantId: string;

  @ApiProperty()
  @Expose()
  workflowRunId: string;

  @ApiProperty({ enum: KYCVerificationStatus })
  @Expose()
  status: KYCVerificationStatus;

  @ApiProperty({ enum: KYCVerificationResult })
  @Expose()
  result: KYCVerificationResult;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;

  @ApiProperty()
  @Expose()
  userId: string;
}
