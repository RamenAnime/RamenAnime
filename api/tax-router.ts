import { z } from "zod";
import { publicQuery, adminQuery, createRouter } from "./middleware";
import { getDb } from "./queries/connection";
import { taxRates } from "@db/schema";
import { eq } from "drizzle-orm";

const rateCache: Map<string, { rate: number; updatedAt: number }> = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

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
        rateCache.set(cc, { rate: row[0].rate, updatedAt: Date.now() });
        return { countryCode: cc, rate: row[0].rate, source: "database" };
      }
      const fallback: Record<string, number> = {
        US: 0, CA: 5, GB: 20, JP: 10, KR: 10, CN: 13, HK: 0,
        FR: 20, DE: 19, IT: 22, ES: 21, NL: 21, BE: 21, AT: 20,
        PL: 23, SE: 25, FI: 25.5, DK: 25, IE: 23, PT: 23, GR: 24,
        LU: 17, MT: 18, CY: 19, SI: 22, SK: 23, CZ: 21, HU: 27,
        RO: 19, BG: 20, HR: 25, LT: 21, LV: 21, EE: 22,
        AU: 10, NZ: 15, MX: 16, BR: 17, SG: 9, MY: 8, TH: 7,
        VN: 10, PH: 12, ID: 11, IN: 18, TW: 5,
      };
      const rate = fallback[cc] ?? 0;
      return { countryCode: cc, rate, source: "fallback" };
    }),

  calculate: publicQuery
    .input(z.object({ subtotal: z.number().min(0), countryCode: z.string().length(2) }))
    .query(async ({ input }) => {
      const db = getDb();
      const cc = input.countryCode.toUpperCase();
      const row = await db.select().from(taxRates).where(eq(taxRates.countryCode, cc)).limit(1);
      const rate = row.length > 0 ? row[0].rate : 0;
      const vat = Math.round(input.subtotal * (rate / 100) * 100) / 100;
      const fee = Math.round(input.subtotal * 0.08 * 100) / 100;
      return {
        subtotal: input.subtotal,
        vatRate: rate,
        vatAmount: vat,
        platformFee: fee,
        total: Math.round((input.subtotal + vat + fee) * 100) / 100,
        countryCode: cc,
        lastUpdated: row.length > 0 ? row[0].updatedAt : null,
      };
    }),

  refreshRates: adminQuery
    .mutation(async () => {
      const results: Array<{ country: string; rate: number; status: string }> = [];
      const db = getDb();
      const eu = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"];
      for (const cc of eu) {
        try {
          const res = await fetch(`https://ec.europa.eu/taxation_customs/vies/rest-api/ms/${cc.toLowerCase()}/vat-rates`, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(5000) });
          if (res.ok) {
            const data = await res.json() as any;
            let rate = 0;
            if (data?.standardRate) rate = parseFloat(data.standardRate);
            else if (data?.rates?.standard) rate = parseFloat(data.rates.standard);
            if (rate > 0) {
              await db.insert(taxRates).values({ id: crypto.randomUUID(), countryCode: cc, rate, vatName: "VAT", updatedAt: new Date() }).onDuplicateKeyUpdate({ set: { rate, updatedAt: new Date() } });
              rateCache.set(cc, { rate, updatedAt: Date.now() });
              results.push({ country: cc, rate, status: "ok" });
            } else {
              results.push({ country: cc, rate: 0, status: "parse_fail" });
            }
          } else {
            results.push({ country: cc, rate: 0, status: "http_" + res.status });
          }
        } catch (e) {
          results.push({ country: cc, rate: 0, status: "err" });
        }
      }
      const others = [
        { cc: "GB", r: 20, n: "VAT" }, { cc: "JP", r: 10, n: "Consumption Tax" }, { cc: "KR", r: 10, n: "VAT" },
        { cc: "CN", r: 13, n: "VAT" }, { cc: "HK", r: 0, n: "N/A" }, { cc: "SG", r: 9, n: "GST" },
        { cc: "MY", r: 8, n: "SST" }, { cc: "AU", r: 10, n: "GST" }, { cc: "NZ", r: 15, n: "GST" },
        { cc: "CA", r: 5, n: "GST" }, { cc: "US", r: 0, n: "Sales Tax" }, { cc: "MX", r: 16, n: "IVA" },
        { cc: "BR", r: 17, n: "ICMS" }, { cc: "TH", r: 7, n: "VAT" }, { cc: "VN", r: 10, n: "VAT" },
        { cc: "PH", r: 12, n: "VAT" }, { cc: "ID", r: 11, n: "VAT" }, { cc: "IN", r: 18, n: "GST" },
        { cc: "TW", r: 5, n: "VAT" },
      ];
      for (const o of others) {
        await db.insert(taxRates).values({ id: crypto.randomUUID(), countryCode: o.cc, rate: o.r, vatName: o.n, updatedAt: new Date() }).onDuplicateKeyUpdate({ set: { rate: o.r, updatedAt: new Date() } });
        rateCache.set(o.cc, { rate: o.r, updatedAt: Date.now() });
      }
      return { success: true, updated: results.length, details: results };
    }),
});