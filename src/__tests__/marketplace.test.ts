import { describe, it, expect } from "vitest";

  const PLATFORM_FEE_PERCENT = 5;
  const BUYER_FEE_PERCENT = 3;

  function calculateFees(priceCents: number) {
    const sellerFeeCents = Math.round(priceCents * (PLATFORM_FEE_PERCENT / 100));
    const buyerFeeCents = Math.round(priceCents * (BUYER_FEE_PERCENT / 100));
    const totalCents = priceCents + buyerFeeCents;
    const applicationFeeCents = sellerFeeCents + buyerFeeCents;
    const sellerReceivesCents = priceCents - sellerFeeCents;
    return { sellerFeeCents, buyerFeeCents, totalCents, applicationFeeCents, sellerReceivesCents };
  }

  function getMinBidIncrement(currentBid: number): number {
    if (currentBid < 1000) return 10;
    if (currentBid < 5000) return 100;
    if (currentBid < 10000) return 250;
    if (currentBid < 50000) return 500;
    return 1000;
  }

  const PROHIBITED_TERMS = [
    "bootleg","knockoff","replica","fake","counterfeit",
    "unauthorized","pirated","copy","duplicate","imitation",
    "reproduction","clone","forgery",
  ];

  const COPYRIGHT_FLAGS = [
    "Toei Animation","Sunrise","watermark","Bandai","Studio Ghibli",
    "Nintendo","Disney","Marvel",
  ];

  function scanText(title: string, description: string) {
    const combined = `${title} ${description}`.toLowerCase();
    const matched: string[] = [];
    for (const term of PROHIBITED_TERMS) {
      if (combined.includes(term.toLowerCase())) matched.push(term);
    }
    for (const flag of COPYRIGHT_FLAGS) {
      if (combined.includes(flag.toLowerCase())) matched.push(flag);
    }
    if (matched.length === 0) {
      return { status: "clear", confidence: 0.95, matchedTerms: [], reason: "No prohibited content detected" };
    }
    const severity = matched.some((m) =>
      PROHIBITED_TERMS.slice(0, 10).some((p) => p.toLowerCase() === m.toLowerCase())
    ) ? "rejected" : "flagged";
    const confidence = Math.min(0.99, 0.6 + matched.length * 0.08);
    const reason = `Matched: ${matched.slice(0, 5).join(", ")}${matched.length > 5 ? ` +${matched.length - 5} more` : ""}`;
    return { status: severity, confidence, matchedTerms: matched, reason };
  }

  function getRequiredDeposit(startPrice: number): number {
    return Math.min(Math.max(Math.round(startPrice * 0.05), 500), 10000);
  }

  function isValidBid(currentBid: number, newBid: number): boolean {
    return newBid >= currentBid + getMinBidIncrement(currentBid);
  }

  describe("Fee Calculation", () => {
    it("calculates exact fees for a $100 item", () => {
      const result = calculateFees(10000);
      expect(result.sellerFeeCents).toBe(500);
      expect(result.buyerFeeCents).toBe(300);
      expect(result.totalCents).toBe(10300);
      expect(result.applicationFeeCents).toBe(800);
      expect(result.sellerReceivesCents).toBe(9500);
    });

    it("returns all zeros for a free item", () => {
      const result = calculateFees(0);
      expect(result.sellerFeeCents).toBe(0);
      expect(result.buyerFeeCents).toBe(0);
      expect(result.totalCents).toBe(0);
      expect(result.sellerReceivesCents).toBe(0);
    });

    it("rounds fees correctly for a $9.99 item", () => {
      const result = calculateFees(999);
      expect(result.sellerFeeCents).toBe(50);
      expect(result.buyerFeeCents).toBe(30);
      expect(result.totalCents).toBe(1029);
      expect(result.applicationFeeCents).toBe(80);
      expect(result.sellerReceivesCents).toBe(949);
    });

    it("handles a $1,000,000 item", () => {
      const result = calculateFees(100_000_000);
      expect(result.sellerFeeCents).toBe(5_000_000);
      expect(result.buyerFeeCents).toBe(3_000_000);
      expect(result.totalCents).toBe(103_000_000);
      expect(result.sellerReceivesCents).toBe(95_000_000);
    });

    it("maintains invariant: sellerReceives + applicationFee === price", () => {
      for (const price of [0, 1, 100, 999, 10000, 99999, 100_000_000]) {
        const { sellerReceivesCents, applicationFeeCents } = calculateFees(price);
        expect(sellerReceivesCents + applicationFeeCents).toBe(price);
      }
    });

    it("handles 1 cent correctly", () => {
      const result = calculateFees(1);
      expect(result.sellerFeeCents).toBe(0);
      expect(result.buyerFeeCents).toBe(0);
      expect(result.sellerReceivesCents).toBe(1);
    });
  });

  describe("Bid Increment Rules", () => {
    it("returns $0.10 for bids below $10", () => {
      expect(getMinBidIncrement(0)).toBe(10);
      expect(getMinBidIncrement(999)).toBe(10);
    });

    it("returns $1.00 for bids $10 to $49.99", () => {
      expect(getMinBidIncrement(1000)).toBe(100);
      expect(getMinBidIncrement(4999)).toBe(100);
    });

    it("returns $2.50 for bids $50 to $99.99", () => {
      expect(getMinBidIncrement(5000)).toBe(250);
      expect(getMinBidIncrement(9999)).toBe(250);
    });

    it("returns $5.00 for bids $100 to $499.99", () => {
      expect(getMinBidIncrement(10000)).toBe(500);
      expect(getMinBidIncrement(49999)).toBe(500);
    });

    it("returns $10.00 for bids $500 and above", () => {
      expect(getMinBidIncrement(50000)).toBe(1000);
      expect(getMinBidIncrement(1_000_000)).toBe(1000);
    });

    it("accepts a bid meeting the minimum increment", () => {
      expect(isValidBid(5000, 5100)).toBe(true);
      expect(isValidBid(1000, 1100)).toBe(true);
    });

    it("rejects a bid below the minimum increment", () => {
      expect(isValidBid(5000, 5050)).toBe(false);
      expect(isValidBid(1000, 1050)).toBe(false);
    });

    it("rejects a bid equal to the current bid", () => {
      expect(isValidBid(5000, 5000)).toBe(false);
    });
  });

  describe("Copyright Scanning", () => {
    it("clears a legitimate listing", () => {
      const result = scanText("Genuine Naruto Figure", "Official licensed merchandise from Japan");
      expect(result.status).toBe("clear");
      expect(result.matchedTerms).toHaveLength(0);
    });

    it("rejects a listing with prohibited language", () => {
      const result = scanText("Fake Dragon Ball Figure", "High quality replica");
      expect(result.status).toBe("rejected");
      expect(result.matchedTerms).toContain("fake");
      expect(result.matchedTerms).toContain("replica");
    });

    it("flags a listing referencing copyright holders", () => {
      const result = scanText("Bandai card collection", "Full set with watermark intact");
      expect(["flagged", "rejected"]).toContain(result.status);
    });

    it("is case-insensitive", () => {
      const result = scanText("COUNTERFEIT Pokemon Card", "BOOTLEG quality");
      expect(result.status).toBe("rejected");
    });

    it("returns clear status with high confidence for a clean listing", () => {
      const result = scanText("Handmade crochet Totoro plush", "Made with love, no official affiliation");
      expect(result.status).toBe("clear");
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    it("increases confidence with more matched terms", () => {
      const one = scanText("fake item", "description");
      const two = scanText("fake knockoff item", "description");
      expect(two.confidence).toBeGreaterThanOrEqual(one.confidence);
    });
  });

  describe("Auction Deposit Requirements", () => {
    it("calculates 5% deposit for a standard item", () => {
      expect(getRequiredDeposit(10000)).toBe(500);
    });

    it("enforces a minimum deposit of $5.00 (500 cents)", () => {
      expect(getRequiredDeposit(0)).toBe(500);
      expect(getRequiredDeposit(100)).toBe(500);
      expect(getRequiredDeposit(9999)).toBe(500);
    });

    it("enforces a maximum deposit of $100.00 (10000 cents)", () => {
      expect(getRequiredDeposit(1_000_000)).toBe(10000);
      expect(getRequiredDeposit(500_000)).toBe(10000);
      expect(getRequiredDeposit(200_001)).toBe(10000);
    });

    it("calculates correctly at $500 item value", () => {
      expect(getRequiredDeposit(50000)).toBe(2500);
    });

    it("deposit is always within the allowed range for any price", () => {
      for (const price of [0, 1, 100, 500, 1000, 5000, 10000, 100000, 1_000_000]) {
        const deposit = getRequiredDeposit(price);
        expect(deposit).toBeGreaterThanOrEqual(500);
        expect(deposit).toBeLessThanOrEqual(10000);
      }
    });
  });
  