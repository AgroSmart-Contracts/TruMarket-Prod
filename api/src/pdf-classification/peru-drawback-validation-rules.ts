/**
 * Static validation rule set for Peru drawback process pages (quantity chain,
 * materials vs export, chronology). Stored on upload responses so the UI can
 * reference a stable version without recomputing copy.
 */
export const PERU_DRAWBACK_VALIDATION_RULESET_ID = 'peru-agro-drawback-v1';

export type PeruDrawbackValidationRuleset = {
  id: string;
  version: number;
  summary: string;
  requiredDocumentCategories: readonly string[];
  quantityRules: {
    rawMaterialInputCeiling: string;
    exportMustNotExceedInput: string;
    lossIsAllowed: string;
    packagingMustAlignWithExport: string;
  };
  chronologyRules: {
    requiredSequence: readonly string[];
    coreRule: string;
    commonHighRiskErrors: readonly string[];
  };
  processStages: readonly {
    stage: number;
    name: string;
    description: string;
  }[];
};

export const PERU_DRAWBACK_VALIDATION_RULES: PeruDrawbackValidationRuleset = {
  id: PERU_DRAWBACK_VALIDATION_RULESET_ID,
  version: 1,
  summary:
    'Four-phase drawback pack: (1) imported input via sworn declaration + material docs, ' +
    '(2) main-product procurement, (3) processing contract + maquila, (4) export DAM + invoice + GRE. ' +
    'Platform flags issues before SUNAT submission.',
  requiredDocumentCategories: [
    'Raw material purchase invoice',
    'Raw material transport guide (to plant)',
    'Processing / maquila invoice',
    'Packing material invoices (boxes, labels, clamshells)',
    'Packaging / maquila contract',
    'Internal plant transport guides',
    'Commercial export invoice',
    'Export transport document (GRE)',
    'Export packing list',
    'Customs declaration (DAM/DUA/SAD)',
    'Sworn declaration of imported inputs',
  ],
  quantityRules: {
    rawMaterialInputCeiling:
      'Raw material purchased / received is the maximum mass in the chain; nothing can increase it.',
    exportMustNotExceedInput:
      'Exported net weight must be less than or equal to raw material input; export strictly greater than input is invalid.',
    lossIsAllowed:
      'Export less than input is normal (sorting, rejects, yield); the gap should be explainable as process loss.',
    packagingMustAlignWithExport:
      'Boxes, clamshells, labels, pallets consumed in the plant must align with what is exported (counts and ratios).',
  },
  chronologyRules: {
    requiredSequence: [
      'purchase',
      'transport_to_plant',
      'processing_packaging',
      'export',
    ],
    coreRule:
      'Dates and document issuance order must follow the physical flow: purchase → transport → processing → export.',
    commonHighRiskErrors: [
      'Export dated before purchase or before plant processing',
      'Transport guide issued after goods already shown as processed or exported',
      'Purchase invoice dated after export',
      'Processing records not aligned with physical movement dates',
    ],
  },
  processStages: [
    {
      stage: 1,
      name: 'Imported input (eligibility gate)',
      description:
        'Sworn declaration (DJ) + material purchase invoice + material transport GRE.',
    },
    {
      stage: 2,
      name: 'Procurement',
      description:
        'Main-product transport guide to plant (fruit purchase invoice optional).',
    },
    {
      stage: 3,
      name: 'Processing',
      description:
        'Maquila / packaging contract and processing service invoice.',
    },
    {
      stage: 4,
      name: 'Export',
      description:
        'DAM/DUA, commercial export invoice, export GRE (código 13 on DAM when applicable).',
    },
  ],
};
