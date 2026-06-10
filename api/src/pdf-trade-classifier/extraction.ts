import type { ClassifiedDocumentType, ParsedPdfResult } from './types';

type NullableString = string | null;
type NullableNumber = number | null;

export type CommonExtractedFields = {
  documentType: ClassifiedDocumentType;
  documentNumber: NullableString;
  issueDate: NullableString;
  exporterName: NullableString;
  exporterTaxId: NullableString;
  consigneeName: NullableString;
  consigneeTaxId: NullableString;
  originLocation: NullableString;
  destinationLocation: NullableString;
  containerNumber: NullableString;
  bookingNumber: NullableString;
  currency: NullableString;
  incoterm: NullableString;
  rawText: string;
  extractionQuality: 'high' | 'medium' | 'low';
  requiresOcr: boolean;
};

export type InvoiceFields = {
  invoiceNumber: NullableString;
  invoiceDate: NullableString;
  invoiceSubtotal: NullableNumber;
  invoiceTotal: NullableNumber;
  paymentTerms: NullableString;
};

export type BillOfLadingOrAwbFields = {
  billOfLadingNumber: NullableString;
  vesselName: NullableString;
  voyageNumber: NullableString;
  portOfLoading: NullableString;
  portOfDischarge: NullableString;
  placeOfReceipt: NullableString;
  shippedOnBoardDate: NullableString;
  ladenOnBoardDate: NullableString;
  blIssueDate: NullableString;
  dateOfDelivery: NullableString;
  estimatedArrivalDate: NullableString;
};

export type CertificateOfOriginFields = {
  certificateNumber: NullableString;
  issuingAuthority: NullableString;
  relatedInvoiceNumber: NullableString;
  relatedInvoiceDate: NullableString;
  netWeightKg: NullableNumber;
  grossWeightKg: NullableNumber;
  goodsDescription: NullableString;
};

export type PackingListFields = {
  packingListNumber: NullableString;
  productVariety: NullableString;
  brand: NullableString;
  category: NullableString;
  temperature: NullableString;
  packSize: NullableString;
  lineCount: number;
  boxCount: NullableNumber;
};

export type PhytosanitaryFields = {
  phytosanitaryCertificateNumber: NullableString;
  issuingPlantProtectionOrganization: NullableString;
  meansOfConveyance: NullableString;
  declaredPointOfEntry: NullableString;
};

export type ExtractedDocumentFields = {
  common: CommonExtractedFields;
  invoice?: InvoiceFields;
  billOfLadingOrAwb?: BillOfLadingOrAwbFields;
  certificateOfOrigin?: CertificateOfOriginFields;
  packingList?: PackingListFields;
  phytosanitaryCertificate?: PhytosanitaryFields;
};

/**
 * Extracts every section whose patterns match the PDF text, regardless of classified type.
 * Classification still labels `common.documentType` for UI; mapping merges all sections.
 */
export function extractStructuredFields(
  parsed: ParsedPdfResult,
  documentType: ClassifiedDocumentType,
): ExtractedDocumentFields {
  const text = parsed.text;
  const normalized = text.replace(/\s+/g, ' ').trim();

  const result: ExtractedDocumentFields = {
    common: buildCommonFields(normalized, documentType, text),
  };

  const invoice = extractInvoiceSection(normalized);
  if (hasSectionData(invoice)) result.invoice = invoice;

  const bl = extractBlSection(normalized);
  if (hasSectionData(bl)) result.billOfLadingOrAwb = bl;

  const co = extractCoSection(normalized);
  if (hasSectionData(co)) result.certificateOfOrigin = co;

  const packing = extractPackingSection(normalized);
  if (hasSectionData(packing)) result.packingList = packing;

  const phyto = extractPhytoSection(normalized);
  if (hasSectionData(phyto)) result.phytosanitaryCertificate = phyto;

  return result;
}

/** Reject BL boilerplate captured as a place name (e.g. "or the carrier"). */
function sanitizeLocationToken(
  value: string | null | undefined,
): string | null {
  const raw = value?.trim();
  if (!raw) return null;
  const upper = raw.toUpperCase();
  if (
    /^(OR THE|THE|AND|OF|TO|FROM|BY|SEA|ONLY|AGENT|CARRIER|MERCHANT|BOOKING)$/i.test(
      upper,
    ) ||
    /\bOR THE\b/.test(upper)
  ) {
    return null;
  }
  return raw;
}

