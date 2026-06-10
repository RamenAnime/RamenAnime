import { describe, it, expect } from "vitest";
import { tokenizeSearch, escapeLike, kataToHira, hiraToKata, tokenVariants } from "../../api/lib/listing-search";
import { aliasExpansions } from "../../api/lib/anime-aliases";

describe("listing-search", () => {
  it("tokenizes and normalizes search text", () => {
    expect(tokenizeSearch("  Naruto  Figure  ")).toEqual(["naruto", "figure"]);
    expect(tokenizeSearch("a")).toEqual([]);
  });

  it("limits token count", () => {
    const tokens = tokenizeSearch("one two three four five six seven eight nine ten");
    expect(tokens.length).toBeLessThanOrEqual(8);
  });

  it("escapes LIKE wildcards", () => {
    expect(escapeLike("100%_off")).toBe("100\\%\\_off");
  });

  it("keeps precomposed kana with dakuten intact (NFC, not NFKD)", () => {
    expect(tokenizeSearch("ガンダム")).toEqual(["ガンダム"]);
    expect(tokenizeSearch("ポケモン")).toEqual(["ポケモン"]);
  });

  it("allows single-character CJK tokens", () => {
    expect(tokenizeSearch("刀")).toEqual(["刀"]);
    expect(tokenizeSearch("竜 figure")).toEqual(["竜", "figure"]);
  });

  it("folds full-width Latin to half-width", () => {
    expect(tokenizeSearch("ＮＡＲＵＴＯ")).toEqual(["naruto"]);
  });

  it("converts between hiragana and katakana", () => {
    expect(kataToHira("ポケモン")).toBe("ぽけもん");
    expect(hiraToKata("ぽけもん")).toBe("ポケモン");
    expect(kataToHira("naruto")).toBe("naruto");
  });

  it("expands franchise aliases across scripts", () => {
    expect(aliasExpansions("pokemon")).toContain("ポケモン");
    expect(aliasExpansions("ポケモン")).toContain("pokemon");
    expect(aliasExpansions("kimetsu")).toContain("鬼滅の刃");
    expect(aliasExpansions("ガンダム")).toContain("gundam");
    expect(aliasExpansions("zzz-unknown")).toEqual([]);
  });

  it("does not expand generic stopwords", () => {
    expect(aliasExpansions("man")).toEqual([]);
    expect(aliasExpansions("no")).toEqual([]);
  });

  it("token variants include kana folds and aliases, capped", () => {
    const variants = tokenVariants("ポケモン");
    expect(variants).toContain("ぽけもん");
    expect(variants).toContain("pokemon");
    expect(variants.length).toBeLessThanOrEqual(10);
    expect(tokenVariants("figure")).toEqual(["figure"]);
  });
});
