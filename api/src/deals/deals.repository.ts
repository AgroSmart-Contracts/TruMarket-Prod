import { Repository } from '@/repository';

import { Deal, DealLog, DealStatus, DocumentFile } from './deals.entities';

export interface FindByUserQuery {
  status?: DealStatus;
  statuses?: DealStatus[];
}

export interface DealsRepository extends Repository<Deal> {
  findByUser(
    userId: string,
    userEmail: string | undefined,
    query: FindByUserQuery,
  ): Promise<Deal[]>;
  findByEmail(email: string): Promise<Deal>;
  pushDocument(
    dealId: string,
    document: { url: string; description: string; seenByUsers: string[] },
  ): Promise<DocumentFile>;
  pullDocument(dealId: string, docId: string): Promise<DocumentFile>;
  pushMilestoneDocument(
    dealId: string,
    milestoneId: string,
    document: {
      url: string;
      description: string;
      seenByUsers: string[];
      documentUploadMode?: string;
      tradePdfClassification?: Record<string, unknown>;
      peruDrawbackClassification?: Record<string, unknown>;
      verifiedByAdmin?: boolean;
    },
  ): Promise<DocumentFile>;
  updateMilestoneDocument(
    dealId: string,
    milestoneId: string,
    docId: string,
    key: string,
    value: string | boolean,
  ): Promise<DocumentFile>;
  setMilestoneDocumentAsViewed(
    dealId: string,
    milestoneId: string,
    docId: string,
    userId: string,
  ): Promise<DocumentFile>;
  pullMilestoneDocument(
    dealId: string,
    milestoneId: string,
    docId: string,
  ): Promise<void>;
  assignUserToDeals(
    userId: string,
    userEmail: string,
    walletAddress: string,
  ): Promise<void>;
  findDealsLogs(dealId: number): Promise<DealLog[]>;
}