function trimCompanyName(name: string | undefined): string | undefined {
  if (!name) return undefined;
  return name
    .split(/\s+(?:CALLE|CAL\.|NRO\.?|NR[ºo°]\.?|RUC\b|C\/)/i)[0]
    .trim();
}

function buildCommonFields(
  normalized: string,
  documentType: ClassifiedDocumentType,
  rawText: string,
): CommonExtractedFields {
  const exporterCandidates = [
    extract(normalized, /\b([A-Z][A-Z0-9\s\.\-&]{6,}?\s+S\.A\.C\.)\b/i, 1),
    extract(normalized, /\b(BIO FARMING PERU S\.A\.C\.)\b/i),
    extract(normalized, /\b(VM GLOBAL BROKERS[^,]{0,40})/i, 1),
    extractAfterLabel(normalized, /(?:EXPORTADOR|EXPORTER|SHIPPER)[:\s]+/i),
  ]
    .map((v) => trimCompanyName(v))
    .filter((v): v is string => !!v && isPlausibleCompanyName(v));

  const consigneeCandidates = [
    extract(normalized, /\b(ALBORAN[^,]{5,50})/i, 1),
    extract(
      normalized,
      /Señor\(es\)\s*:\s*([A-Z0-9\s\.\-&]{5,60}?)(?=\s+RUC|\s+País|$)/i,
      1,
    ),
    extract(normalized, /consignados a\s+([A-Z0-9\s\.\-&]{5,60})/i, 1),
    extractAfterLabel(normalized, /(?:IMPORTADOR|IMPORTER|CONSIGNEE)[:\s]+/i),
  ]
    .map((v) => trimCompanyName(v))
    .filter((v): v is string => !!v && isPlausibleCompanyName(v));

  return {
    documentType,
    documentNumber:
      extract(normalized, /\b(E\d{3}-\d+|COSU\d+|MEDU[A-Z0-9]+)/i) ??
      extract(normalized, /Certificado N[úu]mero[:\s]*([A-Z0-9-]+)/i, 1) ??
      extract(normalized, /Bill of Lading No\.?\s*([A-Z0-9]+)/i, 1) ??
      null,
    issueDate:
      extract(
        normalized,
        /(?:Fecha de Emisi[oó]n|Date of issue|Lima\s*,)\s*:?\s*([0-3]?\d[./-][01]?\d[./-]\d{2,4})/i,
        1,
      ) ??
      extract(
        normalized,
        /(?:Date of shipment|SHIPPED ON BOARD DATE|Fecha\s+de\s+embarque)[:\s]*([0-3]?\d[-/][A-Za-z]{3}[-/]\d{4})/i,
        1,
      ) ??
      extract(
        normalized,
        /(?:Date of shipment|SHIPPED ON BOARD DATE|Fecha\s+de\s+embarque)[:\s]*([0-3]?\d[./-][01]?\d[./-]\d{2,4})/i,
        1,
      ) ??
      extract(
        normalized,
        /(?:Date of shipment|SHIPPED ON BOARD DATE)[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
        1,
      ) ??
      null,
    exporterName: exporterCandidates[0] ?? null,
    exporterTaxId:
      extract(normalized, /\bRUC[:\s]*([0-9-]{8,15})/i, 1) ??
      extract(normalized, /\bNIF[:\s]*([A-Z0-9-]+)/i, 1) ??
      null,
    consigneeName: consigneeCandidates[0] ?? null,
    consigneeTaxId:
      extract(normalized, /\bRNC[:\s]*([0-9-]+)/i, 1) ??
      extract(normalized, /\bNIF[:\s]*([A-Z0-9-]+)/i, 1) ??
      null,
    originLocation:
      sanitizeLocationToken(
        extract(
          normalized,
          /(?:PORT OF LOADING|Port of Loading|Place of Receipt)[:\s]+([A-Za-z][A-Za-z\s]{1,24}?)(?=\s+BOOKING|\s+PORT|\s+Place|$)/i,
          1,
        ),
      ) ??
      sanitizeLocationToken(
        extract(normalized, /from\s+([A-Z][A-Z\s]+)\s+are/i, 1),
      ) ??
      sanitizeLocationToken(
        extract(
          normalized,
          /Port\s+o[f£]?\s*loading[^A-Z]{0,24}(?:By\s+Sea\s+)?([A-Za-z]+)(?:\s+PERU)?/i,
          1,
        ),
      ) ??
      (/\bCALLAO\b/i.test(normalized) ? 'CALLAO' : null) ??
      (/\bLIMA-?PERU\b/i.test(normalized) ? 'LIMA' : null) ??
      null,
    destinationLocation:
      sanitizeLocationToken(
        extract(
          normalized,
          /(?:Place of Delivery|Port of Discharge)\s+AGENT\s+([A-Za-z]+)/i,
          1,
        ),
      ) ??
      sanitizeLocationToken(
        extract(
          normalized,
          /Place of Delivery[:\s]+([A-Za-z]+)(?:,\s*[A-Z]{2}\b)?/i,
          1,
        ),
      ) ??
      sanitizeLocationToken(
        extract(
          normalized,
          /towards\s+([A-Za-z][A-Za-z\s]+?)(?=\s+by|\s+the|$)/i,
          1,
        ),
      ) ??
      sanitizeLocationToken(
        extract(
          normalized,
          /Port\s+o[f£]?\s*discharge[^A-Z]{0,24}(?:By\s+Sea\s+)?([A-Za-z]+)(?:\s*-\s*NETHERLANDS)?/i,
          1,
        ),
      ) ??
      (/\bCAUCEDO\b/i.test(normalized) ? 'CAUCEDO' : null) ??
      (/\bROTTERDAM\b/i.test(normalized) ? 'ROTTERDAM' : null) ??
      null,
    containerNumber:
      extract(normalized, /\bCONTAINER[:\s]*([A-Z]{4}\d{7})\b/i, 1) ??
      extract(normalized, /\b([A-Z]{4}\d{7})\b/, 1) ??
      null,
    bookingNumber:
      extract(normalized, /\bBooking No\.?\s*([0-9]+)/i, 1) ??
      extract(normalized, /\bBK[:\s]*([0-9 ]{6,})/i, 1)?.replace(/\s+/g, '') ??
      null,
    currency:
      extract(normalized, /\b(DOLAR AMERICANO|USD|US\$|EUR)\b/i) ?? null,
    incoterm: extract(normalized, /\b(FOB|CIF|CFR|EXW|FCA|DAP|DDP)\b/i) ?? null,
    rawText,
    extractionQuality: getExtractionQuality(normalized),
    requiresOcr: normalized.length < 80,
  };
}

function extractInvoiceSection(normalized: string): InvoiceFields {
  return {
    invoiceNumber: extract(normalized, /\b(E\d{3}-\d+)\b/i, 1) ?? null,
    invoiceDate:
      extract(
        normalized,
        /(?:Fecha(?:\s+de\s+Emisi[oó]n)?|Date(?:\s+of\s+issue)?)[:\s]+([0-3]?\d[./-][01]?\d[./-]\d{2,4})/i,
        1,
      ) ??
      extract(
        normalized,
        /(?:Fecha|Date)[:\s]+([0-3]?\d[./-][01]?\d[./-]\d{2,4})/i,
        1,
      ) ??
      null,
    invoiceSubtotal: parseMoney(
      extract(
        normalized,
        /Sub Total Ventas\s*:\s*\$?\s*([0-9,]+(?:\.[0-9]+)?)/i,
        1,
      ),
    ),
    invoiceTotal: parseMoney(
      extract(
        normalized,
        /(?:Importe Total|Total Amount|Invoice Total)\s*:\s*\$?\s*([0-9,]+(?:\.[0-9]+)?)/i,
        1,
      ),
    ),
    paymentTerms:
      extract(
        normalized,
        /(?:Forma de pago|Payment terms?)\s*:\s*([A-Za-zÁÉÍÓÚáéíóú\s]+)/i,
        1,
      ) ?? null,
  };
}

function extractBlSection(normalized: string): BillOfLadingOrAwbFields {
  const hasBlSignals =
    /\b(bill of lading|sea waybill|conocimiento de embarque|port of loading|port of discharge|shipped on board)\b/i.test(
      normalized,
    );

  if (!hasBlSignals) {
    return emptyBl();
  }

  const bl: BillOfLadingOrAwbFields = {
    billOfLadingNumber:
      extract(
        normalized,
        /(?:Bill of Lading|B\/L|Waybill)\s+No\.?\s*([A-Z0-9]+)/i,
        1,
      ) ??
      extract(normalized, /\b(COSU\d+|MEDU[A-Z0-9]+)\b/i, 1) ??
      null,
    vesselName:
      extract(
        normalized,
        /Ocean Vessel[^A-Z0-9]*([A-Z][A-Z\s]{2,30}?)(?=\s+[0-9A-Z]{5,}|\s+Voyage|$)/i,
        1,
      ) ?? null,
    voyageNumber: extract(normalized, /Voyage No\.?\s*([A-Z0-9]+)/i, 1) ?? null,
    portOfLoading:
      extract(
        normalized,
        /PORT OF LOADING[:\s]+([A-Za-z][A-Za-z\s]{1,20}?)(?=\s+BOOKING|\s+PORT OF DISCHARGE|$)/i,
        1,
      ) ??
      extract(
        normalized,
        /Port of Loading[:\s]+([A-Za-z][A-Za-z\s]{1,20}?)(?=\s+Port of Discharge|\s+BOOKING|$)/i,
        1,
      ) ??
      extract(
        normalized,
        /Place of Receipt[:\s]+([A-Za-z][A-Za-z\s,]{2,30}?)(?=\s+Port|\s+Ocean|$)/i,
        1,
      ) ??
      (/\bCALLAO\b/i.test(normalized) && /\bPORT OF LOADING\b/i.test(normalized)
        ? 'CALLAO'
        : null) ??
      null,
    portOfDischarge:
      extract(normalized, /Port of Discharge\s+AGENT\s+([A-Za-z]+)/i, 1) ??
      extract(
        normalized,
        /PORT OF DISCHARGE[:\s]+([A-Za-z][A-Za-z\s]{1,20}?)(?=\s+PORT OF LOADING|\s+BOOKING|$)/i,
        1,
      ) ??
      extract(
        normalized,
        /Port of Discharge[:\s]+([A-Za-z][A-Za-z\s]{1,20}?)(?=\s+Port of Loading|\s+Place|$)/i,
        1,
      ) ??
      (/\bROTTERDAM\b/i.test(normalized) ? 'ROTTERDAM' : null) ??
      null,
    placeOfReceipt:
      extract(
        normalized,
        /Place of Receipt[:\s]+([A-Za-z][A-Za-z,\s]{2,40}?)(?=\s+Port|\s+Ocean|$)/i,
        1,
      ) ?? null,
    shippedOnBoardDate:
      extract(
        normalized,
        /SHIPPED ON BOARD DATE[:\s]*([0-3]?\d[-/][A-Za-z]{3}[-/]\d{4})/i,
        1,
      ) ??
      extract(
        normalized,
        /SHIPPED ON BOARD DATE[:\s]*([0-3]?\d[./-][01]?\d[./-]\d{2,4})/i,
        1,
      ) ??
      extract(
        normalized,
        /(?:Date of shipment|Fecha\s+de\s+embarque|Embarcado)[:\s]*([0-3]?\d[./-][01]?\d[./-]\d{2,4})/i,
        1,
      ) ??
      extract(
        normalized,
        /(?:ETD|Estimated\s+Time\s+of\s+Departure)[:\s]*([0-3]?\d[./-][01]?\d[./-]\d{2,4})/i,
        1,
      ) ??
      extract(
        normalized,
        /(?:SHIPPED ON BOARD|Laden on Board|on\s+board)[^.]{0,50}?([0-3]?\d[./-][01]?\d[./-]\d{2,4})/i,
        1,
      ) ??
      null,
    ladenOnBoardDate:
      extract(
        normalized,
        /(?:Date\s+)?Laden on Board[:\s]*([0-3]?\d[\s./-][A-Za-z]{3}[\s./-]\d{4})/i,
        1,
      ) ??
      extract(
        normalized,
        /(?:Date\s+)?Laden on Board[:\s]*([0-3]?\d[./-][01]?\d[./-]\d{2,4})/i,
        1,
      ) ??
      null,
    blIssueDate:
      extract(
        normalized,
        /Date of Issue[:\s]*([0-3]?\d[\s./-][A-Za-z]{3}[\s./-]\d{4})/i,
        1,
      ) ??
      extract(
        normalized,
        /(?:B\/L|Bill of Lading)\s+issued[^0-9]*([0-3]?\d[-/][A-Za-z]{3}[-/]\d{4})/i,
        1,
      ) ??
      extract(
        normalized,
        /(?:B\/L|Bill of Lading)\s+issued[^0-9]*([0-3]?\d[./-][01]?\d[./-]\d{2,4})/i,
        1,
      ) ??
      null,
    dateOfDelivery:
      extract(
        normalized,
        /(?:Date of Delivery|Place of Delivery)[^0-9]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
        1,
      ) ??
      extract(
        normalized,
        /(?:Date of Delivery|Place of Delivery|Entrega)[^0-9]*([0-3]?\d[./-][01]?\d[./-]\d{2,4})/i,
        1,
      ) ??
      null,
    estimatedArrivalDate:
      extract(
        normalized,
        /(?:ETA|E\.T\.A\.|Estimated Arrival|Time of Arrival)[:\s]*([0-3]?\d[-/][A-Za-z]{3}[-/]\d{4})/i,
        1,
      ) ??
      extract(
        normalized,
        /(?:ETA|E\.T\.A\.|Estimated Arrival|Fecha\s+de\s+llegada|Time of Arrival)[:\s]*([0-3]?\d[./-][01]?\d[./-]\d{2,4})/i,
        1,
      ) ??
      null,
  };

  return reconcileSeaPorts(normalized, bl);
}

/** MSC sea waybills often label ports out of column order; prefer known CALLAO ↔ ROTTERDAM pairs. */
function reconcileSeaPorts(
  normalized: string,
  bl: BillOfLadingOrAwbFields,
): BillOfLadingOrAwbFields {
  let portOfLoading = sanitizeLocationToken(bl.portOfLoading);
  let portOfDischarge = sanitizeLocationToken(bl.portOfDischarge);

  const hasCallao = /\bCALLAO\b/i.test(normalized);
  const hasRotterdam = /\bROTTERDAM\b/i.test(normalized);
  const hasCaucedo = /\bCAUCEDO\b/i.test(normalized);

  if (hasCallao && !portOfLoading) portOfLoading = 'CALLAO';
  if (hasRotterdam && !portOfDischarge) portOfDischarge = 'ROTTERDAM';
  if (hasCaucedo && !portOfDischarge) portOfDischarge = 'CAUCEDO';

  if (
    hasCallao &&
    hasRotterdam &&
    portOfDischarge?.toUpperCase() === 'CALLAO'
  ) {
    portOfLoading = 'CALLAO';
    portOfDischarge = 'ROTTERDAM';
  }

  return { ...bl, portOfLoading, portOfDischarge };
}

function extractCoSection(normalized: string): CertificateOfOriginFields {
  const hasCoSignals =
    /\b(certificate of origin|certificado de origen|eur\.?\s*1|eur1|movement certificate|camara de comercio|país de origen|country of origin)\b/i.test(
      normalized,
    );

  if (!hasCoSignals) {
    return emptyCo();
  }

  const goodsDescription =
    extract(
      normalized,
      /(?:Description of goods|Descripci[oó]n de los productos)[:\s]*([^.;]{10,120})/i,
      1,
    ) ??
    extract(normalized, /(FRESH\s+AVOCADO[^.;]{0,80})/i, 1) ??
    extract(normalized, /(AGUACATE[^.;]{0,80})/i, 1) ??
    null;

  return {
    certificateNumber:
      extract(normalized, /Certificado N[úu]mero[:\s]*([A-Z0-9-]+)/i, 1) ??
      null,
    issuingAuthority:
      extract(normalized, /(C[ÁA]MARA DE COMERCIO[^.]{0,80})/i, 1) ??
      extract(normalized, /(EUROPEAN UNION)/i, 1) ??
      null,
    relatedInvoiceNumber:
      extract(normalized, /Facturas\s+Fecha\s+([A-Z0-9-]+)/i, 1) ??
      extract(normalized, /Invoice\s+No\.?\s*([A-Z0-9-]+)/i, 1) ??
      null,
    relatedInvoiceDate:
      extract(
        normalized,
        /Facturas\s+Fecha\s+[A-Z0-9-]+\s+([0-3]?\d[./-][01]?\d[./-]\d{2,4})/i,
        1,
      ) ?? null,
    netWeightKg: parseKg(
      extract(normalized, /(?:Total Neto|Net weight)[:\s]*([0-9.,]+)\s*kg/i, 1),
    ),
    grossWeightKg: parseKg(
      extract(
        normalized,
        /(?:Total Bruto|Gross mass|Gross weight)[:\s]*([0-9.,]+)/i,
        1,
      ) ??
        extract(
          normalized,
          /(\d{1,3}(?:[.,]\d{3})*(?:\.\d+)?)\s*(?:Kilogram|kg)\b/i,
          1,
        ),
    ),
    goodsDescription,
  };
}

function extractPackingSection(normalized: string): PackingListFields {
  const hasPackingSignals =
    /\b(packing list|lista de empaque|pre-packing|total cartons|gross weight|net weight)\b/i.test(
      normalized,
    ) || extractBoxCount(normalized) != null;

  if (!hasPackingSignals) {
    return emptyPacking();
  }

  const lineCount = countMatches(normalized, /\b\d+\)\s+\d+/g);
  const boxCount = extractBoxCount(normalized) ?? null;

  return {
    packingListNumber:
      extract(normalized, /PRE-PACKING\s+([A-Z0-9-]+)/i, 1) ?? null,
    productVariety:
      extract(
        normalized,
        /\b(VALENCIA|NAVEL|MANDARIN[A]?|HASS|FUERTE)\b/i,
        1,
      ) ?? (/\bHASS\b/i.test(normalized) ? 'HASS' : null),
    brand: extract(normalized, /\b(HILLSIDE)\b/i, 1) ?? null,
    category: extract(normalized, /\b(CAT\s*I|CAT\s*II)\b/i, 1) ?? null,
    temperature:
      extract(normalized, /SENSOR\s*([\-+]?\d+(?:\.\d+)?°C)/i, 1) ?? null,
    packSize:
      extract(normalized, /(?:CAJA|BOX|CARTON)\s+(?:DE\s+)?(\d+\s*KG)/i, 1) ??
      extract(normalized, /(\d+\s*KG)\s+(?:BOX|CAJA)/i, 1) ??
      null,
    lineCount,
    boxCount,
  };
}

