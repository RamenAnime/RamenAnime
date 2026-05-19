export const PLATFORM_FEE_PERCENT = 5;
export const BUYER_FEE_PERCENT = 3;

export type MarketplaceFeeBreakdown = {
  sellerFeeCents: number;
  buyerFeeCents: number;
  totalCents: number;
  applicationFeeCents: number;
  sellerReceivesCents: number;
};

export function calculateMarketplaceFees(priceCents: number): MarketplaceFeeBreakdown {
  const sellerFeeCents = Math.round(priceCents * (PLATFORM_FEE_PERCENT / 100));
  const buyerFeeCents = Math.round(priceCents * (BUYER_FEE_PERCENT / 100));
  const totalCents = priceCents + buyerFeeCents;
  const applicationFeeCents = sellerFeeCents + buyerFeeCents;
  const sellerReceivesCents = priceCents - sellerFeeCents;
  return { sellerFeeCents, buyerFeeCents, totalCents, applicationFeeCents, sellerReceivesCents };
}
