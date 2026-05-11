/** Resolved OSN defaults used by mint, bank OSN create, etc. */
export type OsnRuntimeSettingsResolved = {
  organizationId: string;
  defaultOrganizationBankId?: string;
  defaultWalletId?: string;
  defaultRecipientId?: string;
  defaultCurrencyCode: string;
  defaultChainId: string;
};
