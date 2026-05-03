import { useCallback } from "react";
import i18n from "../i18n";

export function useLocale() {
  const currentLang = i18n.language ?? "en";
  const locale = resolveLocale(currentLang);

  const formatDate = useCallback((date: Date | string | number, opts?: Intl.DateTimeFormatOptions) => {
    const d = typeof date === "string" ? new Date(date) : date instanceof Date ? date : new Date(date);
    try {
      return new Intl.DateTimeFormat(locale, opts ?? { year: "numeric", month: "short", day: "numeric" }).format(d);
    } catch {
      return d.toLocaleDateString("en-US");
    }
  }, [locale]);

  const formatDateTime = useCallback((date: Date | string | number, opts?: Intl.DateTimeFormatOptions) => {
    const d = typeof date === "string" ? new Date(date) : date instanceof Date ? date : new Date(date);
    try {
      return new Intl.DateTimeFormat(locale, opts ?? { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(d);
    } catch {
      return d.toLocaleString("en-US");
    }
  }, [locale]);

  const formatRelativeTime = useCallback((date: Date | string | number) => {
    const d = typeof date === "string" ? new Date(date) : date instanceof Date ? date : new Date(date);
    const diffMs = Date.now() - d.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    try {
      const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
      if (Math.abs(diffDay) >= 1) return rtf.format(-diffDay, "day");
      if (Math.abs(diffHour) >= 1) return rtf.format(-diffHour, "hour");
      if (Math.abs(diffMin) >= 1) return rtf.format(-diffMin, "minute");
      return rtf.format(-diffSec, "second");
    } catch {
      if (Math.abs(diffDay) >= 1) return `${Math.abs(diffDay)}d ago`;
      if (Math.abs(diffHour) >= 1) return `${Math.abs(diffHour)}h ago`;
      if (Math.abs(diffMin) >= 1) return `${Math.abs(diffMin)}m ago`;
      return "just now";
    }
  }, [locale]);

  return { locale, currentLang, formatDate, formatDateTime, formatRelativeTime };
}

function resolveLocale(langCode: string): string {
  const mapping: Record<string, string> = {
    en: "en-US", ja: "ja-JP", ko: "ko-KR", "zh-CN": "zh-CN", "zh-TW": "zh-TW",
    hi: "hi-IN", id: "id-ID", ms: "ms-MY", tl: "fil-PH", vi: "vi-VN", th: "th-TH",
    ar: "ar-SA", he: "he-IL", tr: "tr-TR", de: "de-DE", es: "es-ES", fr: "fr-FR",
    it: "it-IT", nl: "nl-NL", pt: "pt-BR", pl: "pl-PL", ro: "ro-RO", el: "el-GR",
    sv: "sv-SE", cs: "cs-CZ", hu: "hu-HU", bg: "bg-BG", da: "da-DK", fi: "fi-FI",
    sk: "sk-SK", hr: "hr-HR", lt: "lt-LT", lv: "lv-LV", sl: "sl-SI", et: "et-EE",
  };
  if (mapping[langCode]) return mapping[langCode];
  const base = langCode.split("-")[0];
  if (mapping[base]) return mapping[base];
  return "en-US";
}
