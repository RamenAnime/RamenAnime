/**
 * Optional image copyright checks via Google Cloud Vision and TinEye.
 * Set GOOGLE_VISION_API_KEY and/or TINEYE_API_KEY + TINEYE_API_SECRET in env.
 */

export type ImageScanResult = {
  status: "clear" | "flagged" | "rejected" | "pending";
  confidence: number;
  matchedTerms: string[];
  reason: string;
  provider: string;
};

async function scanWithVision(imageUrl: string): Promise<ImageScanResult | null> {
  const key = process.env.GOOGLE_VISION_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) return null;

  try {
    const resp = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${key}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [{
          image: { source: { imageUri: imageUrl } },
          features: [
            { type: "SAFE_SEARCH_DETECTION", maxResults: 1 },
            { type: "LABEL_DETECTION", maxResults: 10 },
            { type: "TEXT_DETECTION", maxResults: 5 },
          ],
        }],
      }),
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as {
      responses?: Array<{
        safeSearchAnnotation?: { adult?: string; violence?: string; racy?: string };
        labelAnnotations?: Array<{ description: string }>;
        textAnnotations?: Array<{ description?: string }>;
      }>;
    };
    const result = data.responses?.[0];
    const safe = result?.safeSearchAnnotation;
    const labels = (result?.labelAnnotations || []).map((l: { description: string }) => l.description);
    const text = (result?.textAnnotations?.[0]?.description || "").toLowerCase();
    const matched: string[] = [];

    if (safe) {
      const risky: string[] = [];
      if (safe.adult && ["LIKELY", "VERY_LIKELY"].includes(safe.adult)) risky.push("adult");
      if (safe.violence && ["LIKELY", "VERY_LIKELY"].includes(safe.violence)) risky.push("violence");
      if (safe.racy && ["LIKELY", "VERY_LIKELY"].includes(safe.racy)) risky.push("racy");
      if (risky.length) matched.push(`safe_search:${risky.join(",")}`);
    }

    const bootlegLabels = ["counterfeit", "replica", "bootleg", "fake", "unauthorized"];
    for (const label of labels) {
      if (bootlegLabels.some((b) => label.toLowerCase().includes(b))) matched.push(`label:${label}`);
    }

    const stockPhotoTerms = ["sample", "not for sale", "preview", "proof copy", "©", "copyright"];
    for (const term of stockPhotoTerms) {
      if (text.includes(term)) matched.push(`ocr:${term}`);
    }

    if (matched.length === 0) {
      return {
        status: "clear",
        confidence: 0.9,
        matchedTerms: [],
        reason: "Vision: no risky labels or stock-photo text detected",
        provider: "google_vision",
      };
    }
    const rejected = matched.some((m) => m.startsWith("label:") || m.includes("counterfeit"));
    return {
      status: rejected ? "rejected" : "flagged",
      confidence: Math.min(0.99, 0.65 + matched.length * 0.08),
      matchedTerms: matched,
      reason: `Vision: ${matched.slice(0, 5).join("; ")}`,
      provider: "google_vision",
    };
  } catch {
    return null;
  }
}

async function scanWithTinEye(imageUrl: string): Promise<ImageScanResult | null> {
  const apiKey = process.env.TINEYE_API_KEY;
  const apiSecret = process.env.TINEYE_API_SECRET;
  if (!apiKey || !apiSecret) return null;

  try {
    const params = new URLSearchParams({ url: imageUrl });
    const resp = await fetch(`https://api.tineye.com/rest/search/?${params}`, {
      headers: {
        "x-api-key": apiKey,
        "x-api-secret": apiSecret,
      },
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as { results?: { matches?: unknown[] } };
    const matches = data.results?.matches?.length ?? 0;
    if (matches > 3) {
      return {
        status: "flagged",
        confidence: 0.75,
        matchedTerms: [`tineye_matches:${matches}`],
        reason: `TinEye found ${matches} similar images online (possible stock/bootleg photo)`,
        provider: "tineye",
      };
    }
    return {
      status: "clear",
      confidence: 0.85,
      matchedTerms: [],
      reason: `TinEye: ${matches} matches (below threshold)`,
      provider: "tineye",
    };
  } catch {
    return null;
  }
}

export async function scanListingImages(imageUrls: string[]): Promise<ImageScanResult> {
  const urls = imageUrls.filter((u) => u.startsWith("http")).slice(0, 5);
  if (urls.length === 0) {
    return {
      status: "pending",
      confidence: 0,
      matchedTerms: [],
      reason: "No image URLs to scan",
      provider: "none",
    };
  }

  let worst: ImageScanResult | null = null;
  const rank = { rejected: 3, flagged: 2, pending: 1, clear: 0 };

  for (const url of urls) {
    const vision = await scanWithVision(url);
    const tineye = await scanWithTinEye(url);
    for (const r of [vision, tineye]) {
      if (!r) continue;
      if (!worst || rank[r.status] > rank[worst.status]) worst = r;
    }
  }

  if (!worst) {
    return {
      status: "pending",
      confidence: 0,
      matchedTerms: [],
      reason: "Image APIs not configured (set GOOGLE_VISION_API_KEY or TINEYE keys)",
      provider: "none",
    };
  }
  return worst;
}
