import type { ExtractedDocumentFields } from '@/pdf-trade-classifier';

import type { DealFieldSuggestions } from './deal-field-suggestions.types';
import {
  pickArrivalDateDistinctFromDeparture,
  pickFirstParsedDate,
} from './trade-document-dates';
import { TransportMode, type TransportModeValue } from './transport-mode';

export {
  parseTradeDocumentDate,
  pickFirstParsedDate,
} from './trade-document-dates';

function nonEmpty(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

/** Port/terminal phrases must not be stored as country names. */
function looksLikePortOrTerminal(text: string): boolean {
  const upper = text.toUpperCase();
  return (
    /\b(PORTS?|PUERTOS?|TERMINAL|WHARF|HARBOUR|HARBOR|DEPOT)\b/.test(upper) ||
    /\bSERVICE\s+CONTRACT\b/.test(upper) ||
    /\b(NORTH|SOUTH|EAST|WEST)\s+(PORT|TERMINAL)\b/.test(upper)
  );
}

/** Best-effort country label from a port/city/region string in trade PDFs. */
function inferCountryFromLocation(
  location?: string | null,
): string | undefined {
  const raw = nonEmpty(location);
  if (!raw) return undefined;
  const upper = raw.toUpperCase();

  const known: Array<[RegExp, string]> = [
    [/\bPERU\b|\bPERUVIAN\b|\bLIMA\b|\bCALLAO\b/i, 'Peru'],
    [/\bDOMINICAN\b|\bCAUCEDO\b|\bSANTO\s+DOMINGO\b/i, 'Dominican Republic'],
    [/\bCHILE\b|\bVALPARAISO\b/i, 'Chile'],
    [
      /\bUSA\b|\bUNITED\s+STATES\b|\bU\.?S\.?A\.?\b|\bMIAMI\b/i,
      'United States',
    ],
    [/\bNETHERLANDS\b|\bROTTERDAM\b/i, 'Netherlands'],
    [/\bSPAIN\b|\bALGECIRAS\b/i, 'Spain'],
    [/\bECUADOR\b/i, 'Ecuador'],
    [/\bCOLOMBIA\b/i, 'Colombia'],
    [/\bMEXICO\b|\bMÉXICO\b/i, 'Mexico'],
    [/\bBRAZIL\b|\bBRASIL\b/i, 'Brazil'],
    [/\bARGENTINA\b/i, 'Argentina'],
  ];

  for (const [pattern, country] of known) {
    if (pattern.test(upper)) return country;
  }

  if (looksLikePortOrTerminal(raw) || raw.length > 35) return undefined;

  if (/^(or the|the|and|of|to|from|by|sea|only)$/i.test(raw.trim())) {
    return undefined;
  }

  if (/^[A-Za-zÀ-ÿ\s.'-]{2,35}$/.test(raw)) {
    return normalizeLocationLabel(raw);
  }

  return undefined;
}

/** Strip BL noise and return a short port code/name (e.g. CALLAO). */
function sanitizePortName(value?: string | null): string | undefined {
  let raw = nonEmpty(value);
  if (!raw) return undefined;

  raw = raw
    .replace(/\s+service\s+contract\b.*$/i, '')
    .replace(/\s+contract\s+no\.?\s*.*$/i, '')
    .replace(/\s+no\.?\s*#?\s*\d*.*$/i, '')
    .trim();

  const canonical: Array<[RegExp, string]> = [
    [/\bCALLAO\b/i, 'CALLAO'],
    [/\bCAUCEDO\b/i, 'CAUCEDO'],
    [/\bLIMA\b/i, 'LIMA'],
    [/\bVALPARAISO\b/i, 'VALPARAISO'],
    [/\bROTTERDAM\b/i, 'ROTTERDAM'],
    [/\bALGECIRAS\b/i, 'ALGECIRAS'],
    [/\bMIAMI\b/i, 'MIAMI'],
    [/\bSANTO\s+DOMINGO\b/i, 'SANTO DOMINGO'],
  ];

  for (const [pattern, name] of canonical) {
    if (pattern.test(raw)) return name;
  }

  if (looksLikePortOrTerminal(raw)) return undefined;

  const words = raw.split(/[\s,·/]+/).filter(Boolean);
  if (words.length === 1 && words[0].length <= 24) {
    return words[0].toUpperCase();
  }

  if (raw.length <= 28 && words.length <= 3) {
    return raw.toUpperCase();
  }

  return undefined;
}

function normalizeLocationLabel(value?: string | null): string | undefined {
  const raw = nonEmpty(value);
  if (!raw) return undefined;
  return raw
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function inferTransport(
  documentType: string,
  extracted: ExtractedDocumentFields,
): TransportModeValue | undefined {
  const means = (
    extracted.phytosanitaryCertificate?.meansOfConveyance ?? ''
  ).toUpperCase();

  if (/\bA[EÉ]REO\b|\bAIR\b|\bAWB\b|\bFLIGHT\b/.test(means)) {
    return TransportMode.ByAir;
  }
  if (/\bMARITIMO\b|\bMARÍTIMO\b|\bSEA\b/.test(means)) {
    return TransportMode.BySea;
  }

  const raw = extracted.common.rawText.toLowerCase();

  const airSignals =
    (/\bair waybill\b/.test(raw) ? 3 : 0) +
    (/\bawb\b/.test(raw) ? 2 : 0) +
    (/\bairport of (departure|destination)\b/.test(raw) ? 2 : 0) +
    (/\bflight\b/.test(raw) ? 2 : 0) +
    (/\ba[eé]reo\b/.test(raw) ? 2 : 0);

  const seaSignals =
    (/\bbill of lading\b/.test(raw) ? 3 : 0) +
    (/\bconocimiento de embarque\b/.test(raw) ? 2 : 0) +
    (/\bport of loading\b/.test(raw) ? 2 : 0) +
    (/\bport of discharge\b/.test(raw) ? 2 : 0) +
    (/\bocean vessel\b/.test(raw) ? 2 : 0) +
    (/\bvessel\b/.test(raw) ? 1 : 0) +
    (/\bvoyage\b/.test(raw) ? 1 : 0) +
    (/\bmar[ií]timo\b/.test(raw) ? 2 : 0) +
    (extracted.billOfLadingOrAwb?.vesselName ? 2 : 0);

  if (airSignals > seaSignals && airSignals >= 2) {
    return TransportMode.ByAir;
  }
  if (seaSignals >= 2) {
    return TransportMode.BySea;
  }

  if (
    documentType === 'Bill of Lading or AWB' &&
    extracted.billOfLadingOrAwb?.vesselName
  ) {
    return TransportMode.BySea;
  }

  return undefined;
}

export function mapExtractedFieldsToDealSuggestions(
  extracted: ExtractedDocumentFields,
): DealFieldSuggestions {
  const { common } = extracted;
  const docType = String(common.documentType);

  const portOfOriginRaw =
    nonEmpty(extracted.billOfLadingOrAwb?.portOfLoading) ??
    nonEmpty(extracted.billOfLadingOrAwb?.placeOfReceipt) ??
    nonEmpty(common.originLocation);

  const portOfDestinationRaw =
    nonEmpty(extracted.billOfLadingOrAwb?.portOfDischarge) ??
    nonEmpty(extracted.phytosanitaryCertificate?.declaredPointOfEntry) ??
    nonEmpty(common.destinationLocation);

  const portOfOrigin = sanitizePortName(portOfOriginRaw);
  const portOfDestination = sanitizePortName(portOfDestinationRaw);

  const variety = nonEmpty(extracted.packingList?.productVariety);
  const quality = nonEmpty(extracted.packingList?.category) ?? undefined;
  const presentation =
    [extracted.packingList?.brand, extracted.packingList?.temperature]
      .filter(Boolean)
      .join(' · ') || undefined;

  const lineCount = extracted.packingList?.lineCount;
  const quantity = lineCount && lineCount > 0 ? lineCount : undefined;

  const invoiceTotal = extracted.invoice?.invoiceTotal ?? undefined;
  const invoiceSubtotal = extracted.invoice?.invoiceSubtotal ?? undefined;
  const total = invoiceTotal ?? invoiceSubtotal;

  let offerUnitPrice: number | undefined;
  if (total != null && quantity != null && quantity > 0) {
    offerUnitPrice = Math.round((total / quantity) * 100) / 100;
  }

  const description =
    [
      variety,
      extracted.packingList?.brand,
      common.incoterm,
      extracted.invoice?.invoiceNumber
        ? `Invoice ${extracted.invoice.invoiceNumber}`
        : undefined,
    ]
      .filter(Boolean)
      .join(' — ') || undefined;

  const name = variety ?? (docType !== 'Unknown' ? docType : undefined);

  const bl = extracted.billOfLadingOrAwb as
    | (typeof extracted.billOfLadingOrAwb & {
        shippedOnBoardDate?: string | null;
        ladenOnBoardDate?: string | null;
        blIssueDate?: string | null;
        dateOfDelivery?: string | null;
        estimatedArrivalDate?: string | null;
      })
    | undefined;
  const co = extracted.certificateOfOrigin;
  const invoice = extracted.invoice as
    | (typeof extracted.invoice & { invoiceDate?: string | null })
    | undefined;

  const shippingStartDate = pickFirstParsedDate(
    bl?.shippedOnBoardDate,
    invoice?.invoiceDate,
    co?.relatedInvoiceDate,
    common.issueDate,
  );

  const expectedShippingEndDate = pickArrivalDateDistinctFromDeparture(
    shippingStartDate,
    bl?.estimatedArrivalDate,
    bl?.dateOfDelivery,
    invoice?.invoiceDate,
    co?.relatedInvoiceDate,
    common.issueDate,
  );

  return {
    name,
    description,
    quantity,
    offerUnitPrice,
    totalValue: total ?? undefined,
    investmentAmount: total ?? undefined,
    variety,
    quality,
    presentation: presentation || undefined,
    origin:
      inferCountryFromLocation(common.originLocation) ??
      inferCountryFromLocation(portOfOriginRaw) ??
      inferCountryFromLocation(portOfOrigin),
    destination:
      inferCountryFromLocation(common.destinationLocation) ??
      inferCountryFromLocation(portOfDestinationRaw) ??
      inferCountryFromLocation(portOfDestination),
    portOfOrigin,
    portOfDestination,
    transport: inferTransport(docType, extracted),
    shippingStartDate,
    expectedShippingEndDate,
    buyerCompanyName: nonEmpty(common.consigneeName),
    buyerCompanyTaxId: nonEmpty(common.consigneeTaxId),
    buyerCompanyCountry:
      inferCountryFromLocation(common.destinationLocation) ??
      inferCountryFromLocation(portOfDestinationRaw) ??
      inferCountryFromLocation(portOfDestination),
    supplierCompanyName: nonEmpty(common.exporterName),
    supplierCompanyTaxId: nonEmpty(common.exporterTaxId),
    supplierCompanyCountry:
      inferCountryFromLocation(common.originLocation) ??
      inferCountryFromLocation(portOfOriginRaw) ??
      inferCountryFromLocation(portOfOrigin),
  };
}
