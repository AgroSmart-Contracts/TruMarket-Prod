import { Repository } from '@/repository';

import { KYCVerification } from './kyc.entities';

export interface KYCVerificationRepository extends Repository<KYCVerification> {
  createApplicant(data: any): Promise<KYCVerification>;
  getApplicantById(applicantId: string): Promise<KYCVerification>;
  getApplicantByUserId(userId: string): Promise<KYCVerification>;
}
