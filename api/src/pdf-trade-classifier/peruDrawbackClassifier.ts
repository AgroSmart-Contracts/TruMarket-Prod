import {
  type ClassifiedPeruDrawbackType,
  PERU_DRAWBACK_DOCUMENT_TYPES,
  PERU_DRAWBACK_PROCESS_STAGE,
  type PeruDrawbackClassificationRule,
  PeruDrawbackDocumentType,
} from './peruDrawbackTypes';
import { parseTradeDocumentDate } from './trade-document-dates';

export const peruDrawbackDefaultRules: PeruDrawbackClassificationRule[] = [
  {
    type: PeruDrawbackDocumentType.CustomsDeclarationDAM,
    keywords: [
      'declaracion aduanera de mercancias',
      'declaración aduanera de mercancías',
      'declaracion aduanera de mercancias (a)',
      'declaración aduanera de mercancías (a)',
      'registro de aduana',
      'valor aduana',
      'partida nacional',
      'declaracion de mercancias',
      'declaración de mercancías',
      'dam ',
      ' dam',
      'dua ',
      ' dua',
      'documento aduanero',
      'partida arancelaria',
      'liquidacion de cobranza',
      'liquidación de cobranza',
      'declaracion unica de aduanas',
      'declaración única de aduanas',
      'exportacion definitiva',
      'exportación definitiva',
      'nº dua',
      'no dua',
    ],
  },
  {
    type: PeruDrawbackDocumentType.SwornDeclarationImportedInputs,
    keywords: [
      'declaracion jurada',
      'declaración jurada',
      'declaracion jurada de',
      'insumos importados',
      'insumo importado',
      'operacion de venta del insumo',
      'operación de venta del insumo',
      'dam de importacion',
      'dam de importación',
      'restitucion simplificado de derechos arancelarios',
      'restitución simplificado de derechos arancelarios',
      'mecanismos aduaneros suspensivos',
      'drawback',
      'suspension aduanera',
      'suspensión aduanera',
      'importacion temporal',
      'importación temporal',
      'consumo de insumos',
      'trazabilidad de insumos',
    ],
  },
  {
    type: PeruDrawbackDocumentType.RawMaterialTransportGuide,
    keywords: [
      'guia de remision electronica',
      'guía de remisión electrónica',
      'guia de remision remitente',
      'guía de remisión remitente',
      'gre remitente',
      'traslado por compras',
      'traslado por venta',
      'motivo de traslado',
      'punto de partida',
      'punto de llegada',
      'transporte de mercaderia',
      'transporte de mercadería',
      'traslado entre establecimientos',
      'remision remitente',
      'remisión remitente',
    ],
  },
  {
    type: PeruDrawbackDocumentType.InternalPlantTransportGuide,
    keywords: [
      'guia de remision por transformacion',
      'guía de remisión por transformación',
      'traslado entre almacenes',
      'movimiento interno',
      'traslado interno',
      'guia interna',
      'guía interna',
      'establecimiento de origen',
      'establecimiento de destino',
      'por transformacion',
      'por transformación',
    ],
  },
  {
    type: PeruDrawbackDocumentType.PlantProcessingMaquilaInvoice,
    keywords: [
      'servicio de empaque que comprende',
      'fabricacion de bienes por encargo',
      'fabricación de bienes por encargo',
      'maquila',
      'servicio de maquila',
      'procesamiento de fruta',
      'proceso de clasificacion',
      'proceso de clasificación',
      'servicio de encargo',
      'contrato de maquila',
      'transformacion de mercaderia',
      'transformación de mercadería',
      'servicio de empacado',
      'servicio de empaque',
      'clasificacion y empaque',
      'clasificación y empaque',
      'paletizado, etiquetado',
      'recepcion, seleccion, clasificacion',
      'recepción, selección, clasificación',
      'servicio de almacenaje',
      'almacenamiento en frio',
      'almacenamiento en frío',
    ],
  },
  {
    type: PeruDrawbackDocumentType.PackagingContract,
    keywords: [
      'contrato de servicio de produccion por encargo',
      'contrato de servicio de producción por encargo',
      'contrato de locacion de servicios',
      'contrato de locación de servicios',
      'contrato de prestacion de servicios',
      'contrato de prestación de servicios',
      'contrato de empaque',
      'contrato de acondicionamiento',
      'contrato de maquila',
      'produccion por encargo',
      'producción por encargo',
      'clausula',
      'cláusula',
      'partes contratantes',
      'objeto del contrato',
      'vigencia del contrato',
      'procesamiento de arandanos',
      'procesamiento de arándanos',
    ],
  },
  {
    type: PeruDrawbackDocumentType.PackingMaterialsInvoice,
    keywords: [
      'etiqueta termotransferencia',
      'caja generico p/arandanos',
      'caja genérico p/arándanos',
      'kartonplast',
      'clamshell 4.4 oz',
      'temptale ultra',
      'termoregistro',
      'materiales de empaque',
      'material de empaque',
      'cajas de carton',
      'cajas de cartón',
      'envases plasticos',
      'envases plásticos',
      'bandejas',
      'clamshell',
      'etiquetas adhesivas',
      'etiqueta adhesiva',
      'film stretch',
      'pallet',
      'tarima',
      'embalaje secundario',
      'insumos de empaque',
    ],
  },
  {
    type: PeruDrawbackDocumentType.CommercialExportInvoice,
    keywords: [
      'fresh blueberries',
      'origin peru',
      'air freight',
      'nos acogemos al drawback',
      'venta cpt',
      'factura de exportacion',
      'factura de exportación',
      'factura de venta de exportacion',
      'factura de venta de exportación',
      'commercial invoice',
      'invoice export',
      'export invoice',
      'consignatario',
      'consignee',
      'puerto de embarque',
      'puerto de destino',
      'pais de destino',
      'país de destino',
      'valor fob',
      'fob ',
      'peso neto exportado',
      'factura comercial',
    ],
  },
  {
    type: PeruDrawbackDocumentType.ExportTransportDocument,
    keywords: [
      'motivo de traslado : exportacion',
      'motivo de traslado : exportación',
      'traslado de arandanos para exportacion',
      'traslado de arándanos para exportación',
      'indicador de traslado total de la dam',
      'documentos relacionados: declaracion aduanera',
      'documentos relacionados: declaración aduanera',
      'guia de remision electronica remitente',
      'guía de remisión electrónica remitente',
      'guia de remision transportista',
      'guía de remisión transportista',
      'gre transportista',
      'gre remitente',
    ],
  },
  {
    type: PeruDrawbackDocumentType.ExportPackingList,
    keywords: [
      'packing list',
      'lista de empaque',
      'lista de embalaje',
      'packing-list',
      'detalle de bultos',
      'marcas y numeros',
      'marcas y números',
      'conteo de cajas',
      'peso bruto total',
      'peso neto total',
      'bultos',
    ],
  },
  {
    type: PeruDrawbackDocumentType.RawMaterialPurchaseInvoice,
    keywords: [
      'arandano fresco de exportacion variedad',
      'arándano fresco de exportación variedad',
      'kilogramo arandano',
      'kilogramo arándano',
      'factura de compra',
      'compra de arandanos',
      'compra de arándanos',
      'compra de materia prima',
      'compra de fruta',
      'liquidacion de compra',
      'liquidación de compra',
      'recibo por honorarios',
      'nota de credito',
      'nota de crédito',
      'proveedor de campo',
      'productor agricola',
      'productor agrícola',
      'venta interna',
      'factura electronica',
      'factura electrónica',
      'ruc del proveedor',
      'datos del comprador',
    ],
  },
];

