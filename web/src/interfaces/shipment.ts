import { ICompanyBaseInfo, IMilestoneDetails, ITransportType, MilestoneStatus } from "./global";

export interface IPaymentValuesForm {
  quantity: string;
  offerUnitPrice: string;
}

export interface IOriginAndDestination {
  origin: string;
  destination: string;
}

export interface IProductDetailsForm {
  name: string;
}

export interface ISubmitAgreementForm {
  description: string;
}

export interface ICreateShipmentParams
  extends IPaymentValuesForm,
    IProductDetailsForm,
    ISubmitAgreementForm,
    IOriginAndDestination {
  variety?: string;
  quality?: string;
  presentation?: string;
  size?: string;
  proposalSupplierEmail?: string;
  proposalBuyerEmail?: string;
  investmentAmount?: number;
  shippingStartDate?: Date | string;
  expectedShippingEndDate?: Date | string;
  contractId: string | number;
  portOfOrigin?: string;
  portOfDestination?: string;
  transport?: string;
  suppliersEmails?: string[];
  buyersEmails?: string[];
  buyerCompany?: ICompanyBaseInfo;
  supplierCompany?: ICompanyBaseInfo;
  roi: number;
  netBalance: number;
  nftID?: any;
  revenue: number;
  milestones?: {
    description: string;
    fundsDistribution: number;
  }[];
}

export interface AgreementPartyInfo {
  email: string;
  walletAddress: string;
  id: string;
  new: boolean;
}

export interface ShippingDetails {
  id: string;
  name: string;
  status: DealStatus;
  contractId?: string | number;
  origin: string;
  destination: string;
  presentation?: string;
  variety?: string;
  docs: any[];
  portOfDestination?: string;
  portOfOrigin?: string;
  proposalSupplierEmail?: string;
  buyerCompany: ICompanyBaseInfo;
  supplierCompany: ICompanyBaseInfo;
  proposalBuyerEmail?: string;
  shippingStartDate: string;
  expectedShippingEndDate: string;
  currentMilestone: number;
  suppliers: AgreementPartyInfo[];
  buyers: AgreementPartyInfo[];
  milestones: IMilestoneDetails[];
  investmentAmount?: number;
  revenue: number;
  netBalance: number;
  roi?: number;
  duration: string;
  daysLeft: number;
  quality?: string;
  offerUnitPrice: number;
  quantity: number;
  totalValue: number;
  transport?: ITransportType;
  description?: string;
  buyerConfirmed?: boolean;
  supplierConfirmed?: boolean;
  newDocuments?: boolean;
  /** Set on dashboard list API when milestones omit doc payloads. */
  hasDocuments?: boolean;
  nftID?: number;
  mintTxHash?: string;
  vaultAddress?: string;

  isPublished?: boolean;
}

export enum DealStatus {
  Proposal = "proposal",
  Confirmed = "confirmed",
  Finished = "finished",
  Repaid = "repaid",
  Cancelled = "cancelled",
  All = "all",
}

export enum Event {
  DealMilestoneChanged = "DealMilestoneChanged",
  DealCreated = "DealCreated",
}

export interface NftDealLogs {
  message: string;
  event: Event;
  txHash: string;
  blockTimestamp: string;
}
