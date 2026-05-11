/**
 * Normalized `data` from admin-dashboard `POST /api/internal/osn/fee-quote`
 * (via TruMarket `POST /payments/osn/fee-quote`). All money fields are rounded on the server;
 * do not recompute splits or totals in the browser.
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
