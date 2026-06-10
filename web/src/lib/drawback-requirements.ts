import { MilestoneEnum, type IMilestoneDetails } from "src/interfaces/global";
import type { Payment } from "src/interfaces/payment";
import { PaymentStatus } from "src/interfaces/payment";
import {
  collectDrawbackChronologyDocuments,
  evaluateDrawbackChronology,
  type DrawbackChronologyRejectionCode,
} from "src/lib/drawback-chronology";
import {
  DRAWBACK_REQUIRED_SLOTS,
  evaluateDrawbackDecisionTree,
  type DrawbackFinding,
  type DrawbackRequirementSlot,
} from "src/lib/drawback-decision-tree";
import {
  fileNameFromUrl,
  inferDocumentTypeFromFileName,
  type MilestoneDoc,
} from "src/lib/shipment-trade-documents";

export type DrawbackRequirementId =
  | "rawMaterialPurchaseInvoice"
  | "rawMaterialTransportGuide"
  | "processingMaquilaInvoice"
  | "packingMaterialsInvoice"
  | "packagingContract"
  | "internalPlantTransportGuide"
  | "commercialExportInvoice"
  | "exportTransportDocument"
  | "customsDeclarationDam"
  | "swornDeclarationImportedInputs";

export type DrawbackRequirementStatus = "verified" | "pending" | "missing";

export type DrawbackRequirementRow = {
  id: DrawbackRequirementId;
  status: DrawbackRequirementStatus;
  documentUrl?: string;
  documentLabel?: string;
  /** Already attached on the deal or a payment (no separate drawback upload needed). */
  onFile?: boolean;
};

type DrawbackCollectedDocument = {
  id: string;
  url: string;
  label: string;
  source: "milestone" | "payment";
  verifiedByAdmin?: boolean;
  detectedType?: string;
  requirementId: DrawbackRequirementId;
  processStage?: number;
  documentDateIso?: string;
};

export const DRAWBACK_REQUIREMENT_IDS: DrawbackRequirementId[] = [
  "rawMaterialPurchaseInvoice",
  "rawMaterialTransportGuide",
  "processingMaquilaInvoice",
  "packingMaterialsInvoice",
  "packagingContract",
  "internalPlantTransportGuide",
  "commercialExportInvoice",
  "exportTransportDocument",
  "customsDeclarationDam",
  "swornDeclarationImportedInputs",
];

const REQUIREMENT_HINTS: Record<DrawbackRequirementId, string> = {
  rawMaterialPurchaseInvoice: "Raw material purchase invoice",
  rawMaterialTransportGuide: "Raw material transport guide (to plant)",
  processingMaquilaInvoice: "Processing / maquila invoice",
  packingMaterialsInvoice: "Packing materials invoices (boxes, labels, clamshells)",
  packagingContract: "Packaging / maquila contract",
  internalPlantTransportGuide: "Internal plant transport guide",
  commercialExportInvoice: "Commercial export invoice",
  exportTransportDocument: "Export transport document (GRE)",
  customsDeclarationDam: "Customs declaration (DAM/DUA/SAD)",
  swornDeclarationImportedInputs: "Sworn declaration of imported inputs",
};

/** Canonical trade-document labels already used on payments / deal milestones. */
const TRADE_LABEL_TO_REQUIREMENT: Record<string, DrawbackRequirementId> = {
  "commercial invoice": "commercialExportInvoice",
};

const PERU_DRAWBACK_TYPE_TO_REQUIREMENT: Record<string, DrawbackRequirementId> = {
  "peru drawback: raw material purchase invoice": "rawMaterialPurchaseInvoice",
  "peru drawback: raw material transport guide (gre to plant)": "rawMaterialTransportGuide",
  "peru drawback: processing or maquila invoice": "processingMaquilaInvoice",
  "peru drawback: packing materials invoice": "packingMaterialsInvoice",
  "peru drawback: packaging or maquila contract": "packagingContract",
  "peru drawback: internal plant transport guide": "internalPlantTransportGuide",
  "peru drawback: commercial export invoice": "commercialExportInvoice",
  "peru drawback: export transport document (gre)": "exportTransportDocument",
  "peru drawback: export transport document (bl/awb/gre)": "exportTransportDocument",
  "peru drawback: customs declaration (dam/dua/sad)": "customsDeclarationDam",
  "peru drawback: sworn declaration of imported inputs": "swornDeclarationImportedInputs",
};

