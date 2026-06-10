/** Keep in sync with api/src/deals/deal-trade-document-registry.ts */
export const REQUIRED_TRADE_DOCUMENT_TYPES = [
  'Commercial Invoice',
  'Packing List',
  'Bill of Lading or AWB',
  'Phytosanitary Certificate',
  'Certificate of Origin',
] as const;

export type TradeDocumentType = (typeof REQUIRED_TRADE_DOCUMENT_TYPES)[number];

export type DealTradeDocumentCoverage = {
  requiredTypes: string[];
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
