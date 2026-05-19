import { describe, it, expect } from "vitest";
import i18n from "../i18n";
import {
  SUPPORTED_LANGUAGE_CODES,
  REQUIRED_I18N_KEYS,
} from "../i18n/languages";

describe("i18n locales", () => {
  it("registers all 35 supported languages", () => {
    expect(SUPPORTED_LANGUAGE_CODES.length).toBe(35);
    for (const code of SUPPORTED_LANGUAGE_CODES) {
      expect(i18n.hasResourceBundle(code, "translation")).toBe(true);
    }
  });

  it("resolves required UI keys in every language (not raw key paths)", () => {
    for (const lng of SUPPORTED_LANGUAGE_CODES) {
      for (const key of REQUIRED_I18N_KEYS) {
        const value = i18n.t(key, { lng });
        expect(value, `${lng}:${key}`).toBeTruthy();
        expect(value, `${lng}:${key}`).not.toBe(key);
        expect(value, `${lng}:${key}`).not.toMatch(/^marketplace\./);
        expect(value, `${lng}:${key}`).not.toMatch(/^ai\./);
      }
    }
  });

  it("uses Kyoto extended bundle for Japanese marketplace search", () => {
    const jaSearch = i18n.t("marketplace.search", { lng: "ja" });
    expect(jaSearch.length).toBeGreaterThan(0);
    expect(jaSearch).not.toBe("marketplace.search");
  });
});
