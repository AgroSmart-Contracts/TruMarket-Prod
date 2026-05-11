import type { OsnFeeQuoteData } from 'src/interfaces/osnFeeQuote';

const round2 = (n: number): number => Math.round(n * 100) / 100;

type BuyerFeePolicy = 'buyer' | 'shared' | 'supplier' | 'custom';

export const getBuyerFeePolicy = (buyerFeePercent: number): BuyerFeePolicy => {
  if (buyerFeePercent <= 0) return 'supplier';
  if (buyerFeePercent >= 100) return 'buyer';
  if (buyerFeePercent === 50) return 'shared';
  return 'custom';
};

/**
 * User-facing TruMarket fee: partner fee + TM fee.
 * We derive this from totalFee minus OSN fee so users do not see partner splits.
 */
export const getUserVisibleTruMarketFee = (quote: OsnFeeQuoteData): number =>
  round2(Math.max(0, quote.totalFee - quote.osnFee));

export const getBuyerPayableTotal = (quote: OsnFeeQuoteData): number => {
  const paymentAmount = quote.paymentAmount;
  const userVisibleTmFee = getUserVisibleTruMarketFee(quote);
  const policy = getBuyerFeePolicy(quote.buyerFeePercent);

  if (policy === 'supplier') return round2(paymentAmount);
  if (policy === 'shared') return round2(paymentAmount + userVisibleTmFee / 2);
  if (policy === 'buyer') return round2(paymentAmount + userVisibleTmFee);

  // Fallback for non-standard percentages.
  return round2(paymentAmount + (userVisibleTmFee * quote.buyerFeePercent) / 100);
};