const REQUIREMENT_PATTERNS: Record<DrawbackRequirementId, RegExp[]> = {
  rawMaterialPurchaseInvoice: [
    /factura.*compra.*(fruta|materia)/i,
    /raw\s*material.*purchase.*invoice/i,
    /liquidaci[oó]n.*compra/i,
  ],
  rawMaterialTransportGuide: [
    /gu[ií]a.*remisi[oó]n.*(materia|fruta|compra)/i,
    /raw\s*material.*transport.*guide/i,
    /\bgre\b.*(plant|planta)/i,
  ],
  processingMaquilaInvoice: [
    /maquila/i,
    /processing.*invoice/i,
    /servicio.*(empaque|encargo|procesamiento)/i,
  ],
  packingMaterialsInvoice: [
    /(cajas|clamshell|etiquetas|labels).*(factura|invoice)/i,
    /packing\s*materials?\s*invoice/i,
    /materiales?\s*de\s*empaque/i,
  ],
  packagingContract: [/contrato.*(maquila|empaque)/i, /packaging\s*contract/i],
  internalPlantTransportGuide: [
    /gu[ií]a.*(interna|transformaci[oó]n|almac[eé]n)/i,
    /internal.*plant.*transport/i,
  ],
  commercialExportInvoice: [
    /commercial\s*(export\s*)?invoice/i,
    /export\s*invoice/i,
    /factura.*export/i,
  ],
  exportTransportDocument: [
    /gu[ií]a.*remisi[oó]n.*export/i,
    /gre.*export/i,
    /export.*gre/i,
    /export\s*transport/i,
    /motivo.*traslado.*exportaci[oó]n/i,
  ],
  customsDeclarationDam: [
    /customs\s*declaration/i,
    /\bdam\b/i,
    /\bdua\b/i,
    /\bsad\b/i,
    /declaraci[oó]n.*aduaner/i,
  ],
  swornDeclarationImportedInputs: [
    /declaraci[oó]n.*jurada/i,
    /sworn\s*declaration/i,
    /insumos?\s*importados?/i,
  ],
};

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function matchesPatterns(value: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(value));
}

function matchDrawbackRequirementId(
  detectedType?: string,
  fileName?: string,
  description?: string,
): DrawbackRequirementId | null {
  const candidates = [detectedType, description, fileName].filter(Boolean) as string[];
  for (const raw of candidates) {
    const canonical = raw.trim().toLowerCase();
    if (PERU_DRAWBACK_TYPE_TO_REQUIREMENT[canonical]) {
      return PERU_DRAWBACK_TYPE_TO_REQUIREMENT[canonical];
    }
    if (TRADE_LABEL_TO_REQUIREMENT[canonical]) {
      return TRADE_LABEL_TO_REQUIREMENT[canonical];
    }
    for (const id of DRAWBACK_REQUIREMENT_IDS) {
      if (matchesPatterns(raw, REQUIREMENT_PATTERNS[id])) {
        return id;
      }
    }
    const compact = normalizeToken(raw);
    if (compact.includes("declaracionjurada") || compact.includes("insumos")) {
      return "swornDeclarationImportedInputs";
    }
    if (compact.includes("contrato") && (compact.includes("maquila") || compact.includes("empaque"))) {
      return "packagingContract";
    }
    if (compact.includes("dam") || compact.includes("dua") || compact.includes("sad")) {
      return "customsDeclarationDam";
    }
    if (
      (compact.includes("gre") || compact.includes("guiaremision") || compact.includes("grer")) &&
      compact.includes("export")
    ) {
      return "exportTransportDocument";
    }
    if (compact.includes("maquila") || compact.includes("procesamiento")) {
      return "processingMaquilaInvoice";
    }
    if (compact.includes("factura") && compact.includes("etiquetas") && !compact.includes("export") && !compact.includes("mp")) {
      return "packingMaterialsInvoice";
    }
    if (compact.includes("guia") && compact.includes("etiquetas") && !compact.includes("export")) {
      return "internalPlantTransportGuide";
    }
    if (compact.includes("clamshell") || compact.includes("etiqueta") || compact.includes("caja")) {
      return "packingMaterialsInvoice";
    }
    if (compact.includes("guiaremision") || compact.includes("remision")) {
      if (
        compact.includes("interna") ||
        compact.includes("transformacion") ||
        (compact.includes("materiales") && !compact.includes("mp") && !compact.includes("materiaprima"))
      ) {
        return "internalPlantTransportGuide";
      }
      if (compact.includes("insumos") || compact.includes("etiquetas")) {
        return compact.includes("compra") || compact.includes("fruta")
          ? "rawMaterialTransportGuide"
          : "internalPlantTransportGuide";
      }
      return "rawMaterialTransportGuide";
    }
    if (
      compact.includes("factura") &&
      (compact.includes("export") ||
        (compact.includes("venta") && compact.includes("exportacion")))
    ) {
      return "commercialExportInvoice";
    }
    if (
      compact.includes("factura") &&
      (compact.includes("mp") ||
        compact.includes("materiaprima") ||
        compact.includes("compra") ||
        compact.includes("fruta") ||
        compact.includes("liquidacion"))
    ) {
      return "rawMaterialPurchaseInvoice";
    }
    if (compact.includes("factura") || compact.includes("invoice")) {
      return "rawMaterialPurchaseInvoice";
    }
  }
  return null;
}