/** Most specific phrases first — first matching rule wins. */
const peruDrawbackHighPriorityRules: PeruDrawbackClassificationRule[] = [
  {
    type: PeruDrawbackDocumentType.CommercialExportInvoice,
    keywords: [
      'factura de exportacion',
      'factura de exportación',
      'factura de venta de exportacion',
      'factura de venta de exportación',
      'export invoice',
      'commercial invoice',
      'pais de destino',
      'país de destino',
    ],
  },
  {
    type: PeruDrawbackDocumentType.PackagingContract,
    keywords: [
      'contrato de prestacion de servicios',
      'contrato de prestación de servicios',
      'contrato de empaque',
      'contrato de acondicionamiento',
      'partes contratantes',
      'objeto del contrato',
      'produccion por encargo',
      'producción por encargo',
    ],
  },
  {
    type: PeruDrawbackDocumentType.ExportTransportDocument,
    keywords: [
      'guia de remision electronica remitente',
      'guía de remisión electrónica remitente',
      'motivo de traslado: exportacion',
      'motivo de traslado: exportación',
      'motivo de traslado : exportacion',
      'motivo de traslado : exportación',
    ],
  },
  {
    type: PeruDrawbackDocumentType.SwornDeclarationImportedInputs,
    keywords: [
      'declaracion jurada',
      'declaración jurada',
      'declaracion jurada de',
      'insumos importados',
    ],
  },
  {
    type: PeruDrawbackDocumentType.CustomsDeclarationDAM,
    keywords: [
      'declaracion unica de aduanas',
      'declaración única de aduanas',
      'registro de aduana',
      'nº dua',
      'exportacion definitiva',
      'exportación definitiva',
    ],
  },
  {
    type: PeruDrawbackDocumentType.ExportPackingList,
    keywords: [
      'packing list',
      'lista de empaque',
      'lista de embalaje',
      'detalle de bultos',
    ],
  },
  {
    type: PeruDrawbackDocumentType.InternalPlantTransportGuide,
    keywords: [
      'guia de remision por transformacion',
      'guía de remisión por transformación',
      'traslado interno',
      'movimiento interno',
    ],
  },
  {
    type: PeruDrawbackDocumentType.RawMaterialTransportGuide,
    keywords: [
      'guia de remision electronica',
      'guía de remisión electrónica',
      'guia de remision remitente',
      'guía de remisión remitente',
      'gre remitente',
    ],
  },
  {
    type: PeruDrawbackDocumentType.PackagingContract,
    keywords: [
      'contrato de prestacion de servicios',
      'contrato de prestación de servicios',
      'partes contratantes',
    ],
  },
  {
    type: PeruDrawbackDocumentType.PlantProcessingMaquilaInvoice,
    keywords: [
      'maquila',
      'servicio de maquila',
      'servicio de encargo',
      'clasificacion y empaque',
      'clasificación y empaque',
    ],
  },
  {
    type: PeruDrawbackDocumentType.PackingMaterialsInvoice,
    keywords: [
      'materiales de empaque',
      'clamshell',
      'etiquetas adhesivas',
      'cajas de carton',
      'cajas de cartón',
    ],
  },
  {
    type: PeruDrawbackDocumentType.CommercialExportInvoice,
    keywords: [
      'factura de exportacion',
      'factura de exportación',
      'export invoice',
      'commercial invoice',
      'pais de destino',
      'país de destino',
    ],
  },
  {
    type: PeruDrawbackDocumentType.RawMaterialPurchaseInvoice,
    keywords: [
      'compra de materia prima',
      'compra de arandanos',
      'compra de arándanos',
      'liquidacion de compra',
      'liquidación de compra',
      'factura de compra',
    ],
  },
];

