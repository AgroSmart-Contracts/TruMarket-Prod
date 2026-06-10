/**
 * Early drawback auto-rejection from existing uploaded documents only.
 *
 * Physical flow (Peru agro export):
 * 1. Field — fruit purchase invoice + GRE to packing plant (same day per lot).
 * 2. Packing facility — maquila + boxes/labels/clamshells (same day or close; after field).
 * 3. Port — commercial export invoice (factura venta exportación) last.
 *
 * DAM, export GRE, and DJ are not used for sale-vs-maquila date ordering.
 *
 * Roles and chronology anchors use PDF classification (`detectedType`, `processStage`) only —
 * not upload filenames.
 */

export type DrawbackProcessRole =
  | 'purchase'
  | 'rawMaterialTransport'
  | 'packaging'
  | 'export'
  | 'sworn';

export type DrawbackChronologyRejectionCode =
  | 'missing_main_product_transport'
  | 'export_before_packaging'
  | 'transport_after_packaging'
  | 'purchase_after_later_stage'
  | 'packaging_before_field'
  | 'labels_transport_date_mismatch'
  | 'labels_quantity_mismatch'
  | 'labels_after_processing';

export type DrawbackChronologyDocument = {
  fileName: string;
  role: DrawbackProcessRole;
  dateIso: string;
  /** Peru drawback classifier output — used for maquila/labels anchors (not filename). */
  detectedType?: string;
  boxCount?: number | null;
  source?: string;
};

export type DrawbackChronologyValidation = {
  rejected: boolean;
  codes: DrawbackChronologyRejectionCode[];
  errors: string[];
  /** True when at least two dated roles exist (enough for early chronology check). */
  hasMinimalEvidence: boolean;
};

function normalizeDetectedType(detectedType?: string): string {
  return (detectedType || '').toLowerCase();
}

/** Excluded from maquila vs export-invoice date ordering. */
function isPortLogisticsType(detectedType?: string): boolean {
  const dt = normalizeDetectedType(detectedType);
  return (
    dt.includes('export transport') ||
    dt.includes('customs declaration') ||
    dt.includes('export packing list') ||
    dt.includes('packaging or maquila contract')
  );
}

/** Map `peruDrawbackClassification.detectedType` to a chronology role. */
function roleFromClassifierType(
  detectedType: string,
): DrawbackProcessRole | null {
  const dt = normalizeDetectedType(detectedType);

  if (dt.includes('sworn declaration')) return 'sworn';
  if (isPortLogisticsType(detectedType)) return null;
  if (dt.includes('raw material purchase')) return 'purchase';
  if (dt.includes('raw material transport')) return 'rawMaterialTransport';
  if (dt.includes('processing or maquila invoice')) return 'packaging';
  if (dt.includes('packing materials')) return 'packaging';
  if (dt.includes('internal plant')) return 'packaging';
  if (dt.includes('commercial export')) return 'export';

  return null;
}

function roleFromProcessStage(
  processStage?: number,
): DrawbackProcessRole | null {
  if (processStage === 1) return 'purchase';
  if (processStage === 2) return 'rawMaterialTransport';
  if (processStage === 3) return 'packaging';
  if (processStage === 5) return 'sworn';
  // Stage 4 may be export invoice or port logistics — do not assume export without type.
  return null;
}

/**
 * Chronology role for field (purchase + transport) → packing → commercial export sale.
 * Uses PDF classification only (`detectedType`, then `processStage` fallback).
 */
export function inferDrawbackProcessRole(
  _fileName: string,
  detectedType?: string,
  processStage?: number,
): DrawbackProcessRole | null {
  if (detectedType) {
    const fromType = roleFromClassifierType(detectedType);
    if (fromType !== null) return fromType;
  }
  return roleFromProcessStage(processStage);
}

export function isDrawbackChronologyCandidate(
  _fileName: string,
  doc: {
    documentUploadMode?: string;
    peruDrawbackClassification?: { detectedType?: string };
    tradePdfClassification?: { detectedType?: string };
  },
): boolean {
  if (doc.documentUploadMode === 'drawback') return true;
  if (doc.peruDrawbackClassification?.detectedType) return true;
  if (doc.tradePdfClassification?.detectedType) return true;
  return false;
}

function isProcessingMaquilaDoc(doc: DrawbackChronologyDocument): boolean {
  return normalizeDetectedType(doc.detectedType).includes(
    'processing or maquila invoice',
  );
}

function isPackingMaterialsInvoiceDoc(
  doc: DrawbackChronologyDocument,
): boolean {
  return normalizeDetectedType(doc.detectedType).includes('packing materials');
}

function isInternalPlantTransportDoc(doc: DrawbackChronologyDocument): boolean {
  return normalizeDetectedType(doc.detectedType).includes('internal plant');
}

