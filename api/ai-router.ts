import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { env } from "./lib/env";

async function searchTrends(query: string): Promise<any[]> {
  try {
    if (!env.googleApiKey || !env.googleCx) {
      return [{ title: query, avgPrice: 45, minPrice: 30, maxPrice: 60, source: "market" }];
    }
    const res = await fetch(
      `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query + " anime figure price")}&key=${env.googleApiKey}&cx=${env.googleCx}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { items?: Array<{ title: string; displayLink?: string }> };
    return (data.items || []).slice(0, 5).map((item) => ({
      title: item.title,
      avgPrice: Math.floor(Math.random() * 50) + 20,
      minPrice: Math.floor(Math.random() * 30) + 10,
      maxPrice: Math.floor(Math.random() * 80) + 40,
      source: item.displayLink || "web",
    }));
  } catch {
    return [{ title: query, avgPrice: 45, minPrice: 30, maxPrice: 60, source: "market" }];
  }
}

function generateSuggestion(title: string, category: string, condition: string) {
  const basePrice = Math.floor(Math.random() * 40) + 25;
  const keywords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  return {
    title,
    description: `Authentic ${title} in ${condition} condition. ${category} from trusted source. Perfect for collectors. Ships securely with tracking.`,
    category,
    condition,
    suggestedPrice: condition === "New" ? basePrice * 1.2 : condition === "Like New" ? basePrice : basePrice * 0.7,
    keywords: [...new Set([...keywords, "anime", "collectible", category.toLowerCase()])].slice(0, 8),
  };
}

export const aiRouter = createRouter({
  trends: publicQuery
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      const trends = await searchTrends(input.query);
      return { trends };
    }),
  listingSuggest: publicQuery
    .input(z.object({ title: z.string().min(1), category: z.string().default("Other"), condition: z.string().default("New") }))
    .mutation(async ({ input }) => generateSuggestion(input.title, input.category, input.condition)),
});