const peruDrawbackFilenameHints: Record<PeruDrawbackDocumentType, string[]> = {
  [PeruDrawbackDocumentType.CustomsDeclarationDAM]: [
    'dam',
    'dua',
    'aduan',
    'sad',
  ],
  [PeruDrawbackDocumentType.SwornDeclarationImportedInputs]: [
    'declaracionjurada',
    'dj',
    'insumos',
  ],
  [PeruDrawbackDocumentType.RawMaterialPurchaseInvoice]: [
    'compra',
    'liquidacion',
    'facturacompra',
  ],
  [PeruDrawbackDocumentType.RawMaterialTransportGuide]: [
    'gre',
    'guiaremision',
    'remision',
    'grr',
  ],
  [PeruDrawbackDocumentType.PlantProcessingMaquilaInvoice]: [
    'maquila',
    'proceso',
    'servicio',
  ],
  [PeruDrawbackDocumentType.PackingMaterialsInvoice]: [
    'empaque',
    'embalaje',
    'cajas',
    'etiqueta',
    'facturaetiquetas',
  ],
  [PeruDrawbackDocumentType.PackagingContract]: ['contrato', 'contratoempaque'],
  [PeruDrawbackDocumentType.InternalPlantTransportGuide]: [
    'interno',
    'transformacion',
    'almacen',
    'guiamateriales',
    'remisionmateriales',
    'guiaetiquetas',
    'etiquetas',
  ],
  [PeruDrawbackDocumentType.CommercialExportInvoice]: [
    'export',
    'fexport',
    'facturaexp',
    'venta',
  ],
  [PeruDrawbackDocumentType.ExportTransportDocument]: [
    'gre',
    'guiaremision',
    'grer',
    'export',
  ],
  [PeruDrawbackDocumentType.ExportPackingList]: [
    'packing',
    'pl',
    'listaempaque',
  ],
};

