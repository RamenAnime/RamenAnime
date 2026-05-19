import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";

const CACHE_TTL_MS = 60 * 60 * 1000;

interface RateCache {
  rates: Record<string, number>;
  timestamp: number;
  date: string;
}

let cache: RateCache | null = null;

async function fetchLiveRates(): Promise<RateCache> {
  const res = await fetch("https://api.frankfurter.app/latest?from=USD", {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Rate API error: ${res.status}`);
  const data = (await res.json()) as { rates: Record<string, number>; date: string };
  return { rates: data.rates, timestamp: Date.now(), date: data.date };
}

async function getRates(): Promise<RateCache> {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL_MS) return cache;
  cache = await fetchLiveRates();
  return cache;
}

export const currencyRouter = createRouter({
  exchangeRates: publicQuery
    .input(z.object({ base: z.string().default("USD") }))
    .query(async ({ input }) => {
      const rates = await getRates();
      return { base: input.base, date: rates.date, rates: rates.rates };
    }),
});
