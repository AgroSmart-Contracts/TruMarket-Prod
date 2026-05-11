import { Injectable, Logger } from '@nestjs/common';

import { config } from '@/config';
import { BadRequestError, InternalServerError } from '@/errors';

/**
 * Normalized pre-mint fee quote from admin-dashboard (single source of truth).
 *
 * Contract: `POST {ADMIN_DASHBOARD_URL}/api/internal/osn/fee-quote`
 * — Auth: `Authorization: Bearer {ADMIN_DASHBOARD_INTERNAL_TOKEN}` (must match admin env).
 * — Body: `{ amount: number, currency: string, partner?: string, promoCode?: string }`.
 * — Success: `{ success: true, data: { paymentAmount, currency, osnFee, trumarketFee, totalFee,
 *   buyerFeePercent, buyerFeeAmount, supplierFeeAmount, totalBuyerPays, source: "admin_backend_fee_quote" } }`.
 *
 * TruMarket must pass through `data` as-is for buyer-facing UI and optional payment persistence.
 * Do not recompute buyer/supplier splits or totals on the client.
 */
export interface OsnFeeQuoteData {
  paymentAmount: number;
  currency: string;
  osnFee: number;
  trumarketFee: number;
  totalFee: number;
  buyerFeePercent: number;
  buyerFeeAmount: number;
  supplierFeeAmount: number;
  totalBuyerPays: number;
  source?: string;
}

interface AdminFeeQuoteApiResponse {
  success?: boolean;
  data?: OsnFeeQuoteData;
  message?: string;
  error?: string;
}

@Injectable()
export class AdminDashboardFeeQuoteService {
  private readonly log = new Logger(AdminDashboardFeeQuoteService.name);
  private readonly timeoutMs = 30_000;

  async getFeeQuote(
    amount: number,
    currency: string,
    opts?: { partner?: string; promoCode?: string },
  ): Promise<OsnFeeQuoteData> {
    const base = (config.adminDashboardUrl || '').replace(/\/+$/, '');
    const token = config.adminDashboardInternalToken;

    if (!base) {
      this.log.error('Missing admin-dashboard URL (set ADMIN_DASHBOARD_URL)');
      throw new InternalServerError('ADMIN_DASHBOARD_URL is not configured');
    }
    if (!token) {
      this.log.error('Missing internal token (set ADMIN_DASHBOARD_INTERNAL_TOKEN)');
      throw new InternalServerError('ADMIN_DASHBOARD_INTERNAL_TOKEN is not configured');
    }

    const url = `${base}/api/internal/osn/fee-quote`;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          currency,
          ...(opts?.partner ? { partner: opts.partner } : {}),
          ...(opts?.promoCode ? { promoCode: opts.promoCode } : {}),
        }),
        signal: controller.signal,
      });

      const text = await res.text();
      const parsed = (text ? safeJsonParse(text) : null) as AdminFeeQuoteApiResponse | null;

      if (!res.ok) {
        const msg =
          (parsed && (parsed.message || parsed.error)) ||
          `Admin fee quote HTTP ${res.status}`;
        this.log.warn(`Admin fee quote HTTP error: ${msg} (status=${res.status}, url=${url})`);
        throw new BadRequestError(msg);
      }

      if (!parsed) {
        this.log.error(`Admin fee quote empty/non-JSON body (url=${url})`);
        throw new BadRequestError('Invalid fee quote response from admin dashboard');
      }

      if (parsed.success === false) {
        const msg = parsed.message || parsed.error || 'Admin fee quote reported success: false';
        this.log.warn(`Admin fee quote success:false — ${msg} (url=${url})`);
        throw new BadRequestError(msg);
      }

      if (parsed.success !== true || !parsed.data) {
        const msg = parsed.message || 'Invalid fee quote response from admin dashboard (missing data)';
        this.log.warn(`Admin fee quote missing success/data — ${msg} (url=${url})`);
        throw new BadRequestError(msg);
      }

      return parsed.data;
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string; cause?: unknown };
      if (e?.name === 'AbortError') {
        throw new BadRequestError(`Fee quote request timed out after ${this.timeoutMs}ms`);
      }
      if (err instanceof BadRequestError) throw err;
      const causeMsg = e?.cause != null ? stringifyCause(e.cause) : '';
      const detail = [e?.message, causeMsg].filter(Boolean).join(' — ') || 'Fee quote request failed';
      this.log.error(
        `Fee quote fetch failed: ${detail}${url ? ` (url=${url})` : ''}`,
        err instanceof Error ? err.stack : undefined,
      );
      throw new InternalServerError(detail);
    } finally {
      clearTimeout(t);
    }
  }
}

function stringifyCause(cause: unknown): string {
  if (cause == null) return '';
  if (cause instanceof Error) return cause.message || String(cause);
  if (typeof cause === 'object' && cause !== null && 'code' in cause) {
    return JSON.stringify(cause);
  }
  return String(cause);
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
