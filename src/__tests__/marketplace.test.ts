// Marketplace core logic tests — fee calc, bid increments, copyright scan, deposit logic
import { describe, it, expect } from "vitest";

// ─── Helpers under test (normally imported from router modules) ───

const PLATFORM_FEE_PERCENT = 5;
const BUYER_FEE_PERCENT = 3;

function calculateFees(priceCents: number) {
  const sellerFeeCents = Math.round(priceCents * (PLATFORM_FEE_PERCENT / 100));
  const buyerFeeCents = Math.round(priceCents * (BUYER_FEE_PERCENT / 100));
  const totalCents = priceCents + buyerFeeCents;
  const applicationFeeCents = sellerFeeCents + buyerFeeCents;
  const sellerReceivesCents = priceCents - sellerFeeCents;
  return {
    sellerFeeCents,
    buyerFeeCents,
    totalCents,
    applicationFeeCents,
    sellerReceivesCents,
  };
}

function getMinBidIncrement(currentBid: number): number {
  if (currentBid < 1000) return 10;
  if (currentBid < 5000) return 100;
  if (currentBid < 10000) return 250;
  if (currentBid < 50000) return 500;
  return 1000;
}

const PROHIBITED_TERMS = [
  "bootleg",
  "knockoff",
  "replica",
  "fake",
  "counterfeit",
  "unauthorized",
  "pirated",
  "copy",
  "duplicate",
  "imitation",
  "reproduction",
  "clone",
  "forgery",
];

const COPYRIGHT_FLAGS = [
  "Toei Animation",
  "Sunrise",
  "watermark",
  "Bandai",
  "Studio Ghibli",
  "Nintendo",
  "Disney",
  "Marvel",
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
    return {
      status: "clear",
      confidence: 0.95,
      matchedTerms: [],
      reason: "No prohibited content detected",
    };
  }
  const severity = matched.some((m) =>
    PROHIBITED_TERMS.slice(0, 10).some(
      (p) => p.toLowerCase() === m.toLowerCase()
    )
  )
    ? "rejected"
    : "flagged";
  const confidence = Math.min(0.99, 0.6 + matched.length * 0.08);
  const reason = `Matched: ${matched.slice(0, 5).join(", ")}${
    matched.length > 5 ? ` +${matched.length - 5} more` : ""
  }`;
  return {
    status: severity,
    confidence,
    matchedTerms: matched,
    reason,
  };
}

function getRequiredDeposit(startPrice: number): number {
  return Math.min(Math.max(Math.round(startPrice * 0.05), 500), 10000);
}

// ─── Tests ───

describe("Fee Calculation", () => {
  it("calculates exact fees for $100 item (10000 cents)", () => {
    const result = calculateFees(10000);
    expect(result.sellerFeeCents).toBe(500); // 5%
    expect(result.buyerFeeCents).toBe(300); // 3%
    expect(result.totalCents).toBe(10300); // price + buyer fee
    expect(result.applicationFeeCents).toBe(800); // 500 + 300
    expect(result.sellerReceivesCents).toBe(9500); // 10000 - 500
  });

  it("returns all zeros for $0 item", () => {
    const result = calculateFees(0);
    expect(result.sellerFeeCents).toBe(0);
    expect(result.buyerFeeCents).toBe(0);
    expect(result.totalCents).toBe(0);
    expect(result.applicationFeeCents).toBe(0);
    expect(result.sellerReceivesCents).toBe(0);
  });

  it("handles $9.99 item (999 cents) rounding correctly", () => {
    const result = calculateFees(999);
    expect(result.sellerFeeCents).toBe(Math.round(999 * 0.05));
    expect(result.buyerFeeCents).toBe(Math.round(999 * 0.03));
    expect(result.sellerFeeCents).toBe(50);
    expect(result.buyerFeeCents).toBe(30);
    expect(result.totalCents).toBe(1029); // 999 + 30
    expect(result.applicationFeeCents).toBe(80); // 50 + 30
    expect(result.sellerReceivesCents).toBe(949); // 999 - 50
  });

  it("handles large $1,000,000 item (100,000,000 cents)", () => {
    const result = calculateFees(100_000_000);
    expect(result.sellerFeeCents).toBe(5_000_000);
    expect(result.buyerFeeCents).toBe(3_000_000);
    expect(result.totalCents).toBe(103_000_000);
    expect(result.applicationFeeCents).toBe(8_000_000);
    expect(result.sellerReceivesCents).toBe(95_000_000);
  });

  it("maintains invariant: sellerReceives + applicationFeeCents === priceCents", () => {
    const prices = [0, 1, 100, 999, 10000, 99999, 100000000];
    for (const price of prices) {
      const { sellerReceivesCents, applicationFeeCents } = calculateFees(price);
      expect(sellerReceivesCents + applicationFeeCents).toBe(price);
    }
  });

  it("handles 1 cent item correctly", () => {
    const result = calculateFees(1);
    expect(result.sellerFeeCents).toBe(0); // Math.round(0.05)
    expect(result.buyerFeeCents).toBe(0); // Math.round(0.03)
    expect(result.sellerReceivesCents).toBe(1);
    expect(result.totalCents).toBe(1);
  });

  it("handles negative price as edge case (math still consistent)", () => {
    const result = calculateFees(-1000);
    expect(result.sellerFeeCents).toBe(-50);
    expect(result.buyerFeeCents).toBe(-30);
    expect(result.sellerReceivesCents + result.applicationFeeCents).toBe(-1000);
  });
});

