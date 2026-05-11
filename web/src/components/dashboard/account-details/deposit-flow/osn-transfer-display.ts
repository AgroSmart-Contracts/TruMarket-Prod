import type { OsnFeeQuoteData } from 'src/interfaces/osnFeeQuote';
import type { PaymentProviderTransfer } from 'src/interfaces/payment';

import { getBuyerPayableTotal, getUserVisibleTruMarketFee } from './fee-display';

function numFromUnknown(v: unknown): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Best-effort extract a single fee amount from OSN post-mint `estimated_fees` (display only). */
export function parseEstimatedFeeAmount(estimatedFees: unknown): number | null {
  if (estimatedFees == null) return null;
  const direct = numFromUnknown(estimatedFees);
  if (direct != null) return direct;
  if (typeof estimatedFees === 'object') {
    const o = estimatedFees as Record<string, unknown>;
    const keys = [
      'fee',
      'total_fee',
      'estimated_fee',
      'provider_fee',
      'amount',
      'value',
      'fee_amount',
      'total',
    ];
    for (const k of keys) {
      const n = numFromUnknown(o[k]);
      if (n != null) return n;
    }
    if (o.fees && typeof o.fees === 'object') {
      return parseEstimatedFeeAmount(o.fees);
    }
  }
  return null;
}

/**
 * Post-mint deposit UX: buyer-facing amounts come from the persisted admin fee-quote when available
 * (`buyerFeeAmount`, `totalBuyerPays`). OSN `estimatedFees` is only used when no quote exists (legacy).
 * Never derive fee splits here — see admin-dashboard pre-mint fee-quote contract.
 */
export function getDisplayFeeAndTotal(opts: {
  paymentAmount: number;
  paymentCurrency: string;
  transfer?: PaymentProviderTransfer | null;
  confirmedFeeQuote?: OsnFeeQuoteData | null;
}): { fee: number | null; total: number | null; currency: string } {
  const { paymentAmount, paymentCurrency, transfer, confirmedFeeQuote } = opts;
  const fromOsn = transfer ? parseEstimatedFeeAmount(transfer.estimatedFees) : null;

  const fee = confirmedFeeQuote != null ? getUserVisibleTruMarketFee(confirmedFeeQuote) : fromOsn ?? null;

  const total =
    (confirmedFeeQuote ? getBuyerPayableTotal(confirmedFeeQuote) : null) ??
    (confirmedFeeQuote == null && fromOsn != null
      ? Math.round((paymentAmount + fromOsn) * 100) / 100
      : null);
  return { fee, total, currency: paymentCurrency };
}

function humanizeKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Flatten nested OSN pay-in / bank objects into label rows for the UI. */
export function payInDetailRows(payIn: unknown): { label: string; value: string }[] {
  if (payIn == null) return [];
  if (typeof payIn === 'string') return [{ label: 'Details', value: payIn }];

  const rows: { label: string; value: string }[] = [];
  const walk = (obj: unknown, prefix = '') => {
    if (obj == null) return;
    if (typeof obj !== 'object') {
      rows.push({ label: prefix || 'Value', value: String(obj) });
      return;
    }
    if (Array.isArray(obj)) {
      obj.forEach((item, i) => walk(item, `${prefix}[${i}]`));
      return;
    }
    for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
      if (v == null) continue;
      const label = prefix ? `${prefix} — ${humanizeKey(k)}` : humanizeKey(k);
      if (typeof v === 'object' && !Array.isArray(v)) {
        walk(v, label);
      } else if (Array.isArray(v)) {
        walk(v, label);
      } else {
        rows.push({ label, value: String(v) });
      }
    }
  };
  walk(payIn);
  return rows;
}

export function parseDepositReference(depositInstructions: unknown): string | null {
  if (depositInstructions == null) return null;
  if (typeof depositInstructions === 'string') return depositInstructions.trim() || null;
  if (typeof depositInstructions === 'object') {
    const o = depositInstructions as Record<string, unknown>;
    const keys = ['reference', 'reference_code', 'memo', 'note', 'instruction', 'instructions'];
    for (const k of keys) {
      const v = o[k];
      if (typeof v === 'string' && v.trim()) return v.trim();
    }
  }
  return null;
}
