import type { BankAccount } from "./bankAccount";

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
  bankAccounts?: BankAccount[];
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
