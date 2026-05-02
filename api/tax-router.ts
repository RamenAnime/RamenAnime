import { z } from "zod";
import { publicQuery, adminQuery, createRouter } from "./middleware";
import { getDb } from "./queries/connection";
import { taxRates } from "@db/schema";
import { eq } from "drizzle-orm";

// Fallback rates when database is empty
const FALLBACK_RATES: Record<string, number> = {
  US: 0, CA: 5, GB: 20, JP: 10, KR: 10, CN: 13, HK: 0,
  FR: 20, DE: 19, IT: 22, ES: 21, NL: 21, BE: 21, AT: 20,
  PL: 23, SE: 25, FI: 25.5, DK: 25, IE: 23, PT: 23, GR: 24,
  LU: 17, MT: 18, CY: 19, SI: 22, SK: 23, CZ: 21, HU: 27,
  RO: 19, BG: 20, HR: 25, LT: 21, LV: 21, EE: 22,
  AU: 10, NZ: 15, MX: 16, BR: 17, SG: 9, MY: 8, TH: 7,
  VN: 10, PH: 12, ID: 11, IN: 18, TW: 5,
};

const rateCache: Map<string, { rate: number; updatedAt: number }> = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function getFallbackRate(cc: string): number {
  return FALLBACK_RATES[cc.toUpperCase()] ?? 0;
}

export const taxRouter = createRouter({
  getRate: publicQuery
    .input(z.object({ countryCode: z.string().length(2) }))
    .query(async ({ input }) => {
      const cc = input.countryCode.toUpperCase();
      const cached = rateCache.get(cc);
      if (cached && Date.now() - cached.updatedAt < CACHE_TTL_MS) {
        return { countryCode: cc, rate: cached.rate, source: "cache" };
      }
      const db = getDb();
      const row = await db.select().from(taxRates).where(eq(taxRates.countryCode, cc)).limit(1);
      if (row.length > 0) {
        const rate = row[0].rate;
        rateCache.set(cc, { rate, updatedAt: Date.now() });
        return { countryCode: cc, rate, source: "database" };
      }
      const fallback = getFallbackRate(cc);
      return { countryCode: cc, rate: fallback, source: "fallback" };
    }),

  calculate: publicQuery
    .input(z.object({
      subtotal: z.number().min(0),
      countryCode: z.string().length(2),
    }))
    .query(async ({ input }) => {
      const { subtotal, countryCode } = input;
      const cc = countryCode.toUpperCase();
      const db = getDb();
      const row = await db.select().from(taxRates).where(eq(taxRates.countryCode, cc)).limit(1);
      const rate = row.length > 0 ? row[0].rate : getFallbackRate(cc);
      const vatAmount = Math.round(subtotal * (rate / 100) * 100) / 100;
      const platformFee = Math.round(subtotal * 0.08 * 100) / 100;
      const total = Math.round((subtotal + vatAmount + platformFee) * 100) / 100;
      return {
        subtotal,
        vatRate: rate,
        vatAmount,
        platformFee,
        total,
        countryCode: cc,
        lastUpdated: row.length > 0 ? row[0].updatedAt : null,
      };
    }),

  seedRates: publicQuery
    .query(async () => {
      const db = getDb();
      const entries = Object.entries(FALLBACK_RATES);
      for (const [cc, rate] of entries) {
        await db.insert(taxRates).values({
          id: crypto.randomUUID(),
          countryCode: cc,
          rate,
          vatName: "VAT",
          updatedAt: new Date(),
        }).onDuplicateKeyUpdate({
          set: { rate, updatedAt: new Date() },
        });
        rateCache.set(cc, { rate, updatedAt: Date.now() });
      }
      return { success: true, seeded: entries.length };
    }),

  refreshRates: adminQuery
    .mutation(async () => {
      const results: Array<{ country: string; rate: number; status: string }> = [];
      const db = getDb();
      try {
        const euCountries = [
          "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
          "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
          "PL", "PT", "RO", "SK", "SI", "ES", "SE",
        ];
        for (const cc of euCountries) {
          try {
            const res = await fetch(`https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${cc.toLowerCase()}/vat-rates`, {
              headers: { Accept: "application/json" },
              signal: AbortSignal.timeout(5000),
            });
            if (res.ok) {
              const data = await res.json() as any;
              let rate = 0;
              if (data?.standardRate) {
                rate = parseFloat(data.standardRate);
              } else if (data?.rates?.standard) {
                rate = parseFloat(data.rates.standard);
              } else if (Array.isArray(data) && data[0]?.rate) {
                rate = parseFloat(data[0].rate);
              }
              if (rate > 0) {
                await db.insert(taxRates).values({
                  id: crypto.randomUUID(),
                  countryCode: cc,
                  rate,
                  vatName: "VAT",
                  updatedAt: new Date(),
                }).onDuplicateKeyUpdate({
                  set: { rate, updatedAt: new Date() },
                });
                rateCache.set(cc, { rate, updatedAt: Date.now() });
                results.push({ country: cc, rate, status: "updated" });
              } else {
                results.push({ country: cc, rate: 0, status: "parse_failed" });
              }
            } else {
              results.push({ country: cc, rate: 0, status: `http_${res.status}` });
            }
          } catch (e) {
            results.push({ country: cc, rate: 0, status: "error" });
          }
        }
        const others = [
          { cc: "GB", rate: 20, name: "VAT" },
          { cc: "JP", rate: 10, name: "Consumption Tax" },
          { cc: "KR", rate: 10, name: "VAT" },
          { cc: "CN", rate: 13, name: "VAT" },
          { cc: "HK", rate: 0, name: "N/A" },
          { cc: "SG", rate: 9, name: "GST" },
          { cc: "MY", rate: 8, name: "SST" },
          { cc: "AU", rate: 10, name: "GST" },
          { cc: "NZ", rate: 15, name: "GST" },
          { cc: "CA", rate: 5, name: "GST" },
          { cc: "MX", rate: 16, name: "IVA" },
          { cc: "BR", rate: 17, name: "ICMS" },
          { cc: "US", rate: 0, name: "Sales Tax" },
          { cc: "TH", rate: 7, name: "VAT" },
          { cc: "VN", rate: 10, name: "VAT" },
          { cc: "PH", rate: 12, name: "VAT" },
          { cc: "ID", rate: 11, name: "VAT" },
          { cc: "IN", rate: 18, name: "GST" },
          { cc: "TW", rate: 5, name: "VAT" },
        ];
        for (const o of others) {
          await db.insert(taxRates).values({
            id: crypto.randomUUID(),
            countryCode: o.cc,
            rate: o.rate,
            vatName: o.name,
            updatedAt: new Date(),
          }).onDuplicateKeyUpdate({
            set: { rate: o.rate, updatedAt: new Date() },
          });
          rateCache.set(o.cc, { rate: o.rate, updatedAt: Date.now() });
        }
        return { success: true, updated: results.length, details: results };
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    }),
});