export type PeruDrawbackClassificationOptions = {
  filePath?: string;
};

export type PeruDrawbackClassificationResult = {
  type: ClassifiedPeruDrawbackType;
  score: number;
  matchedKeywords: string[];
  /** Packing box/count hint for label/packing validation (if detectable). */
  boxCount?: number | null;
  /** Suggested stage in drawback chain (1 procurement … 5 sworn/application). */
  processStage?: 1 | 2 | 3 | 4 | 5;
  /** Best-effort parsed date from the PDF text for chronology validations. */
  documentDateIso?: string;
};

type ClassificationCandidate = {
  type: ClassifiedPeruDrawbackType;
  score: number;
  matchedKeywords: string[];
};

export function classifyPeruDrawbackByKeywords(
  text: string,
  rules: PeruDrawbackClassificationRule[] = peruDrawbackDefaultRules,
  options?: PeruDrawbackClassificationOptions,
): PeruDrawbackClassificationResult {
  const normalized = text.toLowerCase();
  const rawFilePath = options?.filePath ?? '';
  const fileNameOnly = rawFilePath.split(/[\\/]/).pop() ?? '';
  const compactFileName = fileNameOnly.toLowerCase().replace(/[^a-z0-9]/g, '');

  const candidates: ClassificationCandidate[] =
    collectContentStructureCandidates(normalized);

  for (const rule of peruDrawbackHighPriorityRules) {
    const matches = rule.keywords.filter((keyword) =>
      normalized.includes(keyword.toLowerCase()),
    );
    if (matches.length === 0) continue;
    if (!passesKeywordRuleGuards(rule.type, normalized)) continue;
    candidates.push({
      type: rule.type,
      score: matches.length + 2,
      matchedKeywords: matches,
    });
  }

  for (const rule of rules) {
    const matches = rule.keywords.filter((keyword) =>
      normalized.includes(keyword.toLowerCase()),
    );
    if (matches.length === 0) continue;
    if (!passesKeywordRuleGuards(rule.type, normalized)) continue;
    candidates.push({
      type: rule.type,
      score: matches.length,
      matchedKeywords: matches,
    });
  }

  if (looksLikeDamFilename(compactFileName)) {
    candidates.push({
      type: PeruDrawbackDocumentType.CustomsDeclarationDAM,
      score: 1,
      matchedKeywords: ['filename:dam-weak'],
    });
  }

  let best: ClassificationCandidate = {
    type: 'Unknown',
    score: 0,
    matchedKeywords: [],
  };
  for (const candidate of candidates) {
    if (candidate.score > best.score) {
      best = candidate;
    }
  }

  if (
    best.score === 0 &&
    compactFileName.length > 0 &&
    !looksLikeSunatElectronicDocFilename(compactFileName)
  ) {
    for (const [type, hints] of Object.entries(
      peruDrawbackFilenameHints,
    ) as Array<[PeruDrawbackDocumentType, string[]]>) {
      const hintMatches = hints.filter((hint) =>
        compactFileName.includes(hint),
      );
      if (hintMatches.length > 0) {
        return finalizeResult(
          type,
          1,
          hintMatches.map((value) => `filename:${value}`),
          normalized,
        );
      }
    }
  }

  return finalizeResult(
    best.type,
    best.score,
    best.matchedKeywords,
    normalized,
  );
}

