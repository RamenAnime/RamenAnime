import { getDb } from "../queries/connection";
import { marketplaceListings, copyrightScans } from "@db/schema";
import { eq } from "drizzle-orm";
import { scanListingImages } from "./image-copyright";

const PROHIBITED_TERMS = [
  "bootleg", "knockoff", "replica", "fake", "counterfeit", "unofficial copy",
  "1:1 replica", "high quality replica", "mirror quality", "AAA replica",
  "fansub", "raw rip", "cam rip", "dvd rip", "bluray rip", "unlicensed",
  "scanlation", "unofficial translation", "pirate", "bootleg dvd",
  "weapon", "knife", "sword (real)", "firearm", "alcohol", "tobacco",
  "drug", "medicine", "pharmaceutical", "e-liquid", "vape juice",
  "hentai dvd", "adult figure", "cast off", "removable clothes", "R18",
  "uncensored", "NSFW", "adult only", "18+", "nipple", "genital",
  "stolen", "fraud", "scam", "not mine", "found this", "selling for friend",
];

const COPYRIGHT_FLAGS = [
  "Toei Animation", "Sunrise", "Studio Ghibli", "Aniplex", "Crunchyroll",
  "Funimation", "Viz Media", "Kodansha", "Shueisha", "Shogakukan",
  "Bandai Namco", "Good Smile Company", "Max Factory", "Kotobukiya",
  "Square Enix", "Nintendo", "Pokemon Company", "Disney",
  "watermark", "sample", "preview", "not for sale", "promotional use only",
  "copyright", "trademark", "TM", "(C)", "All Rights Reserved",
];

const SEVERITY_RANK = { clear: 0, pending: 1, flagged: 2, rejected: 3 } as const;

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
    return { status: "clear" as const, confidence: 0.95, matchedTerms: [], reason: "No prohibited content detected" };
  }
  const severity = matched.some((m) =>
    PROHIBITED_TERMS.slice(0, 10).some((p) => p.toLowerCase() === m.toLowerCase())
  )
    ? "rejected"
    : "flagged";
  return {
    status: severity as "flagged" | "rejected",
    confidence: Math.min(0.99, 0.6 + matched.length * 0.08),
    matchedTerms: matched,
    reason: `Matched: ${matched.slice(0, 5).join(", ")}${matched.length > 5 ? ` +${matched.length - 5} more` : ""}`,
  };
}

function mergeStatus(
  a: keyof typeof SEVERITY_RANK,
  b: keyof typeof SEVERITY_RANK
): keyof typeof SEVERITY_RANK {
  return SEVERITY_RANK[a] >= SEVERITY_RANK[b] ? a : b;
}

export async function runCopyrightScan(
  listingId: number,
  title: string,
  description: string,
  imageUrls: string[]
) {
  const db = getDb();
  const textResult = scanText(title, description);

  await db.insert(copyrightScans).values({
    listingId,
    scanType: "text",
    status: textResult.status,
    confidence: textResult.confidence.toString(),
    matchedTerms: JSON.stringify(textResult.matchedTerms),
    reason: textResult.reason,
  });

  let overallStatus: keyof typeof SEVERITY_RANK = textResult.status;

  const imageResult = await scanListingImages(imageUrls);
  if (imageResult.provider !== "none") {
    await db.insert(copyrightScans).values({
      listingId,
      scanType: "image",
      status: imageResult.status === "pending" ? "flagged" : imageResult.status,
      confidence: imageResult.confidence.toString(),
      matchedTerms: JSON.stringify(imageResult.matchedTerms),
      reason: `[${imageResult.provider}] ${imageResult.reason}`,
    });
    if (imageResult.status !== "pending") {
      overallStatus = mergeStatus(overallStatus, imageResult.status);
    }
  }

  await db
    .update(marketplaceListings)
    .set({ copyrightStatus: overallStatus })
    .where(eq(marketplaceListings.id, listingId));

  return overallStatus;
}