function extractPhytoSection(normalized: string): PhytosanitaryFields {
  const hasPhytoSignals =
    /\b(phytosanitary|fitosanitari|plant protection)\b/i.test(normalized);
  if (!hasPhytoSignals) {
    return {
      phytosanitaryCertificateNumber: null,
      issuingPlantProtectionOrganization: null,
      meansOfConveyance: null,
      declaredPointOfEntry: null,
    };
  }

  return {
    phytosanitaryCertificateNumber:
      extract(normalized, /Certificate\s+No\.?\s*([A-Z0-9-]+)/i, 1) ?? null,
    issuingPlantProtectionOrganization:
      extract(normalized, /(PLANT PROTECTION ORGANIZATION OF [A-Z]+)/i, 1) ??
      extract(
        normalized,
        /(ORGANIZACI[ÓO]N DE PROTECCI[ÓO]N FITOSANITARIA[^.]+)/i,
        1,
      ) ??
      null,
    meansOfConveyance:
      extract(
        normalized,
        /\b(MARITIMO|MARÍTIMO|A[EÉ]REO|TERRESTRE|SEA|AIR)\b/i,
        1,
      ) ?? null,
    declaredPointOfEntry:
      extract(normalized, /point of entry\s*([A-Z][A-Z-]+)/i, 1) ??
      extract(normalized, /\bCAUCEDO\b/i) ??
      null,
  };
}

