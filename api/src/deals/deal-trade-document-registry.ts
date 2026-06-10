import type { Payment } from '@/payments/payments.entities';
import { PdfDocumentUploadMode } from '@/pdf-classification/pdf-upload-mode';

import { Deal } from './deals.entities';
import { inferDocumentTypeFromFileName } from './infer-document-type-from-filename';

/** One upload per type per deal/shipment (sync with web DOCUMENT_TYPES). */
export const REQUIRED_TRADE_DOCUMENT_TYPES = [
  'Commercial Invoice',
  'Packing List',
  'Bill of Lading or AWB',
  'Phytosanitary Certificate',
  'Certificate of Origin',
] as const;

export type TradeDocumentType = (typeof REQUIRED_TRADE_DOCUMENT_TYPES)[number];

export type DealTradeDocumentEntry = {
  documentType: string;
  url: string;
  uploadedAt?: Date;
  source: 'milestone' | 'payment';
  sourcePaymentId?: string;
  sourceMilestoneIndex?: number;
  reusedFromDeal?: boolean;
  documentUploadMode?: string;
  tradePdfClassification?: {
    detectedType: string;
    score: number;
    matchedKeywords: string[];
  };
};

export function normalizeTradeDocumentType(
  documentType?: string,
): string | null {
  if (!documentType?.trim()) {
    return null;
  }
  const normalized = documentType.trim().toLowerCase();
  const matched = REQUIRED_TRADE_DOCUMENT_TYPES.find(
    (required) => required.toLowerCase() === normalized,
  );
  return matched ?? null;
}

export function isRequiredTradeDocumentType(documentType: string): boolean {
  return normalizeTradeDocumentType(documentType) != null;
}

function milestoneDocType(doc: {
  description?: string;
  url?: string;
  tradePdfClassification?: { detectedType?: string };
  documentUploadMode?: string;
}): string | null {
  const fromClassification = normalizeTradeDocumentType(
    doc.tradePdfClassification?.detectedType,
  );
  if (fromClassification) {
    return fromClassification;
  }
  if (
    doc.documentUploadMode === PdfDocumentUploadMode.Payment ||
    doc.documentUploadMode === PdfDocumentUploadMode.Drawback
  ) {
    const fileName = doc.description || doc.url || '';
    return (
      normalizeTradeDocumentType(
        inferDocumentTypeFromFileName(fileName) ?? doc.description,
      ) ?? null
    );
  }
  const inferred = inferDocumentTypeFromFileName(
    doc.description || doc.url || '',
  );
  return inferred ? normalizeTradeDocumentType(inferred) : null;
}

/**
 * Latest document per required trade type across milestones and all deal payments.
 * First-found wins per type (milestones first, then payments in order).
 */
export function collectDealTradeDocumentsByType(
  deal: Deal,
  payments: Payment[],
): Map<string, DealTradeDocumentEntry> {
  const byType = new Map<string, DealTradeDocumentEntry>();

  const setIfAbsent = (type: string, entry: DealTradeDocumentEntry) => {
    if (!normalizeTradeDocumentType(type)) {
      return;
    }
    if (!byType.has(type)) {
      byType.set(type, entry);
    }
  };

  deal.milestones?.forEach((milestone, index) => {
    for (const doc of milestone.docs || []) {
      const type = milestoneDocType(doc as any);
      if (!type) continue;
      setIfAbsent(type, {
        documentType: type,
        url: doc.url,
        uploadedAt: (doc as any).createdAt,
        source: 'milestone',
        sourceMilestoneIndex: index,
        documentUploadMode: (doc as any).documentUploadMode,
        tradePdfClassification: (doc as any).tradePdfClassification,
      });
    }
  });

  for (const payment of payments) {
    for (const doc of payment.paymentDocuments || []) {
      const type = normalizeTradeDocumentType(doc.documentType);
      if (!type) continue;
      setIfAbsent(type, {
        documentType: type,
        url: doc.url,
        uploadedAt: doc.uploadedAt,
        source: 'payment',
        sourcePaymentId: payment.id,
        documentUploadMode: doc.documentUploadMode,
        tradePdfClassification: doc.tradePdfClassification,
      });
    }
  }

  return byType;
}

export function dealHasAllRequiredTradeDocuments(
  coverage: Map<string, DealTradeDocumentEntry>,
): boolean {
  return REQUIRED_TRADE_DOCUMENT_TYPES.every((type) => coverage.has(type));
}

export function buildPaymentDocumentsFromDealCoverage(
  coverage: Map<string, DealTradeDocumentEntry>,
): Array<{
  documentType: string;
  url: string;
  uploadedAt: Date;
  documentUploadMode: string;
  reusedFromDeal: boolean;
  tradePdfClassification?: DealTradeDocumentEntry['tradePdfClassification'];
}> {
  return REQUIRED_TRADE_DOCUMENT_TYPES.filter((type) => coverage.has(type)).map(
    (type) => {
      const entry = coverage.get(type)!;
      return {
        documentType: type,
        url: entry.url,
        uploadedAt: entry.uploadedAt ? new Date(entry.uploadedAt) : new Date(),
        documentUploadMode:
          entry.documentUploadMode || PdfDocumentUploadMode.Payment,
        reusedFromDeal: true,
        ...(entry.tradePdfClassification
          ? { tradePdfClassification: entry.tradePdfClassification }
          : {}),
      };
    },
  );
}

export type DealTradeDocumentCoverageDto = {
  requiredTypes: readonly string[];
  onFile: Record<
    string,
    {
      documentType: string;
      url: string;
      source: 'milestone' | 'payment';
      sourcePaymentId?: string;
      sourceMilestoneIndex?: number;
    }
  >;
  missingTypes: string[];
  complete: boolean;
};

export function buildDealTradeDocumentCoverageDto(
  deal: Deal,
  payments: Payment[],
): DealTradeDocumentCoverageDto {
  const coverage = collectDealTradeDocumentsByType(deal, payments);
  const onFile: DealTradeDocumentCoverageDto['onFile'] = {};

  for (const [type, entry] of coverage.entries()) {
    onFile[type] = {
      documentType: type,
      url: entry.url,
      source: entry.source,
      ...(entry.sourcePaymentId
        ? { sourcePaymentId: entry.sourcePaymentId }
        : {}),
      ...(entry.sourceMilestoneIndex != null
        ? { sourceMilestoneIndex: entry.sourceMilestoneIndex }
        : {}),
    };
  }

  const missingTypes = REQUIRED_TRADE_DOCUMENT_TYPES.filter(
    (t) => !coverage.has(t),
  );

  return {
    requiredTypes: REQUIRED_TRADE_DOCUMENT_TYPES,
    onFile,
    missingTypes,
    complete: missingTypes.length === 0,
  };
}