/** Body-structure detectors (Israel 4 corpus) — scored above generic keyword hits. */
function collectContentStructureCandidates(
  text: string,
): ClassificationCandidate[] {
  const out: ClassificationCandidate[] = [];

  if (looksLikeDamForm(text)) {
    out.push({
      type: PeruDrawbackDocumentType.CustomsDeclarationDAM,
      score: 20,
      matchedKeywords: ['body:dam-form'],
    });
  }
  if (looksLikeSwornDeclarationImportedInputs(text)) {
    out.push({
      type: PeruDrawbackDocumentType.SwornDeclarationImportedInputs,
      score: 18,
      matchedKeywords: ['body:declaracion-jurada-insumos'],
    });
  }
  if (looksLikePackagingContract(text)) {
    out.push({
      type: PeruDrawbackDocumentType.PackagingContract,
      score: 17,
      matchedKeywords: ['body:packaging-contract'],
    });
  }
  if (looksLikeCommercialExportInvoice(text)) {
    out.push({
      type: PeruDrawbackDocumentType.CommercialExportInvoice,
      score: 16,
      matchedKeywords: ['body:export-invoice'],
    });
  }
  if (looksLikePlantMaquilaInvoice(text)) {
    out.push({
      type: PeruDrawbackDocumentType.PlantProcessingMaquilaInvoice,
      score: 15,
      matchedKeywords: ['body:maquila-invoice'],
    });
  }
  if (looksLikePackingMaterialsInvoice(text)) {
    out.push({
      type: PeruDrawbackDocumentType.PackingMaterialsInvoice,
      score: 14,
      matchedKeywords: ['body:packing-materials-invoice'],
    });
  }
  if (looksLikeRawMaterialPurchaseInvoice(text)) {
    out.push({
      type: PeruDrawbackDocumentType.RawMaterialPurchaseInvoice,
      score: 14,
      matchedKeywords: ['body:purchase-invoice'],
    });
  }
  if (looksLikeExportGre(text)) {
    out.push({
      type: PeruDrawbackDocumentType.ExportTransportDocument,
      score: 13,
      matchedKeywords: ['body:export-gre'],
    });
  }
  if (looksLikeRawMaterialGre(text)) {
    out.push({
      type: PeruDrawbackDocumentType.RawMaterialTransportGuide,
      score: 12,
      matchedKeywords: ['body:raw-material-gre'],
    });
  }
  if (looksLikeInternalPlantGre(text)) {
    out.push({
      type: PeruDrawbackDocumentType.InternalPlantTransportGuide,
      score: 12,
      matchedKeywords: ['body:internal-plant-gre'],
    });
  }

  return out;
}

function passesKeywordRuleGuards(
  type: PeruDrawbackDocumentType,
  text: string,
): boolean {
  if (
    type === PeruDrawbackDocumentType.CustomsDeclarationDAM &&
    !looksLikeDamForm(text)
  ) {
    return false;
  }
  if (
    type === PeruDrawbackDocumentType.ExportTransportDocument &&
    !looksLikeExportGre(text)
  ) {
    return false;
  }
  if (
    type === PeruDrawbackDocumentType.RawMaterialTransportGuide &&
    looksLikeExportGre(text)
  ) {
    return false;
  }
  if (
    type === PeruDrawbackDocumentType.RawMaterialTransportGuide &&
    looksLikeInternalPlantGre(text)
  ) {
    return false;
  }
  if (isInvoicePrimaryDocument(text) && isGreOnlyRuleType(type)) {
    return false;
  }
  if (
    type === PeruDrawbackDocumentType.CommercialExportInvoice &&
    hasMaquilaInvoiceBodyMarkers(text)
  ) {
    return false;
  }
  if (
    type === PeruDrawbackDocumentType.RawMaterialPurchaseInvoice &&
    (hasExportInvoiceBodyMarkers(text) ||
      hasPackingMaterialsBodyMarkers(text) ||
      hasMaquilaInvoiceBodyMarkers(text))
  ) {
    return false;
  }
  if (
    type === PeruDrawbackDocumentType.RawMaterialPurchaseInvoice &&
    isInvoicePrimaryDocument(text) &&
    !hasRawMaterialPurchaseBodyMarkers(text) &&
    !/kilogramo ar[aá]ndano|ar[aá]ndano fresco/.test(text)
  ) {
    return false;
  }
  if (
    type === PeruDrawbackDocumentType.PackingMaterialsInvoice &&
    looksLikeSwornDeclarationImportedInputs(text)
  ) {
    return false;
  }
  if (
    type === PeruDrawbackDocumentType.PlantProcessingMaquilaInvoice &&
    looksLikePackagingContract(text)
  ) {
    return false;
  }
  if (
    type === PeruDrawbackDocumentType.ExportPackingList &&
    looksLikeDamForm(text)
  ) {
    return false;
  }
  return true;
}

