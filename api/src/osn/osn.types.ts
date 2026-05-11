export type OsnOrganizationBankCreateRequest = {
  organization_id: string;
  currency_code: string;
  settlement_bank_name: string;
  settlement_account_number: string;
  settlement_routing_number?: string;
  settlement_account_holder_name: string;
  settlement_swift_bic: string;
  settlement_iban?: string;
  is_active?: boolean;
  address?: string;
  account_holder_address?: string;
  country_code: string;
};

export type OsnOrganizationBankCreateResponse = {
  organization_id: string;
  currency_code: string;
  settlement_bank_name: string;
  settlement_account_number: string;
  settlement_routing_number: string;
  settlement_account_holder_name: string;
  settlement_swift_bic: string;
  settlement_iban: string;
  is_active: boolean;
  address: string;
  account_holder_address: string;
  country_code: string;
  id: string;
  created_at: string;
  updated_at: string;
};

export type OsnOrganizationBankCreateResult = {
  request: OsnOrganizationBankCreateRequest;
  response: OsnOrganizationBankCreateResponse;
};

export type OsnOrganizationBank = {
  organization_id: string;
  currency_code: string;
  settlement_bank_name: string;
  settlement_account_number: string;
  settlement_routing_number: string;
  settlement_account_holder_name: string;
  settlement_swift_bic: string;
  settlement_iban: string;
  is_active: boolean;
  address: string;
  account_holder_address: string;
  country_code: string;
  id: string;
  created_at: string;
  updated_at: string;
};

export type OsnRecipient = {
  id: string;
  chain_id: string;
  address: string;
  status: string;
};

export type OsnOrganizationWallet = {
  id: string;
  chain_id: string;
  organization_id: string;
  type: string;
  address: string;
  wallet_provider: string;
  status: string;
  default_wallet?: boolean;
};

export type OsnMintRequestPayload = {
  amount: string;
  currency: string;
  destination: {
    wallet_id?: string;
    recipient_id?: string;
    chain_id: string;
  };
  organization_bank_id: string;
  memo?: string;
  file_details?: Array<{
    file_name: string;
    file_type: string;
  }>;
  purpose?: string;
  remittance_info?: string;
};

export type OsnMintRequestResponse = {
  created_at: string;
  updated_at: string;
  mint_request_id: string;
  initiated_by_user_id: string;
  status: string;
  minter_id: string;
  minter_name: string;
  amount: string;
  currency_code: string;
  destination: {
    wallet_id?: string | null;
    recipient_id?: string | null;
    address?: string;
    chain_id: string;
  };
  deposit_instructions: any;
  estimated_fees: any;
  request_type: string;
  file_upload_urls: string[] | null;
  memo: string | null;
  payment_id: string;
  pay_in_bank_details: any;
  [key: string]: any;
};

export type OsnMintSubmitResponse = unknown;

export type OsnMintVetSettlementRequestPayload = {
  settlement_request_id: string;
  approve_or_reject: 'approved' | 'rejected';
  comments?: string;
};

export type OsnMintVetSettlementRequestResponse = {
  status?: string;
  [key: string]: any;
};

export type OsnMintRequestResult = {
  request: OsnMintRequestPayload;
  response: OsnMintRequestResponse;
};

export type OsnMintVetSettlementRequestResult = {
  request: OsnMintVetSettlementRequestPayload;
  response: OsnMintVetSettlementRequestResponse;
};

/** `GET /api/v4/payment-histories/status/{payment_id}` */
export type OsnPaymentHistoryStatusResponse = {
  payment_id: string;
  payment_type?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string;
};

