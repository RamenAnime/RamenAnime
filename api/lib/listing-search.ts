import { and, or, sql, type SQL } from "drizzle-orm";
import { marketplaceListings, users } from "@db/schema";
import { aliasExpansions } from "./anime-aliases";

const MIN_TOKEN_LEN = 2;
const MAX_TOKENS = 8;

/** Hiragana, katakana, or CJK ideographs - single characters are meaningful. */
const CJK_RE = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;

/** Convert katakana to hiragana (ポケモン -> ぽけもん). */
export function kataToHira(s: string): string {
  return s.replace(/[\u30a1-\u30f6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

/** Convert hiragana to katakana (ぽけもん -> ポケモン). */
export function hiraToKata(s: string): string {
  return s.replace(/[\u3041-\u3096]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60));
}

/**
 * Split a search string into lowercase tokens (max 8).
 * Latin tokens need 2+ chars; CJK tokens may be a single character.
 * NFKC keeps full-width -> half-width folding while preserving precomposed
 * kana (NFKD would split ガ into カ + combining dakuten and break SQL LIKE).
 */
export function tokenizeSearch(raw?: string): string[] {
  if (!raw?.trim()) return [];
  return raw
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .normalize("NFC")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= MIN_TOKEN_LEN || (t.length === 1 && CJK_RE.test(t)))
    .slice(0, MAX_TOKENS);
}

const MAX_VARIANTS_PER_TOKEN = 10;

/**
 * Variants of a token: kana folds plus franchise aliases, so ぽけもん,
 * ポケモン, and "pokemon" all find each other's listings.
 */
export function tokenVariants(token: string): string[] {
  const variants = new Set([token, kataToHira(token), hiraToKata(token)]);
  for (const alias of aliasExpansions(token)) {
    variants.add(alias);
    variants.add(kataToHira(alias));
    variants.add(hiraToKata(alias));
  }
  return [...variants].slice(0, MAX_VARIANTS_PER_TOKEN);
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
    const fieldClauses = tokenVariants(token).flatMap((variant) => {
      const pattern = `%${escapeLike(variant)}%`;
      return [
        sql`LOWER(${marketplaceListings.title}) LIKE ${pattern}`,
        sql`LOWER(COALESCE(${marketplaceListings.description}, '')) LIKE ${pattern}`,
        sql`LOWER(COALESCE(${marketplaceListings.category}, '')) LIKE ${pattern}`,
        sql`LOWER(COALESCE(${users.name}, '')) LIKE ${pattern}`,
        sql`LOWER(COALESCE(${users.username}, '')) LIKE ${pattern}`,
      ];
    });
    return or(...fieldClauses);
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
