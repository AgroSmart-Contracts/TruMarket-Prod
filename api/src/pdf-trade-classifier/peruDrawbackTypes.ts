/**
 * Document categories for Peru agro-export drawback traceability packs
 * (purchase → transport → plant/processing → export → customs/sworn).
 */
export enum PeruDrawbackDocumentType {
  CustomsDeclarationDAM = 'Peru Drawback: Customs Declaration (DAM/DUA/SAD)',
  SwornDeclarationImportedInputs = 'Peru Drawback: Sworn Declaration of Imported Inputs',
  RawMaterialPurchaseInvoice = 'Peru Drawback: Raw Material Purchase Invoice',
  RawMaterialTransportGuide = 'Peru Drawback: Raw Material Transport Guide (GRE to plant)',
  PlantProcessingMaquilaInvoice = 'Peru Drawback: Processing or Maquila Invoice',
  PackingMaterialsInvoice = 'Peru Drawback: Packing Materials Invoice',
  PackagingContract = 'Peru Drawback: Packaging or Maquila Contract',
  InternalPlantTransportGuide = 'Peru Drawback: Internal Plant Transport Guide',
  CommercialExportInvoice = 'Peru Drawback: Commercial Export Invoice',
  ExportTransportDocument = 'Peru Drawback: Export Transport Document (GRE)',
  ExportPackingList = 'Peru Drawback: Export Packing List',
}

export const PERU_DRAWBACK_DOCUMENT_TYPES = [
  PeruDrawbackDocumentType.CustomsDeclarationDAM,
  PeruDrawbackDocumentType.SwornDeclarationImportedInputs,
  PeruDrawbackDocumentType.RawMaterialPurchaseInvoice,
  PeruDrawbackDocumentType.RawMaterialTransportGuide,
  PeruDrawbackDocumentType.PlantProcessingMaquilaInvoice,
  PeruDrawbackDocumentType.PackingMaterialsInvoice,
  PeruDrawbackDocumentType.PackagingContract,
  PeruDrawbackDocumentType.InternalPlantTransportGuide,
  PeruDrawbackDocumentType.CommercialExportInvoice,
  PeruDrawbackDocumentType.ExportTransportDocument,
  PeruDrawbackDocumentType.ExportPackingList,
] as const;

export type ClassifiedPeruDrawbackType = PeruDrawbackDocumentType | 'Unknown';

export type PeruDrawbackClassificationRule = {
  type: PeruDrawbackDocumentType;
  keywords: string[];
};

/** Process stage from drawback playbook (1 = field procurement … 4 = export). */
export const PERU_DRAWBACK_PROCESS_STAGE: Record<
  PeruDrawbackDocumentType,
  1 | 2 | 3 | 4 | 5
> = {
  [PeruDrawbackDocumentType.RawMaterialPurchaseInvoice]: 1,
  [PeruDrawbackDocumentType.RawMaterialTransportGuide]: 2,
  [PeruDrawbackDocumentType.InternalPlantTransportGuide]: 2,
  [PeruDrawbackDocumentType.PackingMaterialsInvoice]: 2,
  [PeruDrawbackDocumentType.PlantProcessingMaquilaInvoice]: 3,
  [PeruDrawbackDocumentType.PackagingContract]: 3,
  [PeruDrawbackDocumentType.CommercialExportInvoice]: 4,
  [PeruDrawbackDocumentType.ExportTransportDocument]: 4,
  [PeruDrawbackDocumentType.ExportPackingList]: 4,
  [PeruDrawbackDocumentType.CustomsDeclarationDAM]: 4,
  [PeruDrawbackDocumentType.SwornDeclarationImportedInputs]: 5,
};
