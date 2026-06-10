export enum DocumentType {
  CommercialInvoice = 'Commercial Invoice',
  BillOfLadingOrAwb = 'Bill of Lading or AWB',
  CertificateOfOrigin = 'Certificate of Origin',
  PackingList = 'Packing List',
  PhytosanitaryCertificate = 'Phytosanitary Certificate',
}

export const DOCUMENT_TYPES = [
  DocumentType.CommercialInvoice,
  DocumentType.BillOfLadingOrAwb,
  DocumentType.CertificateOfOrigin,
  DocumentType.PackingList,
  DocumentType.PhytosanitaryCertificate,
] as const;

export type ClassifiedDocumentType = DocumentType | 'Unknown';

export type ParsedPdfResult = {
  filePath: string;
  text: string;
  textPreview: string;
  metadata?: Record<string, unknown>;
};

export type ClassificationRule = {
  type: DocumentType;
  keywords: string[];
};