type DocLike = {
  documentType?: string;
  description?: string;
  tradePdfClassification?: { detectedType?: string };
  peruDrawbackClassification?: { detectedType?: string; processStage?: number; documentDateIso?: string };
};

function resolvedDetectedType(doc: DocLike, fileName: string, description?: string): string | undefined {
  return (
    doc.peruDrawbackClassification?.detectedType ||
    doc.tradePdfClassification?.detectedType ||
    doc.documentType ||
    inferDocumentTypeFromFileName(fileName) ||
    (description && description.length < 80 && !description.toLowerCase().endsWith(".pdf")
      ? description
      : undefined)
  );
}

function resolveDrawbackRequirementForDoc(
  doc: DocLike,
  fileName: string,
  description?: string,
): DrawbackRequirementId | null {
  const detectedType = resolvedDetectedType(doc, fileName, description);
  return matchDrawbackRequirementId(detectedType, fileName, description);
}

function pushCollectedDoc(
  list: DrawbackCollectedDocument[],
  seenUrls: Set<string>,
  entry: DrawbackCollectedDocument,
) {
  if (!entry.url || seenUrls.has(entry.url)) return;
  seenUrls.add(entry.url);
  list.push(entry);
}

/**
 * Collect drawback-relevant documents from the whole deal: milestone attachments
 * and payment documents (deduped by URL).
 */
export function collectDrawbackDocuments(
  milestones: IMilestoneDetails[],
  payments: Payment[],
): DrawbackCollectedDocument[] {
  const results: DrawbackCollectedDocument[] = [];
  const seenUrls = new Set<string>();

  for (const payment of payments) {
    for (const doc of payment.paymentDocuments || []) {
      if (!doc.url) continue;
      const fileName = fileNameFromUrl(doc.url);
      const requirementId = resolveDrawbackRequirementForDoc(doc, fileName, doc.documentType);
      if (!requirementId) continue;

      const detectedType = resolvedDetectedType(doc as DocLike, fileName, doc.documentType);
      pushCollectedDoc(results, seenUrls, {
        id: `payment-${payment.id}-${doc.url}`,
        url: doc.url,
        label:
          detectedType && detectedType !== "Unknown" ? detectedType : doc.documentType || fileName,
        source: "payment",
        verifiedByAdmin: doc.verifiedByAdmin === true,
        detectedType,
        requirementId,
        processStage: doc.peruDrawbackClassification?.processStage,
        documentDateIso: doc.peruDrawbackClassification?.documentDateIso,
      });
    }
  }

  milestones.forEach((milestone) => {
    for (const doc of (milestone.docs || []) as MilestoneDoc[]) {
      if (!doc.url) continue;
      const fileName = doc.description?.trim() || fileNameFromUrl(doc.url);
      const requirementId = resolveDrawbackRequirementForDoc(doc, fileName, doc.description);
      if (!requirementId) continue;

      const detectedType = resolvedDetectedType(doc, fileName, doc.description);
      pushCollectedDoc(results, seenUrls, {
        id: `milestone-${doc.id}`,
        url: doc.url,
        label:
          detectedType && detectedType !== "Unknown"
            ? detectedType
            : doc.description?.trim() || fileNameFromUrl(doc.url),
        source: "milestone",
        verifiedByAdmin: doc.verifiedByAdmin === true,
        detectedType,
        requirementId,
        processStage: doc.peruDrawbackClassification?.processStage,
        documentDateIso: doc.peruDrawbackClassification?.documentDateIso,
      });
    }
  });

  return results;
}

