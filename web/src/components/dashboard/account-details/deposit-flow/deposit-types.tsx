import type { UserProfileInfo } from 'src/interfaces/auth';

export type PaymentStep = 1 | 2 | 3 | 4;

export type Currency = 'USD' | 'EUR' | 'GBP';

export interface PaymentDraft {
  recipientEmail: string;
  amount: string;
  currency: Currency;
  invoiceNumber: string;
  description: string;
  supplierProfile: UserProfileInfo | null;
  recipientBankDetails: Partial<NonNullable<UserProfileInfo['bankDetails']>> | null;
}

