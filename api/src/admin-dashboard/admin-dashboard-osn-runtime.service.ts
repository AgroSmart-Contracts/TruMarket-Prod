import { Injectable, Logger } from '@nestjs/common';

import { config } from '@/config';
import { BadRequestError, InternalServerError } from '@/errors';
import type { OsnRuntimeSettingsResolved } from '@/settings/osn-runtime-settings.types';

/**
 * Fetches resolved OSN runtime defaults from admin-dashboard (source of truth on that host:
 * Mongo `trumarket_settings` + env fallbacks there).
 *
 * Contract: `GET {ADMIN_DASHBOARD_URL}/api/internal/settings/osn-runtime`
 * — Auth: `Authorization: Bearer {ADMIN_DASHBOARD_INTERNAL_TOKEN}` (same as other internal routes).
 * Do not use the TruMarket app browser admin routes for this.
 */
interface AdminOsnRuntimeApiResponse {
  success?: boolean;
  data?: {
    organizationId: string;
    defaultOrganizationBankId?: string;
    defaultChainId: string;
    defaultWalletId?: string;
    defaultRecipientId?: string;
    defaultCurrencyCode: string;
  };
  error?: string;
  message?: string;
}

@Injectable()
export class AdminDashboardOsnRuntimeService {
  private readonly log = new Logger(AdminDashboardOsnRuntimeService.name);
  private readonly timeoutMs = 30_000;

  async fetchOsnRuntimeSettings(): Promise<OsnRuntimeSettingsResolved> {
    const base = (config.adminDashboardUrl || '').replace(/\/+$/, '');
    const token = config.adminDashboardInternalToken;

    if (!base || !token) {
      throw new InternalServerError(
        'ADMIN_DASHBOARD_URL and ADMIN_DASHBOARD_INTERNAL_TOKEN are required to load OSN runtime defaults from admin-dashboard',
      );
    }

    const url = `${base}/api/internal/settings/osn-runtime`;
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: controller.signal,
      });

      const text = await res.text();
      const parsed = (
        text ? safeJsonParse(text) : null
      ) as AdminOsnRuntimeApiResponse | null;

      if (!res.ok) {
        const msg =
          (parsed && (parsed.message || parsed.error)) ||
          `Admin OSN runtime settings failed with HTTP ${res.status}`;
        this.log.warn(`Admin OSN runtime HTTP ${res.status}: ${msg}`);
        throw new BadRequestError(msg);
      }

      if (!parsed) {
        throw new BadRequestError(
          'Invalid OSN runtime response from admin-dashboard (empty body)',
        );
      }

      if (parsed.success === false) {
        const msg =
          parsed.message ||
          parsed.error ||
          'Admin OSN runtime settings reported success: false';
        this.log.warn(`Admin OSN runtime: ${msg}`);
        throw new BadRequestError(msg);
      }

      if (!parsed.data) {
        throw new BadRequestError(
          'Invalid OSN runtime response from admin-dashboard (missing data)',
        );
      }

      const d = parsed.data;
      if (!d.organizationId?.trim()) {
        throw new BadRequestError(
          'OSN runtime settings missing organizationId (admin-dashboard resolver)',
        );
      }
      if (!d.defaultChainId?.trim()) {
        throw new BadRequestError(
          'OSN runtime settings missing defaultChainId (admin-dashboard resolver)',
        );
      }

      return {
        organizationId: d.organizationId.trim(),
        defaultOrganizationBankId: d.defaultOrganizationBankId,
        defaultWalletId: d.defaultWalletId,
        defaultRecipientId: d.defaultRecipientId,
        defaultCurrencyCode: (d.defaultCurrencyCode || 'USDC')
          .trim()
          .toUpperCase(),
        defaultChainId: d.defaultChainId,
      };
    } catch (err: unknown) {
      const e = err as { name?: string; message?: string; cause?: unknown };
      if (e?.name === 'AbortError') {
        throw new BadRequestError(
          `OSN runtime settings request timed out after ${this.timeoutMs}ms`,
        );
      }
      if (err instanceof BadRequestError) throw err;
      const causeMsg =
        e?.cause != null
          ? e.cause instanceof Error
            ? e.cause.message
            : String(e.cause)
          : '';
      const detail =
        [e?.message, causeMsg].filter(Boolean).join(' — ') ||
        'OSN runtime settings request failed';
      this.log.error(`Admin OSN runtime fetch failed: ${detail}`);
      throw new InternalServerError(detail);
    } finally {
      clearTimeout(t);
    }
  }
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
