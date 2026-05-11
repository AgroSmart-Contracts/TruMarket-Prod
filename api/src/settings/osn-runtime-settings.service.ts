import { Inject, Injectable, Logger } from '@nestjs/common';

import { config } from '@/config';
import { providers } from '@/constants';
import { InternalServerError } from '@/errors';
import { AdminDashboardOsnRuntimeService } from '@/admin-dashboard/admin-dashboard-osn-runtime.service';

import {
  TruMarketSettings,
  TruMarketSettingsProvider,
} from './trumarket-settings.entities';
import { TruMarketSettingsRepository } from './trumarket-settings.repository';
import type { OsnRuntimeSettingsResolved } from './osn-runtime-settings.types';

export type { OsnRuntimeSettingsResolved } from './osn-runtime-settings.types';

function envFallback(): OsnRuntimeSettingsResolved {
  return {
    organizationId: process.env.OSN_ORGANIZATION_ID || '',
    defaultOrganizationBankId:
      process.env.OSN_DEFAULT_ORGANIZATION_BANK_ID || undefined,
    defaultWalletId: process.env.OSN_DEFAULT_WALLET_ID || undefined,
    defaultRecipientId: process.env.OSN_DEFAULT_RECIPIENT_ID || undefined,
    defaultCurrencyCode: (process.env.OSN_DEFAULT_CURRENCY_CODE || 'USDC').trim().toUpperCase(),
    defaultChainId: process.env.OSN_DEFAULT_CHAIN_ID,
  };
}

/**
 * Resolves OSN runtime defaults for TruMarket business logic.
 *
 * **Primary (when `ADMIN_DASHBOARD_URL` + `ADMIN_DASHBOARD_INTERNAL_TOKEN` are set):**
 * `GET /api/internal/settings/osn-runtime` on admin-dashboard (Mongo on admin host + env fallbacks there).
 *
 * **Legacy fallback** (no admin URL/token, e.g. local dev): TruMarket Mongo `TruMarketSettings` (provider OSN)
 * + TruMarket process env (`OSN_*`).
 */
@Injectable()
export class OsnRuntimeSettingsService {
  private readonly log = new Logger(OsnRuntimeSettingsService.name);
  private cache: { value: OsnRuntimeSettingsResolved; at: number } | null = null;
  private readonly cacheTtlMs = 30_000;

  constructor(
    @Inject(providers.TruMarketSettingsRepository)
    private readonly settings: TruMarketSettingsRepository,
    private readonly adminDashboardOsnRuntime: AdminDashboardOsnRuntimeService,
  ) {}

  async getOsnRuntimeSettings(): Promise<OsnRuntimeSettingsResolved> {
    const now = Date.now();
    if (this.cache && now - this.cache.at < this.cacheTtlMs) {
      return this.cache.value;
    }

    const useAdminDashboard =
      !!(config.adminDashboardUrl?.trim() && config.adminDashboardInternalToken);

    if (useAdminDashboard) {
      const resolved = await this.adminDashboardOsnRuntime.fetchOsnRuntimeSettings();
      this.cache = { value: resolved, at: now };
      return resolved;
    }

    this.log.debug('OSN runtime: using TruMarket local Mongo + env (admin-dashboard URL/token not set)');

    const fallback = envFallback();
    const doc = await this.settings.findOne(
      { provider: TruMarketSettingsProvider.OSN } as any,
    );

    if (!doc) {
      this.cache = { value: fallback, at: now };
      return fallback;
    }

    const resolved: OsnRuntimeSettingsResolved = {
      organizationId: doc.organizationId || fallback.organizationId,
      defaultOrganizationBankId:
        doc.defaultOrganizationBankId || fallback.defaultOrganizationBankId,
      defaultWalletId: doc.defaultWalletId || fallback.defaultWalletId,
      defaultRecipientId: doc.defaultRecipientId || fallback.defaultRecipientId,
      defaultCurrencyCode:
        doc.defaultCurrencyCode || fallback.defaultCurrencyCode,
      defaultChainId: doc.defaultChainId || fallback.defaultChainId,
    };

    this.cache = { value: resolved, at: now };
    return resolved;
  }

  async upsertOsnRuntimeSettings(
    input: Partial<Omit<TruMarketSettings, 'id' | 'provider'>>,
  ): Promise<TruMarketSettings> {
    const now = new Date();

    const normalized: Partial<TruMarketSettings> = {
      organizationId: input.organizationId || undefined,
      defaultOrganizationBankId:
        input.defaultOrganizationBankId || undefined,
      defaultWalletId: input.defaultWalletId || undefined,
      defaultRecipientId: input.defaultRecipientId || undefined,
      defaultCurrencyCode: input.defaultCurrencyCode || undefined,
      defaultChainId:
        input.defaultChainId !== undefined && input.defaultChainId !== ''
          ? input.defaultChainId
          : undefined,
      updatedAt: now,
      createdAt: now,
    };

    const existing = await this.settings.findOne(
      { provider: TruMarketSettingsProvider.OSN } as any,
    );

    if (!existing) {
      const created = await this.settings.create({
        provider: TruMarketSettingsProvider.OSN,
        ...normalized,
      });
      this.cache = null;
      return created;
    }

    const updated = await this.settings.updateById(existing.id, {
      ...normalized,
      updatedAt: now,
    } as any);

    if (!updated) {
      throw new InternalServerError('Failed to update OSN runtime settings');
    }

    this.cache = null;
    return updated;
  }
}