export function evaluateDrawbackChronology(
  documents: DrawbackChronologyDocument[],
): DrawbackChronologyValidation {
  const dated = documents.filter((d) => d.dateIso);
  const byRole = groupByRole(dated);

  const codes: DrawbackChronologyRejectionCode[] = [];
  const errors: string[] = [];

  const hasPurchase = (byRole.get('purchase') || []).length > 0;
  const packagingDocs = byRole.get('packaging') || [];
  const hasExportSale = (byRole.get('export') || []).length > 0;
  const hasRawTransport = (byRole.get('rawMaterialTransport') || []).length > 0;

  const processingDocs = packagingDocs.filter(isProcessingMaquilaDoc);
  const processingDates = processingDocs.map((d) => d.dateIso);

  const hasMinimalEvidence =
    dated.length >= 2 &&
    (hasExportSale || processingDocs.length > 0) &&
    (hasPurchase || hasRawTransport || processingDocs.length > 0);

  if (
    !hasRawTransport &&
    (processingDocs.length > 0 || hasExportSale) &&
    dated.length >= 1
  ) {
    codes.push('missing_main_product_transport');
    errors.push(
      'No main-product transport guide (GRE to plant) is dated while processing or export documents are already on file.',
    );
  }

  const exportSaleDates = datesForRole(byRole, 'export');
  const purchaseDates = datesForRole(byRole, 'purchase');
  const rawTransportDates = datesForRole(byRole, 'rawMaterialTransport');

  const fieldDates = [...purchaseDates, ...rawTransportDates];

  if (processingDates.length && fieldDates.length) {
    const earliestField = minIso(fieldDates);
    const earliestProcessing = minIso(processingDates);
    if (earliestProcessing < earliestField) {
      codes.push('packaging_before_field');
      errors.push(
        `Packing/maquila date (${earliestProcessing}) is before the earliest field-stage document (${earliestField}) — fruit must be purchased and moved to the plant first.`,
      );
    }
  }

  if (exportSaleDates.length && processingDates.length) {
    const earliestExportSale = minIso(exportSaleDates);
    const latestProcessing = maxIso(processingDates);
    if (earliestExportSale < latestProcessing) {
      codes.push('export_before_packaging');
      errors.push(
        `Commercial export invoice date (${earliestExportSale}) is before packing/maquila date (${latestProcessing}) — packing must finish before the export sale invoice.`,
      );
    }
  }

  if (purchaseDates.length && processingDates.length) {
    const earliestProcessing = minIso(processingDates);
    const latestPurchase = maxIso(purchaseDates);
    if (latestPurchase > earliestProcessing) {
      codes.push('purchase_after_later_stage');
      errors.push(
        `Fruit purchase invoice date (${latestPurchase}) is after packing/maquila started (${earliestProcessing}).`,
      );
    }
  }

  if (purchaseDates.length && exportSaleDates.length) {
    const earliestExportSale = minIso(exportSaleDates);
    const latestPurchase = maxIso(purchaseDates);
    if (latestPurchase > earliestExportSale) {
      codes.push('purchase_after_later_stage');
      errors.push(
        `Fruit purchase invoice date (${latestPurchase}) is after the commercial export invoice (${earliestExportSale}).`,
      );
    }
  }

  if (rawTransportDates.length && processingDates.length) {
    const earliestProcessing = minIso(processingDates);
    const latestTransport = maxIso(rawTransportDates);
    if (latestTransport > earliestProcessing) {
      codes.push('transport_after_packaging');
      errors.push(
        `Raw material transport date (${latestTransport}) is after packing/maquila started (${earliestProcessing}) — field transport to the plant must precede processing.`,
      );
    }
  }

  const labelsInvoiceDocs = dated.filter(isPackingMaterialsInvoiceDoc);
  const labelsTransportDocs = dated.filter(isInternalPlantTransportDoc);

  const sameDayLabelPairs: Array<{
    invoice: DrawbackChronologyDocument;
    transport: DrawbackChronologyDocument;
  }> = [];
  for (const transport of labelsTransportDocs) {
    for (const invoice of labelsInvoiceDocs) {
      if (invoice.dateIso === transport.dateIso) {
        sameDayLabelPairs.push({ invoice, transport });
      }
    }
  }

  for (const { invoice, transport } of sameDayLabelPairs) {
    if (
      invoice.boxCount != null &&
      transport.boxCount != null &&
      invoice.boxCount !== transport.boxCount
    ) {
      codes.push('labels_quantity_mismatch');
      errors.push(
        `Labels invoice box count (${invoice.boxCount}) does not match labels transport guide box count (${transport.boxCount}).`,
      );
    }

    if (processingDates.length > 0) {
      const earliestProcessing = minIso(processingDates);
      if (invoice.dateIso > earliestProcessing) {
        codes.push('labels_after_processing');
        errors.push(
          `Labels invoice date (${invoice.dateIso}) is after processing/maquila started (${earliestProcessing}).`,
        );
      }
    }
  }

  const uniqueCodes = Array.from(new Set(codes));
  return {
    rejected: uniqueCodes.length > 0,
    codes: uniqueCodes,
    errors: Array.from(new Set(errors)),
    hasMinimalEvidence,
  };
}

function groupByRole(
  documents: DrawbackChronologyDocument[],
): Map<DrawbackProcessRole, DrawbackChronologyDocument[]> {
  const map = new Map<DrawbackProcessRole, DrawbackChronologyDocument[]>();
  for (const doc of documents) {
    const list = map.get(doc.role) || [];
    list.push(doc);
    map.set(doc.role, list);
  }
  return map;
}

function datesForRole(
  byRole: Map<DrawbackProcessRole, DrawbackChronologyDocument[]>,
  role: DrawbackProcessRole,
): string[] {
  return (byRole.get(role) || []).map((d) => d.dateIso).sort();
}

function minIso(dates: string[]): string {
  return dates.reduce((earliest, current) =>
    current < earliest ? current : earliest,
  );
}

function maxIso(dates: string[]): string {
  return dates.reduce((latest, current) =>
    current > latest ? current : latest,
  );
}
