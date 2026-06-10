/**
 * Peru drawback validation — four-phase gates + cross-phase checks (dev handoff v1).
 * Platform flags and prevents; SUNAT decides. See drawback-decision-tree-dev-handoff.md.
 */

import type { DrawbackChronologyValidation } from 'src/lib/drawback-chronology';

export type DrawbackSeverity = 'hard_stop' | 'fail' | 'flag';

export type DrawbackPhase =
  | 'p1_imported_input'
  | 'p2_procurement'
  | 'p3_processing'
  | 'p4_export'
  | 'cross';

export type DrawbackFindingCode =
  | 'p1_no_sworn_declaration'
  | 'p1_dj_missing_material_invoice'
  | 'p1_dj_missing_material_transport'
  | 'p2_missing_main_product_gre'
  | 'p3_missing_packaging_contract'
  | 'p3_missing_maquila_invoice'
  | 'p4_missing_dam'
  | 'p4_missing_export_invoice'
  | 'p4_missing_export_gre'
  | 'p4_codigo_13_unverified'
  | 'x5_below_minimum_refund'
  | 'x1_chronology'
  | 'missing_required_document';

export type DrawbackFinding = {
  severity: DrawbackSeverity;
  code: DrawbackFindingCode;
  phase: DrawbackPhase;
  message: string;
};

/** Order for showing one actionable finding at a time (below-minimum is last). */
export const DRAWBACK_FINDING_DISPLAY_PRIORITY: DrawbackFindingCode[] = [
  'p1_no_sworn_declaration',
  'p1_dj_missing_material_invoice',
  'p1_dj_missing_material_transport',
  'p2_missing_main_product_gre',
  'p3_missing_packaging_contract',
  'p3_missing_maquila_invoice',
  'p4_missing_dam',
  'p4_missing_export_invoice',
  'p4_missing_export_gre',
  'missing_required_document',
  'x1_chronology',
  'p4_codigo_13_unverified',
  'x5_below_minimum_refund',
];

export function pickPrimaryDrawbackFinding(
  findings: DrawbackFinding[],
): DrawbackFinding | null {
  if (findings.length === 0) return null;
  const byCode = new Map(findings.map((f) => [f.code, f]));
  for (const code of DRAWBACK_FINDING_DISPLAY_PRIORITY) {
    const match = byCode.get(code);
    if (match) return match;
  }
  return findings[0] ?? null;
}

export type DrawbackRequirementSlot =
  | 'swornDeclarationImportedInputs'
  | 'rawMaterialPurchaseInvoice'
  | 'rawMaterialTransportGuide'
  | 'processingMaquilaInvoice'
  | 'packingMaterialsInvoice'
  | 'packagingContract'
  | 'internalPlantTransportGuide'
  | 'commercialExportInvoice'
  | 'exportTransportDocument'
  | 'customsDeclarationDam';

/** Blocking required slots per handoff (P1–P4). Optional: fruit purchase invoice, internal GRE, packing list. */
export const DRAWBACK_REQUIRED_SLOTS: DrawbackRequirementSlot[] = [
  'swornDeclarationImportedInputs',
  'rawMaterialTransportGuide',
  'packagingContract',
  'processingMaquilaInvoice',
  'customsDeclarationDam',
  'commercialExportInvoice',
  'exportTransportDocument',
];

/** P1 substantiation when DJ is present: material invoice + material movement. */

export const DRAWBACK_MIN_REFUND_USD = 500;
export const DRAWBACK_REFUND_RATE = 0.03;

export type DrawbackDecisionTreeInput = {
  /** Requirement id → on file (pending or verified). */
  onFileSlots: Set<DrawbackRequirementSlot>;
  missingRequiredSlots: DrawbackRequirementSlot[];
  fobValue: number;
  chronology: DrawbackChronologyValidation;
  /** Raw text snippets from classified DAM PDFs (when present). */
  damTextSamples?: string[];
};

export type DrawbackDecisionTreeResult = {
  findings: DrawbackFinding[];
  hasHardStop: boolean;
  hasFail: boolean;
  hasFlag: boolean;
  submitReady: boolean;
};

function finding(
  severity: DrawbackSeverity,
  code: DrawbackFindingCode,
  phase: DrawbackPhase,
  message: string,
): DrawbackFinding {
  return { severity, code, phase, message };
}

function slotOnFile(onFile: Set<DrawbackRequirementSlot>, slot: DrawbackRequirementSlot): boolean {
  return onFile.has(slot);
}