/** SUNAT electronic doc codes (RUC-serie-correlativo) — type must come from PDF body, not filename. */
function looksLikeSunatElectronicDocFilename(compactFileName: string): boolean {
  if (compactFileName.length < 14) return false;
  return (
    /^\d{11}\d{2}[a-z]\d{3}\d{5,}$/i.test(compactFileName) ||
    /^\d{11}-\d{2}-[a-z]\d{3}-\d+$/i.test(
      compactFileName.replace(/[^a-z0-9-]/gi, ''),
    ) ||
    /\d{11}01f\d{3}\d{6,}/i.test(compactFileName)
  );
}

function looksLikeDamFilename(compactFileName: string): boolean {
  if (looksLikeSunatElectronicDocFilename(compactFileName)) return false;
  return (
    compactFileName.startsWith('nrodam') ||
    compactFileName.includes('nrodam') ||
    /^dam\d/.test(compactFileName) ||
    /^dua\d/.test(compactFileName) ||
    /^dua[a-z]?\d{1,6}$/.test(compactFileName)
  );
}

function isInvoicePrimaryDocument(text: string): boolean {
  const head = text.slice(0, 1200);
  return /factura electr[oó]nica|factura electronica/.test(head);
}

function isGrePrimaryDocument(text: string): boolean {
  const head = text.slice(0, 800);
  return /gu[ií]a de remisi[oó]n/.test(head);
}

function normalizeAddressToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function sameOriginAndDestination(text: string): boolean {
  const partida =
    text.match(/punto de partida[:\s]*([^\n]+)/i)?.[1] ??
    text.match(/punto de partida\s+([^\n]+?)\s+punto de llegada/i)?.[1];
  const llegada = text.match(/punto de llegada[:\s]*([^\n]+)/i)?.[1];
  if (!partida || !llegada) return false;
  const a = normalizeAddressToken(partida);
  const b = normalizeAddressToken(llegada);
  if (a.length < 12 || b.length < 12) return false;
  return a === b || a.includes(b.slice(0, 24)) || b.includes(a.slice(0, 24));
}

/**
 * SUNAT DUA (Declaración Única de Aduanas) — export customs declaration; same drawback slot as DAM.
 */
function looksLikeDuaExportDeclaration(text: string): boolean {
  if (isGrePrimaryDocument(text)) return false;
  if (!/declaraci[oó]n\s+[uú]nica\s+de\s+aduanas/.test(text)) return false;
  return (
    /registro de aduana/.test(text) &&
    (/n[oº°\u00ba]?\s*dua\b|n[uú]mero\s+dua|n[oº]\s*declaraci[oó]n\s*:/i.test(
      text,
    ) ||
      /exportaci[oó]n\s+definitiva|tipo\s+despacho|importador\/exportador/.test(
        text,
      ))
  );
}

/** SUNAT DAM form — not a GRE that merely cites a DAM number in "documentos relacionados". */
function looksLikeDamForm(text: string): boolean {
  if (
    isGrePrimaryDocument(text) &&
    /documentos relacionados:.*declaraci[oó]n aduanera|motivo de traslado[\s:]*exportaci[oó]n/.test(
      text,
    )
  ) {
    return false;
  }
  if (/declaraci[oó]n aduanera de mercanc[ií]as\s*\(\s*a\s*\)/.test(text))
    return true;
  if (looksLikeDuaExportDeclaration(text)) return true;
  return (
    /declaraci[oó]n aduanera de mercanc[ií]as/.test(text) &&
    /registro de aduana|valor aduana|partida nacional|declaraci[oó]n de mercanc[ií]as/.test(
      text,
    ) &&
    !isGrePrimaryDocument(text)
  );
}

function looksLikeSwornDeclarationImportedInputs(text: string): boolean {
  if (!/declaraci[oó]n jurada/.test(text)) return false;
  return /operaci[oó]n de venta del insumo|dam de importaci[oó]n|insumos importados|insumo importado|mecanismos aduaneros suspensivos|restituci[oó]n simplificado de derechos/.test(
    text,
  );
}

