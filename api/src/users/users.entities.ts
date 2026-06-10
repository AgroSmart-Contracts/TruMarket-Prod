export class Company {
  name: string;
  country: string;
  taxId: string;
}

export enum AccountType {
  Supplier = 'supplier',
  Buyer = 'buyer',
  Investor = 'investor',
}

export enum WalletType {
  EVM = 'evm',
}

export enum RoleType {
  REGULAR = 0,
  ADMIN = 1,
}

export class NotificationsSettings {
  assignedDeal: boolean;
  submittedDealChanges: boolean;
  confirmedDeal: boolean;
  cancelledDeal: boolean;
  completedDeal: boolean;
  // buyer
  buyerApprovedMilestone: boolean;
  buyerDeniedMilestone: boolean;
  // supplier
  supplierUploadedDocument: boolean;
  supplierDeletedDocument: boolean;
  supplierRequestedMilestoneApproval: boolean;
  supplierCancelledMilestoneApproval: boolean;
}

export class BankDetails {
  /**
   * Name of the account holder / beneficiary
   */
  beneficiaryName: string;

  /**
   * Country of the bank account (ISO 2-letter code, e.g. US, GB, NG)
   */
  country?: string;

  /**
   * Optional additional address details for the beneficiary (street/city)
   */
  addressLine1?: string;
  city?: string;
  postalCode?: string;

  /**
   * Bank information
   */
  bankName?: string;

  /**
   * Bank account identifier (can be local account number or IBAN-like string)
   */
  accountNumber?: string;

  swiftCode?: string;
}

export class User {
  id: string;
  email: string;
  accountType: string;
  walletAddress: string;
  walletType: string;
  role: number;
  createdAt: Date;
  desktopNotifications?: NotificationsSettings;
  emailNotifications?: NotificationsSettings;

  company?: Company;

  /**
   * Bank accounts are stored in a dedicated collection.
   * This field may be populated by services/controllers when needed.
   */
  bankAccounts?: any[];
}