export function evaluateDrawbackDecisionTree(
  input: DrawbackDecisionTreeInput,
): DrawbackDecisionTreeResult {
  const findings: DrawbackFinding[] = [];
  const { onFileSlots, missingRequiredSlots, fobValue, chronology, damTextSamples = [] } = input;

  const refundUsd = Math.round(fobValue * DRAWBACK_REFUND_RATE);

  // —— Phase 1: imported input (eligibility gate) ——
  const hasDj = slotOnFile(onFileSlots, 'swornDeclarationImportedInputs');
  if (!hasDj) {
    findings.push(
      finding(
        'hard_stop',
        'p1_no_sworn_declaration',
        'p1_imported_input',
        'No sworn declaration (DJ) of imported inputs is on file.',
      ),
    );
  } else {
    if (!slotOnFile(onFileSlots, 'packingMaterialsInvoice')) {
      findings.push(
        finding(
          'fail',
          'p1_dj_missing_material_invoice',
          'p1_imported_input',
          'Upload the purchase invoice for the imported material declared on the sworn declaration (e.g. labels, clamshells).',
        ),
      );
    }
    if (!slotOnFile(onFileSlots, 'internalPlantTransportGuide')) {
      findings.push(
        finding(
          'fail',
          'p1_dj_missing_material_transport',
          'p1_imported_input',
          'Upload the transport guide (GRE) for the imported material declared on the sworn declaration.',
        ),
      );
    }
  }

  // —— Phase 2: procurement (main product movement) ——
  if (!slotOnFile(onFileSlots, 'rawMaterialTransportGuide')) {
    findings.push(
      finding(
        'fail',
        'p2_missing_main_product_gre',
        'p2_procurement',
        'Upload the transport guide (GRE) for the main product to the processing plant.',
      ),
    );
  }

  // —— Phase 3: processing ——
  if (!slotOnFile(onFileSlots, 'packagingContract')) {
    findings.push(
      finding(
        'fail',
        'p3_missing_packaging_contract',
        'p3_processing',
        'Upload the processing / maquila contract.',
      ),
    );
  }
  if (!slotOnFile(onFileSlots, 'processingMaquilaInvoice')) {
    findings.push(
      finding(
        'fail',
        'p3_missing_maquila_invoice',
        'p3_processing',
        'Upload the processing / maquila service invoice.',
      ),
    );
  }

  // —— Phase 4: export ——
  if (!slotOnFile(onFileSlots, 'customsDeclarationDam')) {
    findings.push(
      finding(
        'fail',
        'p4_missing_dam',
        'p4_export',
        'Upload the export customs declaration (DAM/DUA).',
      ),
    );
  } else {
    const damBlob = damTextSamples.join('\n').toLowerCase();
    const codigo13Hint =
      /c[oó]digo\s*13|cod\.?\s*13|restituci[oó]n|drawback|rs\s*381|r\.?\s*s\.?\s*381/.test(damBlob);
    if (damBlob.length > 80 && !codigo13Hint) {
      findings.push(
        finding(
          'flag',
          'p4_codigo_13_unverified',
          'p4_export',
          'DAM is on file but código 13 (drawback) could not be confirmed from the document text. Verify before submission.',
        ),
      );
    }
  }

  if (!slotOnFile(onFileSlots, 'commercialExportInvoice')) {
    findings.push(
      finding(
        'fail',
        'p4_missing_export_invoice',
        'p4_export',
        'Upload the commercial export invoice.',
      ),
    );
  }
  if (!slotOnFile(onFileSlots, 'exportTransportDocument')) {
    findings.push(
      finding(
        'fail',
        'p4_missing_export_gre',
        'p4_export',
        'Upload the export transport guide (GRE).',
      ),
    );
  }

  // —— Cross-phase ——
  if (chronology.rejected && chronology.errors.length > 0) {
    for (const err of chronology.errors) {
      findings.push(
        finding('fail', 'x1_chronology', 'cross', err),
      );
    }
  }

  if (refundUsd < DRAWBACK_MIN_REFUND_USD && fobValue > 0) {
    findings.push(
      finding(
        'hard_stop',
        'x5_below_minimum_refund',
        'cross',
        `Estimated refund (US$${refundUsd}) is below the US$${DRAWBACK_MIN_REFUND_USD} minimum for drawback.`,
      ),
    );
  }

  for (const slot of missingRequiredSlots) {
    if (DRAWBACK_REQUIRED_SLOTS.includes(slot)) {
      const already = findings.some(
        (f) => f.severity === 'fail' && f.message.toLowerCase().includes(slot.replace(/([A-Z])/g, ' $1')),
      );
      if (!already) {
        findings.push(
          finding(
            'fail',
            'missing_required_document',
            'cross',
            `Required document missing: ${slot}.`,
          ),
        );
      }
    }
  }

  const hasHardStop = findings.some((f) => f.severity === 'hard_stop');
  const hasFail = findings.some((f) => f.severity === 'fail');
  const hasFlag = findings.some((f) => f.severity === 'flag');
  const submitReady = !hasHardStop && !hasFail;

  return { findings, hasHardStop, hasFail, hasFlag, submitReady };
}
