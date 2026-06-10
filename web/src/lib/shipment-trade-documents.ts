import type { IMilestoneDetails } from "src/interfaces/global";
import type { Payment } from "src/interfaces/payment";

export type MilestoneDoc = {
  id: string;
  url: string;
  description?: string;
  seen?: boolean;
  publiclyVisible?: boolean;
  documentUploadMode?: string;
  verifiedByAdmin?: boolean;
  verifiedAt?: string;
  tradePdfClassification?: {
    detectedType: string;
    score: number;
    matchedKeywords: string[];
  };
  peruDrawbackClassification?: {
    detectedType: string;
    score: number;
    matchedKeywords: string[];
    processStage?: number;
    documentDateIso?: string;
    boxCount?: number | null;
    validationRulesetId?: string;
    validationRulesVersion?: number;
  };
};

export type ShipmentDocumentKind = "drawback" | "payment" | "trade";

export type ShipmentTradeDocument = {
  id: string;
  label: string;
  fileName: string;
  url: string;
  source: "payment" | "milestone";
  kind: ShipmentDocumentKind;
  paymentSequence?: number;
  milestoneLabel?: string;
  milestoneId?: string;
  milestoneDocId?: string;
  publiclyVisible?: boolean;
  seen?: boolean;
};

export function fileNameFromUrl(url: string): string {
  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop() || "document");
  } catch {
    return "document";
  }
}

/** Filename hints when stored classification is missing (legacy uploads). */
export function inferDocumentTypeFromFileName(fileName: string): string | undefined {
  const compact = fileName.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (compact.includes("e001") || compact.includes("invoice") || compact.includes("factura")) {
    return "Commercial Invoice";
  }
  if (compact.includes("packinglist") || /pl\d|^\d+pl|_pl/.test(compact)) {
    return "Packing List";
  }
  if (compact.includes("phito") || compact.includes("phyto") || compact.includes("fito")) {
    return "Phytosanitary Certificate";
  }
  if (compact.includes("certificadoorigen") || /(^|\d)co(\d|$)/.test(compact)) {
    return "Certificate of Origin";
  }
  if (compact.includes("bld") || compact.includes("awb") || /bl[a-z]/.test(compact)) {
    return "Bill of Lading or AWB";
  }
  return undefined;
}

function shortPeruDrawbackLabel(detectedType: string): string {
  return detectedType.replace(/^Peru Drawback:\s*/i, "").trim();
}

function isDrawbackMilestoneDoc(doc: MilestoneDoc): boolean {
  if (doc.documentUploadMode === "drawback") return true;
  const peruType = doc.peruDrawbackClassification?.detectedType;
  return Boolean(peruType && peruType !== "Unknown");
}

function documentKindFromMilestoneDoc(doc: MilestoneDoc): ShipmentDocumentKind {
  if (isDrawbackMilestoneDoc(doc)) return "drawback";
  if (doc.documentUploadMode === "payment") return "payment";
  return "trade";
}

export function resolveDocumentLabel(
  fileName: string,
  doc: {
    description?: string;
    documentType?: string;
    documentUploadMode?: string;
    tradePdfClassification?: { detectedType: string };
    peruDrawbackClassification?: { detectedType: string };
  },
): string {
  const peruType = doc.peruDrawbackClassification?.detectedType;
  if (peruType && peruType !== "Unknown") {
    return shortPeruDrawbackLabel(peruType);
  }
  if (doc.documentUploadMode === "drawback") {
    const desc = doc.description?.trim();
    if (desc && desc.length < 120 && !desc.toLowerCase().endsWith(".pdf")) {
      return desc;
    }
    return "Drawback document";
  }
  const type = doc.tradePdfClassification?.detectedType;
  if (type && type !== "Unknown") return type;
  if (doc.documentType && doc.documentType !== "Other") return doc.documentType;
  const fromName = inferDocumentTypeFromFileName(fileName);
  if (fromName) return fromName;
  const desc = doc.description?.trim();
  if (desc && desc.length < 80 && !desc.toLowerCase().endsWith(".pdf")) {
    return desc;
  }
  return "Trade document";
}

function isTradeMilestoneDoc(doc: MilestoneDoc): boolean {
  if (doc.documentUploadMode === "payment" || doc.documentUploadMode === "drawback") {
    return true;
  }
  if (doc.tradePdfClassification?.detectedType && doc.tradePdfClassification.detectedType !== "Unknown") {
    return true;
  }
  const name = (doc.description || doc.url || "").toLowerCase();
  return name.endsWith(".pdf");
}

/** Milestone + payment trade documents in one list (payment-style presentation). */
export function collectShipmentTradeDocuments(
  milestones: IMilestoneDetails[],
  payments: Payment[],
): ShipmentTradeDocument[] {
  const results: ShipmentTradeDocument[] = [];
  const seenUrls = new Set<string>();

  for (const payment of payments) {
    for (const doc of payment.paymentDocuments || []) {
      if (!doc.url || seenUrls.has(doc.url)) continue;
      seenUrls.add(doc.url);
      const fileName = fileNameFromUrl(doc.url);
      results.push({
        id: `payment-${payment.id}-${doc.url}`,
        label: resolveDocumentLabel(fileName, doc),
        fileName,
        url: doc.url,
        source: "payment",
        kind: "payment",
        paymentSequence: payment.sequence,
      });
    }
  }

  milestones.forEach((milestone, index) => {
    const docs = (milestone.docs || []) as MilestoneDoc[];
    for (const doc of docs) {
      if (!doc.url || !isTradeMilestoneDoc(doc) || seenUrls.has(doc.url)) continue;
      seenUrls.add(doc.url);
      const fileName = doc.description?.trim() || fileNameFromUrl(doc.url);
      results.push({
        id: `milestone-${doc.id}`,
        label: resolveDocumentLabel(fileName, doc),
        fileName: fileNameFromUrl(doc.url),
        url: doc.url,
        source: "milestone",
        kind: documentKindFromMilestoneDoc(doc),
        milestoneLabel: milestone.description || `Milestone ${index + 1}`,
        milestoneId: milestone.id,
        milestoneDocId: doc.id,
        publiclyVisible: doc.publiclyVisible,
        seen: doc.seen,
      });
    }
  });

  return results;
}
