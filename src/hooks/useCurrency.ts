import { useEffect, useState, useCallback } from "react";
import { trpc } from "@/providers/trpc";

export type CurrencyCode =
  | "USD" | "EUR" | "JPY" | "GBP" | "CAD" | "AUD" | "NZD"
  | "MXN" | "BRL" | "KRW" | "CNY" | "HKD" | "SGD" | "MYR"
  | "THB" | "VND" | "IDR" | "PHP" | "INR" | "TWD" | "TRY"
  | "SAR" | "AED" | "ILS" | "PLN" | "CZK" | "DKK" | "SEK"
  | "HUF" | "RON" | "CHF" | "NOK" | "ZAR" | "PKR" | "BDT";

export const ALL_CURRENCIES = [
  { code: "USD", name: "US Dollar" }, { code: "EUR", name: "Euro" },
  { code: "JPY", name: "Japanese Yen" }, { code: "GBP", name: "British Pound" },
  { code: "CAD", name: "Canadian Dollar" }, { code: "AUD", name: "Australian Dollar" },
  { code: "NZD", name: "New Zealand Dollar" }, { code: "MXN", name: "Mexican Peso" },
  { code: "BRL", name: "Brazilian Real" }, { code: "KRW", name: "South Korean Won" },
  { code: "CNY", name: "Chinese Yuan" }, { code: "HKD", name: "Hong Kong Dollar" },
  { code: "SGD", name: "Singapore Dollar" }, { code: "MYR", name: "Malaysian Ringgit" },
  { code: "THB", name: "Thai Baht" }, { code: "VND", name: "Vietnamese Dong" },
  { code: "IDR", name: "Indonesian Rupiah" }, { code: "PHP", name: "Philippine Peso" },
  { code: "INR", name: "Indian Rupee" }, { code: "TWD", name: "Taiwan Dollar" },
  { code: "TRY", name: "Turkish Lira" }, { code: "SAR", name: "Saudi Riyal" },
  { code: "AED", name: "UAE Dirham" }, { code: "ILS", name: "Israeli Shekel" },
  { code: "PLN", name: "Polish Zloty" }, { code: "CZK", name: "Czech Koruna" },
  { code: "DKK", name: "Danish Krone" }, { code: "SEK", name: "Swedish Krona" },
  { code: "HUF", name: "Hungarian Forint" }, { code: "RON", name: "Romanian Leu" },
  { code: "CHF", name: "Swiss Franc" }, { code: "NOK", name: "Norwegian Krone" },
  { code: "ZAR", name: "South African Rand" }, { code: "PKR", name: "Pakistani Rupee" },
  { code: "BDT", name: "Bangladeshi Taka" },
];

const COUNTRY_TO_CURRENCY: Record<string, CurrencyCode> = {
  US: "USD", GB: "GBP", CA: "CAD", AU: "AUD", NZ: "NZD", JP: "JPY",
  KR: "KRW", CN: "CNY", TW: "TWD", HK: "HKD", SG: "SGD", PH: "PHP",
  TH: "THB", VN: "VND", ID: "IDR", MY: "MYR", IN: "INR", PK: "PKR",
  BD: "BDT", DE: "EUR", FR: "EUR", IT: "EUR", ES: "EUR", NL: "EUR",
  BE: "EUR", AT: "EUR", PT: "EUR", IE: "EUR", FI: "EUR", GR: "EUR",
  SK: "EUR", SI: "EUR", LU: "EUR", MT: "EUR", CY: "EUR", EE: "EUR",
  LV: "EUR", LT: "EUR", PL: "PLN", CZ: "CZK", HU: "HUF", RO: "RON",
  BG: "RON", HR: "EUR", DK: "DKK", SE: "SEK", NO: "NOK", CH: "CHF",
  TR: "TRY", SA: "SAR", AE: "AED", IL: "ILS", ZA: "ZAR", MX: "MXN",
  BR: "BRL",
};

/** Currencies that are never written with decimal places (yen, won, dong). */
const ZERO_DECIMAL_CURRENCIES = new Set<CurrencyCode>(["JPY", "KRW", "VND", "IDR", "HUF"]);

