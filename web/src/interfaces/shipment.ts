import { ICompanyBaseInfo, IMilestoneDetails, ITransportType, MilestoneStatus } from "./global";

export interface IPaymentValuesForm {
  quantity: string;
  offerUnitPrice: string;
  investmentAmountPercentage: string;
}

export interface IOriginAndDestination {
  origin: string;
  destination: string;
  port_origin?: string;
  shippingStartDate: Date | string;
  expectedShippingEndDate: Date | string;
  port_destination?: string;
  transport: string;
}

export interface IProductDetailsForm {
  name: string;
  variety: string;
  quality: string;
  presentation: string;
}

export interface ISubmitAgreementForm {
  description: string;
}

export interface ICreateShipmentParams
  extends IPaymentValuesForm,
    IProductDetailsForm,
    ISubmitAgreementForm,
    IOriginAndDestination {
  proposalSupplierEmail?: string;
  proposalBuyerEmail?: string;
  investmentAmount: number;
  expectedShippingEndDate: any;
  contractId: string | number;
  portOfOrigin?: string;
  suppliersEmails?: string[];
  buyersEmails?: string[];
  buyerCompany?: ICompanyBaseInfo;
  supplierCompany?: ICompanyBaseInfo;
  portOfDestination: string;
  roi: number;
  netBalance: number;
  nftID?: any;
  revenue: number;
  milestones: {
    description: string;
    fundsDistribution: number;
  }[];
}

export interface AgreementPartyInfo {
  approved?: boolean;
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
  presentation: string;
  variety: string;
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
  investmentAmount: number;
  revenue: number;
  netBalance: number;
  roi?: number;
  duration: string;
  daysLeft: number;
  quality: string;
  offerUnitPrice: number;
  quantity: number;
  totalValue: number;
  transport?: ITransportType;
  description?: string;
  buyerConfirmed?: boolean;
  supplierConfirmed?: boolean;
  newDocuments?: boolean;
  newForBuyer?: boolean;
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

export interface IMilestoneStatusInfo {
  submitToReview?: boolean;
  approve?: boolean;
  deny?: boolean;
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
