interface Company {
  name: string;
  country: string;
  taxId: string;
}

export enum IUserRole {
  REGULAR,
  ADMIN,
}

export enum Notification {
  DESKTOP = "desktop",
  EMAIL = "email",
}

export interface UserProfileInfo {
  id: string;
  email: string;
  accountType: string;
  walletAddress: string;
  kycVerified: boolean;
  isBankLinked?: boolean;
  bankDetails?: {
    beneficiaryName: string;
    country: string;
    addressLine1?: string;
    city?: string;
    postalCode?: string;
    bankName?: string;
    accountNumber?: string;
    swiftCode?: string;
  };
  desktopNotifications: DesktopNotifications;
  emailNotifications: EmailNotifications;
  company?: Company;
}

export interface DesktopNotifications {
  assignedDeal: boolean;
  submittedDealChanges: boolean;
  confirmedDeal: boolean;
  completedDeal: boolean;
  cancelledDeal: boolean;
  buyerApprovedMilestone: boolean;
  buyerDeniedMilestone: boolean;
  supplierUploadedDocument: boolean;
  supplierDeletedDocument: boolean;
  supplierRequestedMilestoneApproval: boolean;
  supplierCancelledMilestoneApproval: boolean;
}

export interface EmailNotifications {
  assignedDeal: boolean;
  submittedDealChanges: boolean;
  confirmedDeal: boolean;
  completedDeal: boolean;
  cancelledDeal: boolean;
  buyerApprovedMilestone: boolean;
  buyerDeniedMilestone: boolean;
  supplierUploadedDocument: boolean;
  supplierDeletedDocument: boolean;
  supplierRequestedMilestoneApproval: boolean;
  supplierCancelledMilestoneApproval: boolean;
}