const STATIC_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, JPY: 150.5, GBP: 0.79, CAD: 1.35, AUD: 1.52,
  NZD: 1.62, MXN: 17.1, BRL: 4.95, KRW: 1330, CNY: 7.2, HKD: 7.82,
  SGD: 1.34, MYR: 4.72, THB: 35.8, VND: 24500, IDR: 15600, PHP: 56.2,
  INR: 83.2, TWD: 31.5, TRY: 30.5, SAR: 3.75, AED: 3.67, ILS: 3.65,
  PLN: 4.0, CZK: 23.2, DKK: 6.9, SEK: 10.4, HUF: 358, RON: 4.6,
  CHF: 0.88, NOK: 10.6, ZAR: 18.8, PKR: 278, BDT: 110,
};

export function useCurrency() {
  const [currencyCode, setCurrency] = useState<CurrencyCode>("USD");
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

  const { data: liveRates } = trpc.currency.exchangeRates.useQuery(
    { base: "USD" },
    { staleTime: 30 * 60 * 1000, retry: 2 }
  );

  useEffect(() => {
    const stored = localStorage.getItem("userCurrency") as CurrencyCode | null;
    if (stored && ALL_CURRENCIES.some((c) => c.code === stored)) {
      setCurrency(stored);
    }
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        const country = data?.country_code ?? "";
        setDetectedCountry(country);
        if (!stored) setCurrency(COUNTRY_TO_CURRENCY[country] ?? "USD");
      })
      .catch(() => { if (!stored) setCurrency("USD"); });
  }, []);

  const setCurrencyWithStorage = useCallback((code: CurrencyCode) => {
    localStorage.setItem("userCurrency", code);
    setCurrency(code);
  }, []);

  const resetToAuto = useCallback(() => {
    localStorage.removeItem("userCurrency");
    setCurrency(detectedCountry ? (COUNTRY_TO_CURRENCY[detectedCountry] ?? "USD") : "USD");
  }, [detectedCountry]);

  const getRate = useCallback((code: CurrencyCode): number => {
    if (code === "USD") return 1;
    if (liveRates?.rates?.[code]) return liveRates.rates[code];
    return STATIC_RATES[code] ?? 1;
  }, [liveRates]);

  const convert = useCallback((usdAmount: number, targetCode: CurrencyCode = currencyCode): number => {
    return usdAmount * getRate(targetCode);
  }, [currencyCode, getRate]);

  const format = useCallback((usdAmount: number, targetCode: CurrencyCode = currencyCode): string => {
    const converted = convert(usdAmount, targetCode);
    const locale = getLocaleForCurrency(targetCode);
    const maxDigits = ZERO_DECIMAL_CURRENCIES.has(targetCode) ? 0 : 2;
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency", currency: targetCode,
        minimumFractionDigits: 0, maximumFractionDigits: maxDigits,
      }).format(converted);
    } catch {
      return `${targetCode} ${converted.toFixed(maxDigits)}`;
    }
  }, [currencyCode, convert]);

  return { currencyCode, setCurrency: setCurrencyWithStorage, resetToAuto, detectedCountry, convert, format };
}

function getLocaleForCurrency(code: CurrencyCode): string {
  const map: Record<string, string> = {
    USD: "en-US", EUR: "de-DE", JPY: "ja-JP", GBP: "en-GB", CAD: "en-CA",
    AUD: "en-AU", NZD: "en-NZ", MXN: "es-MX", BRL: "pt-BR", KRW: "ko-KR",
    CNY: "zh-CN", HKD: "zh-HK", SGD: "en-SG", MYR: "ms-MY", THB: "th-TH",
    VND: "vi-VN", IDR: "id-ID", PHP: "fil-PH", INR: "hi-IN", TWD: "zh-TW",
    TRY: "tr-TR", SAR: "ar-SA", AED: "ar-AE", ILS: "he-IL", PLN: "pl-PL",
    CZK: "cs-CZ", DKK: "da-DK", SEK: "sv-SE", HUF: "hu-HU", RON: "ro-RO",
    CHF: "de-CH", NOK: "nb-NO", ZAR: "en-ZA", PKR: "ur-PK", BDT: "bn-BD",
  };
  return map[code] ?? "en-US";
}

const RTL_LANGUAGES = new Set(["ar", "he"]);
export function isRTLLanguage(langCode: string): boolean {
  return RTL_LANGUAGES.has(langCode.split("-")[0]);
}
export function updateDocumentDirection(langCode: string) {
  document.documentElement.dir = isRTLLanguage(langCode) ? "rtl" : "ltr";
  document.documentElement.lang = langCode;
}
