export enum TruMarketSettingsProvider {
  OSN = 'OSN',
}

/**
 * Global (TruMarket-wide) runtime defaults used to build OSN payloads.
 *
 * Source of truth:
 * - Admin sets these values via settings endpoint -> stored in DB.
 * - If DB is empty, we fall back to env vars.
 */
export class TruMarketSettings {
  id: string;

  provider: TruMarketSettingsProvider;

  organizationId?: string;
  defaultOrganizationBankId?: string;
  defaultWalletId?: string;
  defaultRecipientId?: string;
  defaultCurrencyCode?: string;
  defaultChainId?: string;

  createdAt?: Date;
  updatedAt?: Date;
}
