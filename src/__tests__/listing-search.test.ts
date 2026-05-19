import { describe, it, expect } from "vitest";
import { tokenizeSearch, escapeLike } from "../../api/lib/listing-search";

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
});
