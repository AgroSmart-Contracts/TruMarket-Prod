export enum FrontendDocumentType {
    CommercialInvoice = 'Commercial Invoice',
    BillOfLadingOrAwb = 'Bill of Lading or AWB',
    CertificateOfOrigin = 'Certificate of Origin',
    PackingList = 'Packing List',
    PhytosanitaryCertificate = 'Phytosanitary Certificate',
}

export type FrontendClassifiedDocumentType = FrontendDocumentType | 'Unknown';

export type FrontendClassificationResult = {
    type: FrontendClassifiedDocumentType;
    score: number;
    matchedKeywords: string[];
};