export function buildDrawbackRequirementRows(
  documents: DrawbackCollectedDocument[],
): DrawbackRequirementRow[] {
  return DRAWBACK_REQUIREMENT_IDS.map((id) => {
    const matching = documents.filter((d) => d.requirementId === id);
    const verified = matching.find((d) => d.verifiedByAdmin);
    const pending = matching.find((d) => !d.verifiedByAdmin) ?? matching[0];

    if (verified) {
      return {
        id,
        status: "verified",
        documentUrl: verified.url,
        documentLabel: verified.label,
        onFile: true,
      };
    }
    if (pending) {
      return {
        id,
        status: "pending",
        documentUrl: pending.url,
        documentLabel: pending.label,
        onFile: true,
      };
    }
    return { id, status: "missing" };
  });
}

export function drawbackRequirementUploadDescription(requirementId: DrawbackRequirementId): string {
  return REQUIREMENT_HINTS[requirementId];
}

export type DrawbackValidationResult = {
  primaryDecision: "accepted" | "rejected" | "incomplete";
  finalDecision: "accepted" | "pending_admin" | "rejected";
  chronologyErrors: string[];
  rejectionCodes: DrawbackChronologyRejectionCode[];
  missingRequirementIds: DrawbackRequirementId[];
  /** True when dated docs are enough for early chronology rejection (2+ files). */
  hasEarlyChronologyEvidence: boolean;
  /** Phase gates + cross-phase checks (handoff decision tree). */
  findings: DrawbackFinding[];
  submitReady: boolean;
};

const REQUIRED_SLOT_SET = new Set<string>(DRAWBACK_REQUIRED_SLOTS);

export function evaluateDrawbackValidation(
  requirements: DrawbackRequirementRow[],
  documents: DrawbackCollectedDocument[],
  milestones: IMilestoneDetails[],
  payments: Payment[],
  fobValue = 0,
): DrawbackValidationResult {
  const missingRequirementIds = requirements
    .filter(
      (requirement) =>
        requirement.status === "missing" && REQUIRED_SLOT_SET.has(requirement.id),
    )
    .map((requirement) => requirement.id);

  const onFileSlots = new Set<DrawbackRequirementSlot>();
  for (const row of requirements) {
    if (row.status !== "missing" && REQUIRED_SLOT_SET.has(row.id)) {
      onFileSlots.add(row.id as DrawbackRequirementSlot);
    }
  }
  for (const doc of documents) {
    if (doc.requirementId) {
      onFileSlots.add(doc.requirementId);
    }
  }

  const chronologyDocs = collectDrawbackChronologyDocuments(milestones, payments);
  const chronology = evaluateDrawbackChronology(chronologyDocs);
  const chronologyErrors = chronology.errors;

  const tree = evaluateDrawbackDecisionTree({
    onFileSlots,
    missingRequiredSlots: missingRequirementIds as DrawbackRequirementSlot[],
    fobValue,
    chronology,
  });

  const primaryDecision =
    tree.hasHardStop || chronology.rejected
      ? "rejected"
      : tree.hasFail || missingRequirementIds.length > 0
        ? "incomplete"
        : "accepted";

  const hasAllVerified = requirements
    .filter((r) => REQUIRED_SLOT_SET.has(r.id))
    .every((requirement) => requirement.status === "verified");

  const finalDecision =
    primaryDecision === "rejected"
      ? "rejected"
      : primaryDecision === "accepted" && hasAllVerified
        ? "accepted"
        : "pending_admin";

  return {
    primaryDecision,
    finalDecision,
    chronologyErrors,
    rejectionCodes: chronology.codes,
    missingRequirementIds,
    hasEarlyChronologyEvidence: chronology.hasMinimalEvidence,
    findings: tree.findings,
    submitReady: tree.submitReady && hasAllVerified,
  };
}

export function resolveDrawbackUploadTarget(params: {
  isSupplier: boolean;
  dealCurrentMilestone?: MilestoneEnum;
  currentMilestone: MilestoneEnum;
  milestones: IMilestoneDetails[];
  payments: Payment[];
}): { kind: "payment"; paymentId: string } | { kind: "milestone"; milestoneId: string } | null {
  if (!params.isSupplier) return null;

  const eligiblePayment = params.payments.find(
    (p) =>
      p.status === PaymentStatus.InProgress ||
      p.status === PaymentStatus.VerifyingDocuments ||
      p.status === PaymentStatus.PaymentRequested,
  );
  if (eligiblePayment) {
    return { kind: "payment", paymentId: eligiblePayment.id };
  }

  const activeMilestone = params.milestones[params.currentMilestone];
  if (
    activeMilestone?.id &&
    params.dealCurrentMilestone === params.currentMilestone &&
    params.currentMilestone !== MilestoneEnum.M7
  ) {
    return { kind: "milestone", milestoneId: activeMilestone.id };
  }

  return null;
}