describe("Bid Increment Rules", () => {
  it("returns $10 for bids below $1,000", () => {
    expect(getMinBidIncrement(0)).toBe(10);
    expect(getMinBidIncrement(1)).toBe(10);
    expect(getMinBidIncrement(500)).toBe(10);
    expect(getMinBidIncrement(999)).toBe(10);
  });

  it("returns $100 for bids from $1,000 up to $4,999", () => {
    expect(getMinBidIncrement(1000)).toBe(100);
    expect(getMinBidIncrement(2500)).toBe(100);
    expect(getMinBidIncrement(4999)).toBe(100);
  });

  it("returns $250 for bids from $5,000 up to $9,999", () => {
    expect(getMinBidIncrement(5000)).toBe(250);
    expect(getMinBidIncrement(7500)).toBe(250);
    expect(getMinBidIncrement(9999)).toBe(250);
  });

  it("returns $500 for bids from $10,000 up to $49,999", () => {
    expect(getMinBidIncrement(10000)).toBe(500);
    expect(getMinBidIncrement(25000)).toBe(500);
    expect(getMinBidIncrement(49999)).toBe(500);
  });

  it("returns $1,000 for bids $50,000 and above", () => {
    expect(getMinBidIncrement(50000)).toBe(1000);
    expect(getMinBidIncrement(100000)).toBe(1000);
    expect(getMinBidIncrement(1000000)).toBe(1000);
  });

  it("handles exact boundary values correctly", () => {
    expect(getMinBidIncrement(999)).toBe(10);
    expect(getMinBidIncrement(1000)).toBe(100);
    expect(getMinBidIncrement(4999)).toBe(100);
    expect(getMinBidIncrement(5000)).toBe(250);
    expect(getMinBidIncrement(9999)).toBe(250);
    expect(getMinBidIncrement(10000)).toBe(500);
    expect(getMinBidIncrement(49999)).toBe(500);
    expect(getMinBidIncrement(50000)).toBe(1000);
  });

  it("handles negative bid as edge case", () => {
    expect(getMinBidIncrement(-1)).toBe(10);
    expect(getMinBidIncrement(-1000)).toBe(10);
  });
});

