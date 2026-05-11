export enum BankAccountProvider {
  OSN = 'OSN',
  LEGACY = 'LEGACY',
}

export enum BankAccountStatus {
  ACTIVE = 'ACTIVE',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
}

export enum BankAccountOwnerType {
  Buyer = 'buyer',
  Supplier = 'supplier',
}

export class BankAccount {
  id: string;
  userId: string;

  /**
   * Used for enforcing business rules (e.g. suppliers limited to 1).
   */
  accountType: BankAccountOwnerType;

  provider: BankAccountProvider;
  providerAccountId: string;
  providerOrganizationId?: string;

  /**
   * TruMarket source-of-truth for *UI eligibility*:
   * - `ACTIVE`: usable by TruMarket (allowed to be selected for defaults and used for OSN flow).
   * - `PENDING_APPROVAL`: exists but is not yet active on OSN, or not yet approved by admin/system.
   *
   * When using OSN onboarding (`buyer` flow), status is derived from the OSN `is_active` field.
   * For suppliers (payout-only), status is set to ACTIVE in the service layer.
   */
  status: BankAccountStatus;
  /**
   * Mirror of the OSN `is_active` flag (provider payload). Kept for debugging/backward compatibility.
   */
  isActive?: boolean;
  isDefault?: boolean;
  archived: boolean;
  nickname?: string;
  supersedesId?: string;

  currencyCode: string;
  countryCode: string;
  bankName: string;
  accountHolderName: string;
  accountNumberEncrypted: string;
  accountLast4: string;
  swiftBic: string;
  ibanEncrypted?: string;
  routingNumber?: string;
  bankAddress?: string;
  accountHolderAddress?: string;

  providerPayload?: any;
  lastSyncedAt?: Date;
  syncError?: string;
  /**
   * Idempotency: buyer approval side-effects (in-app + email) when OSN activates the account.
   */
  approvalInAppNotificationSentAt?: Date;
  approvalEmailSentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

