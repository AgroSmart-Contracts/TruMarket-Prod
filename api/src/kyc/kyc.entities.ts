export enum KYCVerificationStatus {
  NotStarted = 'notStarted',
  InProgress = 'inProgress',
  Complete = 'complete',
}

export enum KYCVerificationResult {
  Pass = 'pass',
  Fail = 'fail',
  ManualReview = 'manualReview',
}

export type KYCVerification = {
  id: string;
  attempts: number;
  applicantId: string;
  workflowRunId: string;
  status: KYCVerificationStatus;
  result?: KYCVerificationResult;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};
