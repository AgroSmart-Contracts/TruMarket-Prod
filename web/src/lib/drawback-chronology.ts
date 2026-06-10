/**
 * Early drawback auto-rejection from existing uploaded documents only.
 * Mirrors trumarket/api/src/deals/drawback-chronology-validation.ts
 */

import type { IMilestoneDetails } from "src/interfaces/global";
import type { Payment } from "src/interfaces/payment";
import { fileNameFromUrl, type MilestoneDoc } from "src/lib/shipment-trade-documents";

export type DrawbackProcessRole =
  | "purchase"
  | "rawMaterialTransport"
  | "packaging"
  | "export"
  | "sworn";

export type DrawbackChronologyRejectionCode =
  | "missing_main_product_transport"
  | "export_before_packaging"
  | "transport_after_packaging"
  | "purchase_after_later_stage"
  | "packaging_before_field"
  | "labels_transport_date_mismatch"
  | "labels_quantity_mismatch"
  | "labels_after_processing";

export type DrawbackChronologyDocument = {
  fileName: string;
  role: DrawbackProcessRole;
  dateIso: string;
  detectedType?: string;
  boxCount?: number | null;
  source?: string;
};

export type DrawbackChronologyValidation = {
  rejected: boolean;
  codes: DrawbackChronologyRejectionCode[];
  errors: string[];
  hasMinimalEvidence: boolean;
};

type DocLike = {
  documentUploadMode?: string;
  documentType?: string;
  description?: string;
  tradePdfClassification?: { detectedType?: string };
  peruDrawbackClassification?: {
    detectedType?: string;
    processStage?: number;
    documentDateIso?: string;
    boxCount?: number | null;
  };
};

function normalizeDetectedType(detectedType?: string): string {
  return (detectedType || "").toLowerCase();
}

function isPortLogisticsType(detectedType?: string): boolean {
  const dt = normalizeDetectedType(detectedType);
  return (
    dt.includes("export transport") ||
    dt.includes("customs declaration") ||
    dt.includes("export packing list") ||
    dt.includes("packaging or maquila contract")
  );
}

function roleFromClassifierType(detectedType: string): DrawbackProcessRole | null {
  const dt = normalizeDetectedType(detectedType);

  if (dt.includes("sworn declaration")) return "sworn";
  if (isPortLogisticsType(detectedType)) return null;
  if (dt.includes("raw material purchase")) return "purchase";
  if (dt.includes("raw material transport")) return "rawMaterialTransport";
  if (dt.includes("processing or maquila invoice")) return "packaging";
  if (dt.includes("packing materials")) return "packaging";
  if (dt.includes("internal plant")) return "packaging";
  if (dt.includes("commercial export")) return "export";

  return null;
}

function roleFromProcessStage(processStage?: number): DrawbackProcessRole | null {
  if (processStage === 1) return "purchase";
  if (processStage === 2) return "rawMaterialTransport";
  if (processStage === 3) return "packaging";
  if (processStage === 5) return "sworn";
  return null;
}

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

export function isDrawbackChronologyCandidate(_fileName: string, doc: DocLike): boolean {
  if (doc.documentUploadMode === "drawback") return true;
  if (doc.peruDrawbackClassification?.detectedType) return true;
  if (doc.tradePdfClassification?.detectedType) return true;
  return false;
}

function isProcessingMaquilaDoc(doc: DrawbackChronologyDocument): boolean {
  return normalizeDetectedType(doc.detectedType).includes("processing or maquila invoice");
}

function isPackingMaterialsInvoiceDoc(doc: DrawbackChronologyDocument): boolean {
  return normalizeDetectedType(doc.detectedType).includes("packing materials");
}

function isInternalPlantTransportDoc(doc: DrawbackChronologyDocument): boolean {
  return normalizeDetectedType(doc.detectedType).includes("internal plant");
}

