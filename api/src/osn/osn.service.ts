import { Injectable } from '@nestjs/common';

import { InternalServerError } from '@/errors';
import { OsnClient } from './osn.client';
import {
  OsnMintRequestPayload,
  OsnMintRequestResponse,
  OsnMintRequestResult,
  OsnMintVetSettlementRequestPayload,
  OsnMintVetSettlementRequestResponse,
  OsnMintVetSettlementRequestResult,
  OsnOrganizationBankCreateRequest,
  OsnOrganizationBank,
  OsnPaymentHistoryStatusResponse,
  OsnRecipient,
  OsnOrganizationWallet,
} from './osn.types';
import { OsnOrganizationBankCreateResult } from './osn.types';
import {
  mapBankAccountCreateToOsnPayload,
  mapPaymentToOsnMintRequest,
} from './osn.mapper';
import { Payment } from '@/payments/payments.entities';

@Injectable()
export class OsnService {
  private readonly client: OsnClient;

  constructor() {
    this.client = new OsnClient();
  }

  async createOrganizationBankAccount(input: {
    organizationId: string;
    bank: {
      currencyCode: string;
      countryCode: string;
      bankName: string;
      accountHolderName: string;
      accountNumberPlain: string;
      swiftBic: string;
      ibanPlain?: string;
      routingNumber?: string;
      bankAddress?: string;
      accountHolderAddress?: string;
    };
  }): Promise<OsnOrganizationBankCreateResult> {
    const payload: OsnOrganizationBankCreateRequest = mapBankAccountCreateToOsnPayload({
      organizationId: input.organizationId,
      bank: {
        currencyCode: input.bank.currencyCode,
        countryCode: input.bank.countryCode,
        bankName: input.bank.bankName,
        accountHolderName: input.bank.accountHolderName,
        accountNumberPlain: input.bank.accountNumberPlain,
        swiftBic: input.bank.swiftBic,
        ibanPlain: input.bank.ibanPlain,
        routingNumber: input.bank.routingNumber,
        bankAddress: input.bank.bankAddress,
        accountHolderAddress: input.bank.accountHolderAddress,
        settlementAccountHolderAddress: input.bank.accountHolderAddress,
      } as any,
    } as any);

    if (!payload.organization_id) {
      throw new InternalServerError('OSN organization_id is not configured');
    }

    const response = await this.client.post<OsnOrganizationBank>(
      '/users/me/organization-banks',
      payload,
    );

    return { request: payload, response };
  }

  async listOrganizationBanks(options?: {
    active?: boolean;
    organizationId?: string;
  }): Promise<OsnOrganizationBank[]> {
    const query =
      options?.active === undefined && !options?.organizationId
        ? undefined
        : {
            active: options?.active,
            organization_id: options?.organizationId,
          };
    const response = await this.client.get<OsnOrganizationBank[]>('/users/me/organization-banks', query);
    return response;
  }

  async listRecipients(): Promise<{ data: OsnRecipient[] } | OsnRecipient[]> {
    // OSN docs show { data: [...] }
    const response = await this.client.get<any>('/users/me/recipients');
    return response;
  }

  async listOrganizationWallets(): Promise<{ wallets: OsnOrganizationWallet[] } | OsnOrganizationWallet[]> {
    const response = await this.client.get<any>('/users/me/wallets/organization');
    return response;
  }

  async createMintRequest(input: {
    payment: Payment;
    organizationBankId: string;
    chainId: string;
    defaultCurrencyCode: string;
    destination: { walletId?: string; recipientId?: string };
    memo?: string;
  }): Promise<OsnMintRequestResult> {
    const payload: OsnMintRequestPayload = mapPaymentToOsnMintRequest({
      payment: input.payment,
      organizationBankId: input.organizationBankId,
      chainId: input.chainId,
      defaultCurrencyCode: input.defaultCurrencyCode,
      destination: input.destination,
      memo: input.memo,
    });

    const response = await this.client.post<OsnMintRequestResponse>(
      '/users/me/minting/request',
      payload,
    );

    return { request: payload, response };
  }

  async submitMintRequest(input: {
    settlementRequestId: string;
    bankTxNumber: string;
  }): Promise<any> {
    // OSN gateway expects POST for submit in this environment.
    return this.client.post<any>('/users/me/minting/submit', {
      settlement_request_id: input.settlementRequestId,
      bank_tx_number: input.bankTxNumber,
    });
  }

  async getPaymentHistoryStatus(paymentId: string): Promise<OsnPaymentHistoryStatusResponse> {
    return this.client.get<OsnPaymentHistoryStatusResponse>(
      `/payment-histories/status/${encodeURIComponent(paymentId)}`,
    );
  }

  async vetSettlementRequest(input: {
    settlementRequestId: string;
    approveOrReject: 'approved' | 'rejected';
    comments?: string;
  }): Promise<OsnMintVetSettlementRequestResult> {
    const payload: OsnMintVetSettlementRequestPayload = {
      settlement_request_id: input.settlementRequestId,
      approve_or_reject: input.approveOrReject,
      comments: input.comments,
    };

    const response = await this.client.post<OsnMintVetSettlementRequestResponse>(
      '/users/me/minting/vet-settlement-request',
      payload,
    );

    return { request: payload, response };
  }
}

