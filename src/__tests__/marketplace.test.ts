import { describe, it, expect } from "vitest";
import { calculateMarketplaceFees } from "../../api/lib/platform-fees";
import { getMinBidIncrement, getRequiredDeposit, isValidBid } from "../../api/lib/auction-engine";
import { scanListingText } from "../../api/lib/copyright-bot";

describe("Fee Calculation", () => {
  it("calculates exact fees for a $100 item", () => {
    const result = calculateMarketplaceFees(10000);
    expect(result.sellerFeeCents).toBe(500);
    expect(result.buyerFeeCents).toBe(300);
    expect(result.totalCents).toBe(10300);
    expect(result.applicationFeeCents).toBe(800);
    expect(result.sellerReceivesCents).toBe(9500);
  });

  it("returns all zeros for a free item", () => {
    const result = calculateMarketplaceFees(0);
    expect(result.sellerFeeCents).toBe(0);
    expect(result.buyerFeeCents).toBe(0);
    expect(result.totalCents).toBe(0);
    expect(result.sellerReceivesCents).toBe(0);
  });

  it("rounds fees correctly for a $9.99 item", () => {
    const result = calculateMarketplaceFees(999);
    expect(result.sellerFeeCents).toBe(50);
    expect(result.buyerFeeCents).toBe(30);
    expect(result.totalCents).toBe(1029);
    expect(result.applicationFeeCents).toBe(80);
    expect(result.sellerReceivesCents).toBe(949);
  });

  it("maintains invariant: sellerReceives + sellerFee === price", () => {
    for (const price of [0, 1, 100, 999, 10000, 99999, 100_000_000]) {
      const { sellerReceivesCents, sellerFeeCents } = calculateMarketplaceFees(price);
      expect(sellerReceivesCents + sellerFeeCents).toBe(price);
    }
  });
});

describe("Bid Increment Rules", () => {
  it("returns $0.10 for bids below $10", () => {
    expect(getMinBidIncrement(0)).toBe(10);
    expect(getMinBidIncrement(999)).toBe(10);
  });

  it("accepts a bid meeting the minimum increment", () => {
    expect(isValidBid(5000, 5250)).toBe(true);
    expect(isValidBid(1000, 1100)).toBe(true);
  });

  it("rejects a bid below the minimum increment", () => {
    expect(isValidBid(5000, 5050)).toBe(false);
    expect(isValidBid(1000, 1050)).toBe(false);
  });
});

describe("Copyright Scanning", () => {
  it("clears a legitimate listing", () => {
    const result = scanListingText("Genuine Naruto Figure", "Official licensed merchandise from Japan");
    expect(result.status).toBe("clear");
    expect(result.matchedTerms).toHaveLength(0);
  });

  it("rejects a listing with prohibited language", () => {
    const result = scanListingText("Fake Dragon Ball Figure", "High quality replica");
    expect(result.status).toBe("rejected");
    expect(result.matchedTerms).toContain("fake");
    expect(result.matchedTerms).toContain("replica");
  });

  it("flags a listing referencing copyright holders", () => {
    const result = scanListingText("Bandai card collection", "Full set sample preview not for sale");
    expect(["flagged", "rejected"]).toContain(result.status);
  });
});

describe("Auction Deposit Requirements", () => {
  it("calculates 5% deposit for a standard item", () => {
    expect(getRequiredDeposit(10000)).toBe(500);
  });

  it("enforces deposit bounds", () => {
    expect(getRequiredDeposit(0)).toBe(500);
    expect(getRequiredDeposit(1_000_000)).toBe(10000);
  });
});