function looksLikePackagingContract(text: string): boolean {
  if (
    /contrato de (servicio de )?producci[oó]n por encargo|contrato de locaci[oó]n de servicios/.test(
      text,
    )
  ) {
    return true;
  }
  return (
    /contrato de prestaci[oó]n de servicios|objeto del contrato|partes contratantes/.test(
      text,
    ) &&
    /producci[oó]n por encargo|procesamiento de (fruta|ar[aá]ndano)/.test(text)
  );
}

function hasExportInvoiceBodyMarkers(text: string): boolean {
  return (
    /factura de venta de exportaci[oó]n/.test(text) ||
    /fresh blueberries|origin peru|air freight|awb \d|nos acogemos al drawback|venta cpt/.test(
      text,
    )
  );
}

function hasMaquilaInvoiceBodyMarkers(text: string): boolean {
  return /servicio de empaque que comprende|fabricaci[oó]n de bienes por encargo|paletizado, etiquetado, almacenaje/.test(
    text,
  );
}

function hasPackingMaterialsBodyMarkers(text: string): boolean {
  if (
    /clamshell|etiqueta termotransferencia|caja generico p\/ar[aá]ndano|kartonplast|temptale|termoregistro/.test(
      text,
    )
  ) {
    return true;
  }
  if (/reetiquetad|servicio de reetiquetad/.test(text)) return true;
  if (
    isInvoicePrimaryDocument(text) &&
    /\betiquetas?\b/.test(text) &&
    !/servicio de empaque que comprende|etiquetado, almacenaje/.test(text) &&
    !/ar[aá]ndano fresco de exportaci[oó]n variedad/.test(text)
  ) {
    return true;
  }
  return false;
}

function hasRawMaterialPurchaseBodyMarkers(text: string): boolean {
  return (
    /ar[aá]ndano fresco de exportaci[oó]n variedad/.test(text) ||
    /compra de (materia prima|fruta|ar[aá]ndano)|liquidaci[oó]n de compra/.test(
      text,
    )
  );
}

function looksLikeCommercialExportInvoice(text: string): boolean {
  if (
    !isInvoicePrimaryDocument(text) &&
    !/factura de venta de exportaci[oó]n/.test(text)
  ) {
    return false;
  }
  if (
    hasMaquilaInvoiceBodyMarkers(text) ||
    hasPackingMaterialsBodyMarkers(text)
  )
    return false;
  return hasExportInvoiceBodyMarkers(text);
}

function looksLikePlantMaquilaInvoice(text: string): boolean {
  if (!isInvoicePrimaryDocument(text)) return false;
  return hasMaquilaInvoiceBodyMarkers(text);
}

function looksLikePackingMaterialsInvoice(text: string): boolean {
  if (!isInvoicePrimaryDocument(text)) return false;
  if (hasMaquilaInvoiceBodyMarkers(text) || hasExportInvoiceBodyMarkers(text))
    return false;
  return hasPackingMaterialsBodyMarkers(text);
}

function looksLikeRawMaterialPurchaseInvoice(text: string): boolean {
  if (!isInvoicePrimaryDocument(text)) return false;
  if (
    hasExportInvoiceBodyMarkers(text) ||
    hasPackingMaterialsBodyMarkers(text) ||
    hasMaquilaInvoiceBodyMarkers(text)
  ) {
    return false;
  }
  return hasRawMaterialPurchaseBodyMarkers(text);
}

/** GRE remitente — farm/producer to plant (motivo venta + fresh fruit lines). */
function looksLikeRawMaterialGre(text: string): boolean {
  if (!isGrePrimaryDocument(text)) return false;
  if (looksLikeExportGre(text)) return false;
  if (looksLikeInternalPlantGre(text)) return false;
  const hasGre =
    /gu[ií]a de remisi[oó]n electr[oó]nica remitente|gu[ií]a de remisi[oó]n.*remitente/.test(
      text,
    );
  if (!hasGre) return false;
  if (/motivo de traslado[\s:]*exportaci[oó]n/.test(text)) return false;
  if (
    /motivo de traslado[\s:]*venta/.test(text) &&
    /ar[aá]ndano fresco de exportaci[oó]n/.test(text)
  ) {
    return true;
  }
  return (
    /documentos relacionados:.*factura n/.test(text) &&
    /ar[aá]ndano fresco/.test(text)
  );
}

