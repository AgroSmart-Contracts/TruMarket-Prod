export type BankAccountStatus = "ACTIVE" | "PENDING_APPROVAL";
export type BankAccountProvider = "OSN" | "LEGACY";
export type BankAccountOwnerType = "buyer" | "supplier";

export interface BankAccount {
  id: string;
  userId: string;
  accountType: BankAccountOwnerType;
  provider: BankAccountProvider;
  providerAccountId: string;
  providerOrganizationId?: string;
  status: BankAccountStatus;
  isActive?: boolean;
  isDefault?: boolean;
  archived: boolean;
  nickname?: string;
  supersedesId?: string;
  currencyCode: string;
  countryCode: string;
  bankName: string;
  accountHolderName: string;
  accountLast4: string;
  swiftBic: string;
  routingNumber?: string;
  bankAddress?: string;
  accountHolderAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBankAccountPayload {
  accountType: BankAccountOwnerType;
  provider: BankAccountProvider;
  nickname?: string;
  supersedesId?: string;
  currencyCode: string;
  countryCode: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  swiftBic: string;
  iban?: string;
  routingNumber?: string;
  bankAddress?: string;
  accountHolderAddress?: string;
}

export interface UpdateBankAccountPayload {
  currencyCode: string;
  countryCode: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  swiftBic: string;
  accountHolderAddress?: string;
  routingNumber?: string;
  iban?: string;
  bankAddress?: string;
}

