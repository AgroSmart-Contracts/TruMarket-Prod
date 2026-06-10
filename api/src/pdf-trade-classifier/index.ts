import { classifyByKeywords } from './classifier';
import {
  type ExtractedDocumentFields,
  extractStructuredFields,
} from './extraction';
import { parsePdfBuffer } from './parser';
import {
  classifyPeruDrawbackByKeywords,
  mergePeruDrawbackDocumentDateIso,
  type PeruDrawbackClassificationResult,
} from './peruDrawbackClassifier';
import type { ClassifiedDocumentType, ParsedPdfResult } from './types';

export type { ExtractedDocumentFields } from './extraction';
export { extractBoxCount, isPlausibleCompanyName } from './extraction';
export {
  parseDealDateFromIso,
  parseTradeDocumentDate,
  pickArrivalDateDistinctFromDeparture,
  pickEarliestParsedDate,
  pickFirstParsedDate,
  pickLatestParsedDateAfter,
} from './trade-document-dates';

export type ClassificationResult = {
  type: ClassifiedDocumentType;
  score: number;
  matchedKeywords: string[];
};

export type ClassifiedPdf = {
  parsed: ParsedPdfResult;
  classification: ClassificationResult;
  extracted: ExtractedDocumentFields;
};

export type ClassifiedPeruDrawbackPdf = {
  parsed: ParsedPdfResult;
  peruDrawback: PeruDrawbackClassificationResult;
};

export async function classifyAndExtractPdfBuffer(
  buffer: Uint8Array,
  fileName?: string,
): Promise<ClassifiedPdf> {
  const parsed = await parsePdfBuffer(buffer, fileName);
  const classification = classifyByKeywords(parsed.text, undefined, {
    filePath: parsed.filePath,
  });
  return {
    parsed,
    classification,
    extracted: extractStructuredFields(parsed, classification.type),
  };
}

export async function classifyPeruDrawbackPdfBuffer(
  buffer: Uint8Array,
  fileName?: string,
): Promise<ClassifiedPeruDrawbackPdf> {
  const parsed = await parsePdfBuffer(buffer, fileName);
  const peruDrawback = classifyPeruDrawbackByKeywords(parsed.text, undefined, {
    filePath: parsed.filePath,
  });
  const extracted = extractStructuredFields(parsed, 'Unknown');
  const boxCount =
    extracted.packingList && extracted.packingList.boxCount != null
      ? extracted.packingList.boxCount
      : null;
  const invoiceDate =
    'invoiceDate' in extracted && typeof extracted.invoiceDate === 'string'
      ? extracted.invoiceDate
      : null;
  const issueDate =
    'issueDate' in extracted && typeof extracted.issueDate === 'string'
      ? extracted.issueDate
      : null;
  const documentDateIso = mergePeruDrawbackDocumentDateIso(
    peruDrawback.documentDateIso,
    invoiceDate,
    issueDate,
  );
  return {
    parsed,
    peruDrawback: {
      ...peruDrawback,
      documentDateIso: documentDateIso ?? peruDrawback.documentDateIso,
      boxCount,
    },
  };
}