describe("Copyright Text Scanner", () => {
  it('returns "clear" for clean text with confidence 0.95', () => {
    const result = scanText("Vintage Watch", "A beautiful vintage timepiece from the 1960s");
    expect(result.status).toBe("clear");
    expect(result.confidence).toBe(0.95);
    expect(result.matchedTerms).toEqual([]);
    expect(result.reason).toBe("No prohibited content detected");
  });

  it('returns "rejected" when text contains "bootleg"', () => {
    const result = scanText("Bootleg CD", "Rare bootleg recording from 1995");
    expect(result.status).toBe("rejected");
    expect(result.matchedTerms).toContain("bootleg");
    expect(result.reason).toContain("bootleg");
  });

  it('returns "flagged" when text contains "watermark" (not in first 10 prohibited)', () => {
    const result = scanText("Art Print", "Has a small watermark in the corner");
    expect(result.status).toBe("flagged");
    expect(result.matchedTerms).toContain("watermark");
    expect(result.reason).toContain("watermark");
  });

  it('returns "rejected" when both prohibited and copyright-flag terms present', () => {
    const result = scanText("Bootleg DVD", "Contains Toei Animation watermark");
    expect(result.status).toBe("rejected");
    expect(result.matchedTerms).toContain("bootleg");
    expect(result.matchedTerms).toContain("Toei Animation");
    expect(result.matchedTerms).toContain("watermark");
  });

  it('returns "clear" for empty title and description', () => {
    const result = scanText("", "");
    expect(result.status).toBe("clear");
    expect(result.confidence).toBe(0.95);
    expect(result.matchedTerms).toEqual([]);
  });

  it("increases confidence with multiple matches", () => {
    const single = scanText("bootleg", "");
    const double = scanText("bootleg knockoff", "");
    const triple = scanText("bootleg knockoff fake", "");

    expect(single.confidence).toBe(0.68); // 0.6 + 1 * 0.08
    expect(double.confidence).toBe(0.76); // 0.6 + 2 * 0.08
    expect(triple.confidence).toBe(0.84); // 0.6 + 3 * 0.08
  });

  it("caps confidence at 0.99", () => {
    // 5 matches => 0.6 + 5*0.08 = 1.0 → capped at 0.99
    const result = scanText("bootleg knockoff fake replica counterfeit", "");
    expect(result.confidence).toBe(0.99);
  });

  it("is case insensitive", () => {
    const result = scanText("BOOTLEG ITEM", "FAKE AND KNOCKOFF");
    expect(result.status).toBe("rejected");
    expect(result.matchedTerms.map((t) => t.toLowerCase())).toContain("bootleg");
    expect(result.matchedTerms.map((t) => t.toLowerCase())).toContain("fake");
    expect(result.matchedTerms.map((t) => t.toLowerCase())).toContain("knockoff");
  });

  it("matches partial words if term appears as substring", () => {
    const result = scanText("bootleggers", "");
    expect(result.matchedTerms).toContain("bootleg");
  });

  it("trims reason to first 5 matches with overflow indicator", () => {
    const result = scanText(
      "bootleg knockoff fake replica counterfeit unauthorized",
      "pirated copy"
    );
    expect(result.matchedTerms.length).toBeGreaterThan(5);
    expect(result.reason).toMatch(/Matched: .+\+\d+ more/);
  });

  it("does not flag unrelated words that contain term substrings by accident", () => {
    // "bootleg" is in the list but "boot" alone is not a match because includes checks whole substring
    const result = scanText("boot", "foot");
    expect(result.status).toBe("clear");
  });
});

describe("Deposit Calculation", () => {
  it("returns $500 minimum for $100 item", () => {
    expect(getRequiredDeposit(100)).toBe(500);
  });

  it("returns exactly $500 for $10,000 item (5%)", () => {
    expect(getRequiredDeposit(10000)).toBe(500);
  });

  it("returns $1,000 for $20,000 item (5%)", () => {
    expect(getRequiredDeposit(20000)).toBe(1000);
  });

  it("caps at $10,000 for very expensive items", () => {
    expect(getRequiredDeposit(500000)).toBe(10000);
    expect(getRequiredDeposit(1000000)).toBe(10000);
  });

  it("returns $500 minimum for $0 item", () => {
    expect(getRequiredDeposit(0)).toBe(500);
  });

  it("returns $500 for prices below $10,000", () => {
    expect(getRequiredDeposit(1)).toBe(500);
    expect(getRequiredDeposit(5000)).toBe(500);
    expect(getRequiredDeposit(9999)).toBe(500);
  });

  it("handles exact boundary of $10,000", () => {
    expect(getRequiredDeposit(10000)).toBe(500);
  });

  it("handles $200,000 item at cap", () => {
    expect(getRequiredDeposit(200000)).toBe(10000);
  });

  it("rounds to nearest dollar", () => {
    // 12345 * 0.05 = 617.25 → rounds to 617
    expect(getRequiredDeposit(12345)).toBe(617);
    // 12355 * 0.05 = 617.75 → rounds to 618
    expect(getRequiredDeposit(12355)).toBe(618);
  });

  it("handles negative price as edge case (clamped to minimum)", () => {
    expect(getRequiredDeposit(-1000)).toBe(500);
    expect(getRequiredDeposit(-1)).toBe(500);
  });
});