export function collectDrawbackChronologyDocuments(
  milestones: IMilestoneDetails[],
  payments: Payment[],
): DrawbackChronologyDocument[] {
  const results: DrawbackChronologyDocument[] = [];
  const seenUrls = new Set<string>();

  const push = (fileName: string, url: string, doc: DocLike, source: string) => {
    if (!url || seenUrls.has(url)) return;
    if (!isDrawbackChronologyCandidate(fileName, doc)) return;

    const dateIso = doc.peruDrawbackClassification?.documentDateIso;
    if (!dateIso) return;

    const detectedType = doc.peruDrawbackClassification?.detectedType;
    const role = inferDrawbackProcessRole(
      fileName,
      detectedType,
      doc.peruDrawbackClassification?.processStage,
    );
    if (!role || role === "sworn") return;

    seenUrls.add(url);
    const boxCount = doc.peruDrawbackClassification?.boxCount ?? null;
    results.push({ fileName, role, dateIso, detectedType, source, boxCount });
  };

  for (const payment of payments) {
    for (const doc of payment.paymentDocuments || []) {
      if (!doc.url) continue;
      const fileName = fileNameFromUrl(doc.url);
      push(fileName, doc.url, doc as DocLike, "payment");
    }
  }

  for (const milestone of milestones) {
    for (const doc of (milestone.docs || []) as MilestoneDoc[]) {
      if (!doc.url) continue;
      const fileName = doc.description?.trim() || fileNameFromUrl(doc.url);
      push(fileName, doc.url, doc as DocLike, "milestone");
    }
  }

  return results;
}

export function evaluateDrawbackChronology(
  documents: DrawbackChronologyDocument[],
): DrawbackChronologyValidation {
  const dated = documents.filter((d) => d.dateIso);
  const byRole = groupByRole(dated);

  const codes: DrawbackChronologyRejectionCode[] = [];
  const errors: string[] = [];

  const hasPurchase = (byRole.get("purchase") || []).length > 0;
  const packagingDocs = byRole.get("packaging") || [];
  const hasExportSale = (byRole.get("export") || []).length > 0;
  const hasRawTransport = (byRole.get("rawMaterialTransport") || []).length > 0;

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
    codes.push("missing_main_product_transport");
    errors.push(
      "No main-product transport guide (GRE to plant) is dated while processing or export documents are already on file.",
    );
  }

  const exportSaleDates = datesForRole(byRole, "export");
  const purchaseDates = datesForRole(byRole, "purchase");
  const rawTransportDates = datesForRole(byRole, "rawMaterialTransport");
  const fieldDates = [...purchaseDates, ...rawTransportDates];

  if (processingDates.length && fieldDates.length) {
    const earliestField = minIso(fieldDates);
    const earliestProcessing = minIso(processingDates);
    if (earliestProcessing < earliestField) {
      codes.push("packaging_before_field");
      errors.push(
        `Packing/maquila date (${earliestProcessing}) is before the earliest field-stage document (${earliestField}) — fruit must be purchased and moved to the plant first.`,
      );
    }
  }

  if (exportSaleDates.length && processingDates.length) {
    const earliestExportSale = minIso(exportSaleDates);
    const latestProcessing = maxIso(processingDates);
    if (earliestExportSale < latestProcessing) {
      codes.push("export_before_packaging");
      errors.push(
        `Commercial export invoice date (${earliestExportSale}) is before packing/maquila date (${latestProcessing}) — packing must finish before the export sale invoice.`,
      );
    }
  }

  if (purchaseDates.length && processingDates.length) {
    const earliestProcessing = minIso(processingDates);
    const latestPurchase = maxIso(purchaseDates);
    if (latestPurchase > earliestProcessing) {
      codes.push("purchase_after_later_stage");
      errors.push(
        `Fruit purchase invoice date (${latestPurchase}) is after packing/maquila started (${earliestProcessing}).`,
      );
    }
  }

  if (purchaseDates.length && exportSaleDates.length) {
    const earliestExportSale = minIso(exportSaleDates);
    const latestPurchase = maxIso(purchaseDates);
    if (latestPurchase > earliestExportSale) {
      codes.push("purchase_after_later_stage");
      errors.push(
        `Fruit purchase invoice date (${latestPurchase}) is after the commercial export invoice (${earliestExportSale}).`,
      );
    }
  }

  if (rawTransportDates.length && processingDates.length) {
    const earliestProcessing = minIso(processingDates);
    const latestTransport = maxIso(rawTransportDates);
    if (latestTransport > earliestProcessing) {
      codes.push("transport_after_packaging");
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
      codes.push("labels_quantity_mismatch");
      errors.push(
        `Labels invoice box count (${invoice.boxCount}) does not match labels transport guide box count (${transport.boxCount}).`,
      );
    }

    if (processingDates.length > 0 && invoice.dateIso > minIso(processingDates)) {
      codes.push("labels_after_processing");
      errors.push(
        `Labels invoice date (${invoice.dateIso}) is after processing/maquila started (${minIso(processingDates)}).`,
      );
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
  return dates.reduce((earliest, current) => (current < earliest ? current : earliest));
}

function maxIso(dates: string[]): string {
  return dates.reduce((latest, current) => (current > latest ? current : latest));
}
