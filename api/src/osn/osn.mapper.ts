import { BankAccount } from '@/bank-accounts/bank-accounts.entities';
import { Payment } from '@/payments/payments.entities';
import { OsnOrganizationBankCreateRequest, OsnMintRequestPayload } from './osn.types';

export function mapBankAccountCreateToOsnPayload(input: {
  organizationId: string;
  bank: {
    currencyCode: string;
    countryCode: string;
    bankName: string;
    accountHolderName: string;
    accountNumberEncrypted?: string;
    swiftBic: string;
    ibanEncrypted?: string;
    routingNumber?: string;
    bankAddress?: string;
    accountHolderAddress?: string;
    settlementAccountHolderAddress?: string;
    // plain values needed for OSN calls
    accountNumberPlain: string;
    ibanPlain?: string;
  };
}): OsnOrganizationBankCreateRequest {
  // OSN expects settlement_... naming. We map TruMarket normalized names.
  return {
    organization_id: input.organizationId,
    currency_code: input.bank.currencyCode,
    settlement_bank_name: input.bank.bankName,
    settlement_account_number: input.bank.accountNumberPlain,
    settlement_routing_number: input.bank.routingNumber,
    settlement_account_holder_name: input.bank.accountHolderName,
    settlement_swift_bic: input.bank.swiftBic,
    settlement_iban: input.bank.ibanPlain,
    is_active: false, // keep inactive until OSN approves the creation request
    address: input.bank.bankAddress,
    account_holder_address:
      input.bank.accountHolderAddress || input.bank.settlementAccountHolderAddress,
    country_code: input.bank.countryCode,
  };
}

export function mapOsnBankCreateResponseToBankAccount(input: {
  providerPayload: any;
  osnResponse: any;
}): Partial<BankAccount> {
  const r = input.osnResponse;
  return {
    providerAccountId: r.id,
    providerOrganizationId: r.organization_id,
    currencyCode: r.currency_code,
    countryCode: r.country_code,
    bankName: r.settlement_bank_name,
    accountHolderName: r.settlement_account_holder_name,
    swiftBic: r.settlement_swift_bic,
    archived: false,
    isActive: r.is_active,
    status: r.is_active ? 'ACTIVE' : 'PENDING_APPROVAL',
    providerPayload: input.providerPayload,
  } as any;
}

export function mapPaymentToOsnMintRequest(input: {
  payment: Payment;
  organizationBankId: string;
  chainId: string;
  defaultCurrencyCode: string;
  destination: {
    walletId?: string;
    recipientId?: string;
  };
  memo?: string;
}): OsnMintRequestPayload {
  const { payment, organizationBankId, chainId, defaultCurrencyCode, destination, memo } = input;

  // OSN expects stablecoin. If payment currency isn't supported, fall back to OSN default.
  // For now we keep this simple and can refine using a proper map later.
  const currencyUpper = (payment.currency || '').toUpperCase();
  const currency =
    currencyUpper === 'USDC' || currencyUpper === 'USDT'
      ? currencyUpper
      : defaultCurrencyCode;

  const destinationPayload: any = {
    chain_id: chainId,
  };
  if (destination.walletId) destinationPayload.wallet_id = destination.walletId;
  if (destination.recipientId) destinationPayload.recipient_id = destination.recipientId;

  return {
    /** String per OSN; some stacks use smallest-unit integers as strings (see OSN docs / OsnClient logs). */
    amount: String(payment.amount),
    currency,
    destination: destinationPayload,
    organization_bank_id: organizationBankId,
    memo: memo || payment.invoiceNumber || undefined,
    // optional fields can be added later (purpose, remittance_info, file_details)
  };
}

