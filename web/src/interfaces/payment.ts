export enum PaymentStatus {
  PaymentRequested = 'payment_requested',
  InProgress = 'in_progress',
  VerifyingDocuments = 'verifying_documents',
  Completed = 'completed',
  Failed = 'failed',
}

import type { OsnFeeQuoteData } from './osnFeeQuote';

export type PaymentMethod = 'BANK_TRANSFER' | 'OSN_ONRAMP';

export interface PaymentDocument {
  documentType: string;
  url: string;
  uploadedAt: Date;
  verifiedByAdmin?: boolean;
  verifiedAt?: Date;
}

export interface Payment {
  id: string;
  dealId: string;
  buyerId: string;
  supplierId?: string;
  supplierEmail: string;
  sequence?: number;
  dueDate?: Date;
  amount: number;
  currency: string;
  /** Admin fee-quote snapshot if supplied at creation (buyerFeeAmount, totalBuyerPays, etc.). */
  feeQuote?: OsnFeeQuoteData;
  method?: PaymentMethod;
  invoiceNumber?: string;
  description?: string;
  isOfframpRequested?: boolean;
  status: PaymentStatus;
  paymentDocuments?: PaymentDocument[];
  createdAt: Date;
}

/** Provider transfer row returned from mint-request and GET /payments/:id/transfers */
export interface PaymentProviderTransfer {
  id: string;
  paymentId: string;
  actorUserId?: string;
  provider?: string;
  type?: string;
  request?: unknown;
  response?: Record<string, unknown> | null;
  providerMintRequestId?: string;
  providerPaymentId?: string;
  providerStatus?: string;
  depositInstructions?: unknown;
  estimatedFees?: unknown;
  payInBankDetails?: unknown;
  bankTxNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}
