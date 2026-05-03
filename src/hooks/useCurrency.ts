import { useState, useEffect, useCallback } from "react";

// Country to currency mapping for all allowed geoblock countries
export const COUNTRY_CURRENCY: Record<string, { code: string; symbol: string; name: string; rate: number }> = {
  // North America
  US: { code: "USD", symbol: "$", name: "US Dollar", rate: 1 },
  CA: { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 1.36 },
  MX: { code: "MXN", symbol: "MX$", name: "Mexican Peso", rate: 17.0 },
  // Oceania
  AU: { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.52 },
  NZ: { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar", rate: 1.64 },
  // Americas
  BR: { code: "BRL", symbol: "R$", name: "Brazilian Real", rate: 4.95 },
  // EU - all EUR
  AT: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  BE: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  BG: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  HR: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  CY: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  CZ: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  DK: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  EE: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  FI: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  FR: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  DE: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  GR: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  HU: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  IT: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  LV: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  LT: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  LU: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  MT: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  NL: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  PL: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  PT: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  RO: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  SK: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  SI: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  ES: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  SE: { code: "EUR", symbol: "\u20AC", name: "Euro", rate: 0.92 },
  // Asia
  JP: { code: "JPY", symbol: "\u00A5", name: "Japanese Yen", rate: 151.0 },
  KR: { code: "KRW", symbol: "\u20A9", name: "South Korean Won", rate: 1350.0 },
  CN: { code: "CNY", symbol: "\u00A5", name: "Chinese Yuan", rate: 7.24 },
  HK: { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar", rate: 7.83 },
  SG: { code: "SGD", symbol: "S$", name: "Singapore Dollar", rate: 1.35 },
  MY: { code: "MYR", symbol: "RM", name: "Malaysian Ringgit", rate: 4.75 },
  TH: { code: "THB", symbol: "\u0E3F", name: "Thai Baht", rate: 36.5 },
  VN: { code: "VND", symbol: "\u20AB", name: "Vietnamese Dong", rate: 25000.0 },
  ID: { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah", rate: 15800.0 },
  PH: { code: "PHP", symbol: "\u20B1", name: "Philippine Peso", rate: 56.5 },
  IN: { code: "INR", symbol: "\u20B9", name: "Indian Rupee", rate: 83.5 },
  TW: { code: "TWD", symbol: "NT$", name: "Taiwan Dollar", rate: 32.0 },
  TR: { code: "TRY", symbol: "\u20BA", name: "Turkish Lira", rate: 32.0 },
  SA: { code: "SAR", symbol: "\uFDFC", name: "Saudi Riyal", rate: 3.75 },
  AE: { code: "AED", symbol: "dh", name: "UAE Dirham", rate: 3.67 },
  IL: { code: "ILS", symbol: "\u20AA", name: "Israeli Shekel", rate: 3.72 },
  // Fallback for any other allowed country
  DEFAULT: { code: "USD", symbol: "$", name: "US Dollar", rate: 1 },
};

const CURRENCY_STORAGE_KEY = "ramen_anime_currency";
const COUNTRY_STORAGE_KEY = "ramen_anime_country";

// All available currencies for manual selection
export const ALL_CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "\u20AC", name: "Euro" },
  { code: "JPY", symbol: "\u00A5", name: "Japanese Yen" },
  { code: "GBP", symbol: "\u00A3", name: "British Pound" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "NZD", symbol: "NZ$", name: "New Zealand Dollar" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "KRW", symbol: "\u20A9", name: "South Korean Won" },
  { code: "CNY", symbol: "\u00A5", name: "Chinese Yuan" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "MYR", symbol: "RM", name: "Malaysian Ringgit" },
  { code: "THB", symbol: "\u0E3F", name: "Thai Baht" },
  { code: "VND", symbol: "\u20AB", name: "Vietnamese Dong" },
  { code: "IDR", symbol: "Rp", name: "Indonesian Rupiah" },
  { code: "PHP", symbol: "\u20B1", name: "Philippine Peso" },
  { code: "INR", symbol: "\u20B9", name: "Indian Rupee" },
  { code: "TWD", symbol: "NT$", name: "Taiwan Dollar" },
  { code: "TRY", symbol: "\u20BA", name: "Turkish Lira" },
  { code: "SAR", symbol: "\uFDFC", name: "Saudi Riyal" },
  { code: "AED", symbol: "dh", name: "UAE Dirham" },
  { code: "ILS", symbol: "\u20AA", name: "Israeli Shekel" },
  { code: "PLN", symbol: "z\u0142", name: "Polish Zloty" },
  { code: "CZK", symbol: "K\u010D", name: "Czech Koruna" },
  { code: "DKK", symbol: "kr", name: "Danish Krone" },
  { code: "SEK", symbol: "kr", name: "Swedish Krona" },
  { code: "HUF", symbol: "Ft", name: "Hungarian Forint" },
  { code: "RON", symbol: "lei", name: "Romanian Leu" },
];

export function getCurrencyForCountry(countryCode: string) {
  return COUNTRY_CURRENCY[countryCode.toUpperCase()] ?? COUNTRY_CURRENCY.DEFAULT;
}

// Convert USD amount to target currency
export function convertPrice(usdAmount: number, currencyCode: string): number {
  const currency = ALL_CURRENCIES.find((c) => c.code === currencyCode);
  if (!currency) return usdAmount;
  const countryEntry = Object.values(COUNTRY_CURRENCY).find((c) => c.code === currencyCode);
  const rate = countryEntry?.rate ?? 1;
  return Math.round(usdAmount * rate * 100) / 100;
}

// Format price with currency symbol
export function formatPrice(amount: number, currencyCode: string): string {
  const currency = ALL_CURRENCIES.find((c) => c.code === currencyCode);
  const symbol = currency?.symbol ?? "$";
  // For high-value currencies, no decimals
  if (["JPY", "KRW", "VND", "IDR"].includes(currencyCode)) {
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }
  return `${symbol}${amount.toFixed(2)}`;
}

// Main hook
export function useCurrency() {
  const [currencyCode, setCurrencyCode] = useState<string>(() => {
    // Check for manual override first
    const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
    if (stored) return stored;
    // Auto-detect from country
    const country = localStorage.getItem(COUNTRY_STORAGE_KEY);
    if (country) {
      const curr = getCurrencyForCountry(country);
      return curr.code;
    }
    return "USD";
  });

  const [detectedCountry, setDetectedCountry] = useState<string>(() => {
    return localStorage.getItem(COUNTRY_STORAGE_KEY) ?? "";
  });

  // Auto-detect country on mount
  useEffect(() => {
    const detectCountry = async () => {
      const stored = localStorage.getItem(COUNTRY_STORAGE_KEY);
      if (stored) {
        setDetectedCountry(stored);
        // Only auto-set currency if no manual override
        if (!localStorage.getItem(CURRENCY_STORAGE_KEY)) {
          const curr = getCurrencyForCountry(stored);
          setCurrencyCode(curr.code);
        }
        return;
      }
      try {
        const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const data = await res.json();
          const cc = data.country_code?.toUpperCase() ?? "US";
          localStorage.setItem(COUNTRY_STORAGE_KEY, cc);
          setDetectedCountry(cc);
          if (!localStorage.getItem(CURRENCY_STORAGE_KEY)) {
            const curr = getCurrencyForCountry(cc);
            setCurrencyCode(curr.code);
          }
        }
      } catch {
        // Fallback to USD
        setCurrencyCode("USD");
      }
    };
    detectCountry();
  }, []);

  const setCurrency = useCallback((code: string) => {
    localStorage.setItem(CURRENCY_STORAGE_KEY, code);
    setCurrencyCode(code);
  }, []);

  const resetToAuto = useCallback(() => {
    localStorage.removeItem(CURRENCY_STORAGE_KEY);
    if (detectedCountry) {
      const curr = getCurrencyForCountry(detectedCountry);
      setCurrencyCode(curr.code);
    } else {
      setCurrencyCode("USD");
    }
  }, [detectedCountry]);

  const convert = useCallback(
    (usdAmount: number) => {
      const rate =
        Object.values(COUNTRY_CURRENCY).find((c) => c.code === currencyCode)?.rate ?? 1;
      return Math.round(usdAmount * rate * 100) / 100;
    },
    [currencyCode]
  );

  const format = useCallback(
    (amount: number) => formatPrice(amount, currencyCode),
    [currencyCode]
  );

  return {
    currencyCode,
    setCurrency,
    resetToAuto,
    detectedCountry,
    convert,
    format,
  };
}