export function extractBoxCount(text: string): number | undefined {
  const patterns = [
    /(\d{1,6})\s+BOX(?:ES)?(?:\s*\(|\s*,|\s+GROSS|\s+NET|\s|$)/i,
    /(\d{1,6})\s+BOX\b/i,
    /(\d{1,6})\s+CARTONS?\b/i,
    /TOTAL\s+(?:CARTONS?|BOX(?:ES)?)\s*[:\s]*(\d{1,6})/i,
  ];
  let best: number | undefined;
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const n = parseInt(match[1].replace(/,/g, ''), 10);
    if (Number.isFinite(n) && n > 0) {
      if (best == null || n > best) best = n;
    }
  }
  return best;
}

export function isPlausibleCompanyName(name: string): boolean {
  const trimmed = name.trim();
  if (trimmed.length < 6 || trimmed.length > 120) return false;
  const upper = trimmed.toUpperCase();
  if (
    /XXXX|RIDER\s+PAGES|NO\.\s*OF|NOTIFY\s+PARTY|BOOKING\s+REF|^\s*AGENT\s*$|^\s*CARRIER\s*$|^\s*SHIPPER\s*$/i.test(
      upper,
    )
  ) {
    return false;
  }
  if (/^SHIPPER:\s*NO/i.test(upper)) return false;
  const letterRatio =
    (trimmed.match(/[A-Za-z]/g)?.length ?? 0) / trimmed.length;
  if (letterRatio < 0.5) return false;
  return true;
}

