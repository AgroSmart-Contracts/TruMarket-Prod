import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export interface DocumentFile {
  id: string;
  description: string;
  url: string;
  seenByUsers: string[];
  seen: boolean;
  publiclyVisible: boolean;
}

export interface Wallet {
  address: string;
}

export class Milestone {
  @ApiProperty()
  @Expose()
  id?: string;

  @ApiProperty()
  @Expose()
  description: string;

  @ApiProperty()
  @Expose()
  fundsDistribution: number;

  @ApiProperty()
  @Expose()
  docs?: DocumentFile[];

  @ApiProperty()
  @Expose()
  status?: MilestoneStatus;

}

export enum DealStatus {
  Proposal = 'proposal',
  Confirmed = 'confirmed',
  Finished = 'finished',
  Repaid = 'repaid',
  Cancelled = 'cancelled',
}

export enum MilestoneStatus {
  InProgress = 'in progress',
  NotCompleted = 'not completed',
  Completed = 'completed',
}

export class DealParticipant {
  id?: string;
  email: string;
  walletAddress?: string;
  new?: boolean;
}

export class DealCompany {
  name: string;
  country: string;
  taxId: string;
}

export class Deal {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string;
  docs: DocumentFile[];
  carbonFootprint: string;

  // smart contract properties
  nftID: number;
  mintTxHash: string;
  vaultAddress: string;

  // shipping properties
  contractId: number;
  contractAddress: string;
  origin: string;
  destination: string;
  portOfOrigin: string;
  portOfDestination: string;
  transport: string;
  presentation: string;
  size: string;
  variety: string;
  quality: string;
  offerUnitPrice: number;
  quantity: number;
  totalValue: number;
  shippingStartDate: Date;
  expectedShippingEndDate: Date;
  duration: string;
  daysLeft: number;

  // state properties
  currentMilestone: number;
  milestones: Milestone[];
  status: DealStatus;
  isPublished: boolean;

  // financial properties
  investmentAmount: number;
  revenue: number;
  netBalance: number;
  roi: number;

  // ownership properties
  whitelist: Wallet[];
  buyers: DealParticipant[];
  suppliers: DealParticipant[];
  buyerCompany: DealCompany;
  supplierCompany: DealCompany;

  // payments: list of Payment document ids associated with this deal
  payments?: string[];

  // ui helper properties
  newDocuments: boolean;
  new: boolean;

  createdAt: Date;
}

export interface DealLog {
  dealId: string;
  event: string;
  args: any;
  blockNumber: number;
  blockTimestamp: Date;
  txHash: string;
  message: string;
}
