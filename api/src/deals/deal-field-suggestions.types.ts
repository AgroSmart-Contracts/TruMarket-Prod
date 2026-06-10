import { isPlausibleCompanyName } from '@/pdf-trade-classifier';

import { parseTradeDocumentDate } from './trade-document-dates';
import type { TransportModeValue } from './transport-mode';

/** Deal form fields that can be suggested from classified trade PDFs. */
export type DealFieldSuggestions = {
  name?: string;
  description?: string;
  quantity?: number;
  offerUnitPrice?: number;
  totalValue?: number;
  investmentAmount?: number;
  variety?: string;
  quality?: string;
  presentation?: string;
  origin?: string;
  destination?: string;
  portOfOrigin?: string;
  portOfDestination?: string;
  transport?: TransportModeValue;
  shippingStartDate?: string;
  expectedShippingEndDate?: string;
  buyerCompanyName?: string;
  buyerCompanyCountry?: string;
  buyerCompanyTaxId?: string;
  supplierCompanyName?: string;
  supplierCompanyCountry?: string;
  supplierCompanyTaxId?: string;
};

export const DEAL_FIELD_SUGGESTION_KEYS: (keyof DealFieldSuggestions)[] = [
  'name',
  'description',
  'quantity',
  'offerUnitPrice',
  'totalValue',
  'investmentAmount',
  'variety',
  'quality',
  'presentation',
  'origin',
  'destination',
  'portOfOrigin',
  'portOfDestination',
  'transport',
  'shippingStartDate',
  'expectedShippingEndDate',
  'buyerCompanyName',
  'buyerCompanyCountry',
  'buyerCompanyTaxId',
  'supplierCompanyName',
  'supplierCompanyCountry',
  'supplierCompanyTaxId',
];

function scoreCountryLabel(value: string): number {
  const upper = value.trim().toUpperCase();
  if (upper === 'DO' || upper === 'D.O.') return -100;
  if (
    upper.includes('DOMINICAN') ||
    upper === 'PERU' ||
    upper.includes('UNITED') ||
    upper.includes('NETHERLANDS') ||
    upper.includes('SPAIN')
  ) {
    return 100;
  }
  if (value.trim().length <= 3) return -50;
  return value.trim().length;
}

function scorePortLabel(value: string): number {
  const upper = value.trim().toUpperCase();
  if (upper === 'DO' || upper === 'PE') return -100;
  if (/\b(CALLAO|CAUCEDO|LIMA|ROTTERDAM)\b/.test(upper)) return 100;
  if (value.trim().length <= 3) return -50;
  return value.trim().length;
}

function scorePresentation(value: string): number {
  const temp = value.match(/(-?\d+(?:\.\d+)?)\s*°?\s*C/i);
  if (temp) {
    const c = Number(temp[1]);
    return c >= 0 ? 50 + c : c;
  }
  return value.length;
}

function pickBestString(
  parts: DealFieldSuggestions[],
  key: keyof DealFieldSuggestions,
  score: (value: string) => number,
): string | undefined {
  let best: string | undefined;
  let bestScore = -Infinity;
  for (const part of parts) {
    const raw = part[key];
    if (typeof raw !== 'string' || !raw.trim()) continue;
    const s = score(raw);
    if (s > bestScore) {
      bestScore = s;
      best = raw.trim();
    }
  }
  return best;
}

const BEST_STRING_MERGE_KEYS: Array<{
  key: keyof DealFieldSuggestions;
  score: (value: string) => number;
}> = [
  { key: 'origin', score: scoreCountryLabel },
  { key: 'destination', score: scoreCountryLabel },
  { key: 'portOfOrigin', score: scorePortLabel },
  { key: 'portOfDestination', score: scorePortLabel },
  { key: 'buyerCompanyCountry', score: scoreCountryLabel },
  { key: 'supplierCompanyCountry', score: scoreCountryLabel },
  { key: 'presentation', score: scorePresentation },
];

/**
 * Merge multiple document extractions.
 * Dates: earliest departure; earliest arrival strictly after departure.
 * Quantity: max across packing lists. Location fields: scored best match.
 */
export function mergeDealFieldSuggestions(
  parts: DealFieldSuggestions[],
): DealFieldSuggestions {
  const merged: DealFieldSuggestions = {};

  for (const key of DEAL_FIELD_SUGGESTION_KEYS) {
    if (key === 'shippingStartDate') {
      let earliest: string | undefined;
      for (const part of parts) {
        const parsed = parseTradeDocumentDate(
          String(part.shippingStartDate ?? ''),
        );
        if (!parsed) continue;
        if (!earliest || parsed < earliest) earliest = parsed;
      }
      if (earliest) merged.shippingStartDate = earliest;
      continue;
    }

    if (key === 'expectedShippingEndDate') {
      const departureIso = merged.shippingStartDate;
      let earliestAfterDeparture: string | undefined;
      const considerArrivalCandidate = (raw: unknown) => {
        const parsed = parseTradeDocumentDate(String(raw ?? ''));
        if (!parsed) return;
        if (departureIso && parsed <= departureIso) return;
        if (!earliestAfterDeparture || parsed < earliestAfterDeparture) {
          earliestAfterDeparture = parsed;
        }
      };
      for (const part of parts) {
        considerArrivalCandidate(part.expectedShippingEndDate);
        considerArrivalCandidate(part.shippingStartDate);
      }
      if (earliestAfterDeparture) {
        merged.expectedShippingEndDate = earliestAfterDeparture;
      }
      continue;
    }

    if (key === 'quantity') {
      let maxQty: number | undefined;
      for (const part of parts) {
        const q = part.quantity;
        if (q != null && q > 0 && (maxQty == null || q > maxQty)) maxQty = q;
      }
      if (maxQty != null) merged.quantity = maxQty;
      continue;
    }

    const bestMerge = BEST_STRING_MERGE_KEYS.find((b) => b.key === key);
    if (bestMerge) {
      const best = pickBestString(parts, key, bestMerge.score);
      if (best) (merged as Record<string, unknown>)[key] = best;
      continue;
    }

    if (key === 'buyerCompanyName' || key === 'supplierCompanyName') {
      let best: string | undefined;
      let bestLen = 0;
      for (const part of parts) {
        const value = part[key];
        if (typeof value !== 'string' || !isPlausibleCompanyName(value))
          continue;
        const trimmed = value.trim();
        if (trimmed.length > bestLen && trimmed.length <= 80) {
          best = trimmed;
          bestLen = trimmed.length;
        }
      }
      if (best) (merged as Record<string, unknown>)[key] = best;
      continue;
    }

    for (const part of parts) {
      const value = part[key];
      if (value === undefined || value === null || value === '') continue;
      (merged as Record<string, unknown>)[key] = value;
      break;
    }
  }

  const total = merged.totalValue ?? merged.investmentAmount;
  if (
    merged.offerUnitPrice == null &&
    total != null &&
    total > 0 &&
    merged.quantity != null &&
    merged.quantity > 0
  ) {
    merged.offerUnitPrice = Math.round((total / merged.quantity) * 100) / 100;
  }

  return merged;
}

export function listFilledDealFieldKeys(
  suggestions: DealFieldSuggestions,
): (keyof DealFieldSuggestions)[] {
  return DEAL_FIELD_SUGGESTION_KEYS.filter(
    (key) =>
      suggestions[key] !== undefined &&
      suggestions[key] !== null &&
      suggestions[key] !== '',
  );
}

export function hasDealFieldSuggestions(
  suggestions: DealFieldSuggestions,
): boolean {
  return listFilledDealFieldKeys(suggestions).length > 0;
}
