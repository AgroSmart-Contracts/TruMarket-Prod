import type { UserProfileInfo } from 'src/interfaces/auth';

export type PartAStep = 1 | 2 | 3 | 4;
export type PartBStep = 1 | 2 | 3;
export type DepositFlowPhase = 'partA' | 'partB';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'HKD';

export interface RecipientBankDetails {
  accountHolderName: string;
  bankName?: string;
  accountNumber: string;
  swiftBic: string;
  countryCode?: string;
  addressLine1?: string;
  city?: string;
  postalCode?: string;
}

export interface PaymentDraft {
  recipientEmail: string;
  amount: string;
  currency: Currency;
  invoiceNumber: string;
  description: string;
  supplierProfile: UserProfileInfo | null;
  recipientBankDetails: Partial<RecipientBankDetails> | null;
}

export type SupplierBankUiMode = 'linked' | 'manual';

