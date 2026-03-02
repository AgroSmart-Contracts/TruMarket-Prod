export enum SocialProviders {
  GOOGLE = "google",
  FACEBOOK = "facebook",
  TWITTER = "twitter",
}

export enum WalletProviders {
  METAMASK = "metamask",
  WALLET_CONNECT = "wallet_connect",
}

export enum AccountTypeEnum {
  SUPPLIER = "supplier",
  BUYER = "buyer",
  INVESTOR = "investor",
}

export enum EmailSteps {
  STEP_1,
  STEP_2,
}

export enum MilestoneEnum {
  M,
  M1,
  M2,
  M3,
  M4,
  M5,
  M6,
  M7,
}

export interface IRules {
  [key: string]: {
    value: boolean;
    message: string;
  };
}

export enum ValidationStates {
  SUCCESS = "success",
  ERROR = "error",
  WARN = "warn",
}

export interface IOptions {
  value: string;
  label: string;
}

export enum ITransportType {
  BY_SEA = "sea_fright",
  BY_AIR = "by_air",
}

export interface FileWithPreview extends File {
  preview: string;
  id: string;
}

export interface IUploadedFileProps {
  id: string;
  url: string;
  description: string;
  seen: boolean;
  publiclyVisible: boolean;
}

export enum MilestoneStatus {
  IN_PROGRESS = "in progress",
  NOT_COMPLETED = "not completed",
  COMPLETED = "completed",
}

export enum MilestoneApprovalStatus {
  Pending = "pending",
  Submitted = "submitted",
  Approved = "approved",
  Denied = "denied",
}

export interface IMilestoneDetails {
  approvalStatus: MilestoneApprovalStatus;
  docs: any[];
  id: string;
  status: MilestoneStatus;
  fundsDistribution?: number;
  description?: string;
}

export interface ICompanyInfo {
  companyName: string;
  country: any;
  taxId: string;
  participants?: any;
}

export interface ICompanyBaseInfo {
  name: string;
  country: string;
  taxId: string;
}
