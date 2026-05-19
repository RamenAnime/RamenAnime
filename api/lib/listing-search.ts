import { and, or, sql, type SQL } from "drizzle-orm";
import { marketplaceListings, users } from "@db/schema";

const MIN_TOKEN_LEN = 2;
const MAX_TOKENS = 8;

/** Split a search string into lowercase tokens (max 8, min length 2). */
export function tokenizeSearch(raw?: string): string[] {
  if (!raw?.trim()) return [];
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= MIN_TOKEN_LEN)
    .slice(0, MAX_TOKENS);
}

/** Escape `%`, `_`, and `\` for SQL LIKE patterns. */
export function escapeLike(value: string): string {
  return value.replace(/[%_\\]/g, "\\$&");
}

/**
 * Each token must match at least one field (title, description, category, seller).
 * All tokens must match (AND across tokens).
 */
export function listingSearchCondition(tokens: string[]): SQL | undefined {
  if (tokens.length === 0) return undefined;

  const tokenClauses = tokens.map((token) => {
    const pattern = `%${escapeLike(token)}%`;
    return or(
      sql`LOWER(${marketplaceListings.title}) LIKE ${pattern}`,
      sql`LOWER(COALESCE(${marketplaceListings.description}, '')) LIKE ${pattern}`,
      sql`LOWER(COALESCE(${marketplaceListings.category}, '')) LIKE ${pattern}`,
      sql`LOWER(COALESCE(${users.name}, '')) LIKE ${pattern}`,
      sql`LOWER(COALESCE(${users.username}, '')) LIKE ${pattern}`,
    );
  });

  return and(...tokenClauses);
}

/** Higher score = more relevant when ordering search results. */
export function listingRelevanceScore(tokens: string[]): SQL {
  if (tokens.length === 0) {
    return sql`0`;
  }
  const primary = `%${escapeLike(tokens[0])}%`;
  return sql`(
    (CASE WHEN LOWER(${marketplaceListings.title}) LIKE ${primary} THEN 40 ELSE 0 END) +
    (CASE WHEN LOWER(COALESCE(${marketplaceListings.category}, '')) LIKE ${primary} THEN 20 ELSE 0 END) +
    (CASE WHEN LOWER(COALESCE(${marketplaceListings.description}, '')) LIKE ${primary} THEN 12 ELSE 0 END) +
    (CASE WHEN LOWER(COALESCE(${users.username}, '')) LIKE ${primary} THEN 8 ELSE 0 END) +
    (${marketplaceListings.bidCount} * 0.1)
  )`;
}
