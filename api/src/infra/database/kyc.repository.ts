import { Injectable } from '@nestjs/common';

import { MongooseRepository } from '@/infra/database/repository.mongoose';
import { KYCVerificationRepository } from '@/kyc/kyc.repository';

import { KYCVerification } from '../../kyc/dto/kycVerificationResponse.dto';
import KYCVerificationModel from './kyc.model';

@Injectable()
export class KYCVerificationMongooseRepository
  extends MongooseRepository<KYCVerification>
  implements KYCVerificationRepository
{
  constructor() {
    super(KYCVerificationModel);
  }

  async createApplicant(data: any): Promise<KYCVerification> {
    return this.create(data);
  }

  async getApplicantById(applicantId: string): Promise<KYCVerification> {
    return this.findOne({ applicantId });
  }

  async getApplicantByUserId(userId: string): Promise<KYCVerification> {
    return this.findOne({ userId });
  }
}