/** GRE remitente for export shipment (motivo Exportación / DAM link). */
function looksLikeExportGre(text: string): boolean {
  if (!isGrePrimaryDocument(text)) return false;
  if (looksLikeInternalPlantGre(text)) return false;
  const hasGre =
    /gu[ií]a de remisi[oó]n/.test(text) &&
    (/remitente|electr[oó]nica/.test(text) || /\bgre\b/.test(text));
  if (!hasGre) return false;
  if (/motivo de traslado[\s:]*exportaci[oó]n/.test(text)) return true;
  if (/traslado de ar[aá]ndanos para exportaci[oó]n/.test(text)) return true;
  if (
    /documentos relacionados:.*declaraci[oó]n aduanera/.test(text) &&
    /indicador de traslado total de la dam/.test(text)
  ) {
    return true;
  }
  return false;
}

/** Internal plant movement of packing inputs (same origin/destination or T001 carrier GRE with materials). */
function looksLikeInternalPlantGre(text: string): boolean {
  if (!/gu[ií]a de remisi[oó]n/.test(text)) return false;
  if (/motivo de traslado[\s:]*exportaci[oó]n/.test(text)) return false;
  if (sameOriginAndDestination(text)) {
    if (/clamshell|etiqueta termotransferencia|caja generico/.test(text))
      return true;
    if (/motivo del traslado:\s*01\s*-\s*venta/.test(text)) return true;
  }
  if (
    /gu[ií]a de remisi[oó]n electr[oó]nica\s+t001/.test(text) &&
    /clamshell|etiqueta termotransferencia/.test(text)
  ) {
    return true;
  }
  return /por transformaci[oó]n|traslado interno|movimiento interno|entre almacenes/.test(
    text,
  );
}

function isGreOnlyRuleType(type: PeruDrawbackDocumentType): boolean {
  return (
    type === PeruDrawbackDocumentType.RawMaterialTransportGuide ||
    type === PeruDrawbackDocumentType.ExportTransportDocument
  );
}

function finalizeResult(
  type: ClassifiedPeruDrawbackType,
  score: number,
  matchedKeywords: string[],
  normalizedText?: string,
): PeruDrawbackClassificationResult {
  const documentDateIso = normalizedText
    ? pickPrimaryPeruDrawbackDocumentDateIso(normalizedText)
    : undefined;
  if (type === 'Unknown') {
    return {
      type,
      score,
      matchedKeywords,
      ...(documentDateIso ? { documentDateIso } : {}),
    };
  }
  return {
    type,
    score,
    matchedKeywords,
    processStage: PERU_DRAWBACK_PROCESS_STAGE[type],
    ...(documentDateIso ? { documentDateIso } : {}),
  };
}

export function listPeruDrawbackDocumentTypes(): readonly PeruDrawbackDocumentType[] {
  return PERU_DRAWBACK_DOCUMENT_TYPES;
}

/** Prefer structured invoice/issue date over scanning all numeric dates in the PDF body. */
export function mergePeruDrawbackDocumentDateIso(
  textIso: string | undefined,
  invoiceDate?: string | null,
  issueDate?: string | null,
): string | undefined {
  const fromInvoice = invoiceDate
    ? parseTradeDocumentDate(invoiceDate)
    : undefined;
  const fromIssue = issueDate ? parseTradeDocumentDate(issueDate) : undefined;
  return fromInvoice || fromIssue || textIso;
}

function pickPrimaryPeruDrawbackDocumentDateIso(
  text: string,
): string | undefined {
  const candidates = collectDateCandidates(text);
  let earliest: string | undefined;
  for (const candidate of candidates) {
    const parsed = parseTradeDocumentDate(candidate);
    if (!parsed) continue;
    if (!earliest || parsed < earliest) {
      earliest = parsed;
    }
  }
  return earliest;
}

function collectDateCandidates(text: string): string[] {
  const candidates = new Set<string>();
  const numericDates =
    text.match(/\b\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}\b/g) || [];
  for (const value of numericDates) {
    candidates.add(value);
  }

  const alphaDates =
    text.match(
      /\b\d{1,2}[\s./-](?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)[\s./-]\d{2,4}\b/gi,
    ) || [];
  for (const value of alphaDates) {
    candidates.add(value);
  }

  return Array.from(candidates);
}