function extractAfterLabel(text: string, label: RegExp): string | undefined {
  const idx = text.search(label);
  if (idx < 0) return undefined;
  const slice = text.slice(idx).replace(label, '').trim();
  const m = slice.match(
    /^([A-Z0-9][A-Z0-9\s\.\-&]{5,60}?)(?=\s+(?:RUC|NIF|NOTIFY|CONSIGNEE|CARRIER)|$)/i,
  );
  const value = m?.[1]?.trim();
  return value && isPlausibleCompanyName(value) ? value : undefined;
}

function hasSectionData(section: Record<string, unknown> | undefined): boolean {
  if (!section) return false;
  return Object.entries(section).some(([key, value]) => {
    if (key === 'lineCount') return typeof value === 'number' && value > 0;
    return value != null && value !== '' && value !== 0;
  });
}

function emptyBl(): BillOfLadingOrAwbFields {
  return {
    billOfLadingNumber: null,
    vesselName: null,
    voyageNumber: null,
    portOfLoading: null,
    portOfDischarge: null,
    placeOfReceipt: null,
    shippedOnBoardDate: null,
    ladenOnBoardDate: null,
    blIssueDate: null,
    dateOfDelivery: null,
    estimatedArrivalDate: null,
  };
}

function emptyCo(): CertificateOfOriginFields {
  return {
    certificateNumber: null,
    issuingAuthority: null,
    relatedInvoiceNumber: null,
    relatedInvoiceDate: null,
    netWeightKg: null,
    grossWeightKg: null,
    goodsDescription: null,
  };
}

function emptyPacking(): PackingListFields {
  return {
    packingListNumber: null,
    productVariety: null,
    brand: null,
    category: null,
    temperature: null,
    packSize: null,
    lineCount: 0,
    boxCount: null,
  };
}

function extract(text: string, pattern: RegExp, group = 0): string | undefined {
  const match = text.match(pattern);
  if (!match) {
    return undefined;
  }

  const value = match[group] ?? match[0];
  return value?.trim();
}

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function parseMoney(value?: string): NullableNumber {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/,/g, '');
  const num = Number(normalized);
  return Number.isFinite(num) ? num : null;
}

function parseKg(value?: string): NullableNumber {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/,/g, '');
  const num = Number(normalized);
  return Number.isFinite(num) && num > 0 ? num : null;
}

function getExtractionQuality(text: string): 'high' | 'medium' | 'low' {
  if (text.length > 500) {
    return 'high';
  }
  if (text.length > 120) {
    return 'medium';
  }
  return 'low';
}
