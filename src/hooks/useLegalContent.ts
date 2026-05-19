import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useComplianceFramework } from "@/components/legal/ComplianceRouter";
import type { LegalDocumentContent } from "@/i18n/legal-types";

export type { LegalDocumentContent, LegalSection } from "@/i18n/legal-types";

export function interpolateLegal(
  text: string,
  vars: Record<string, string | number | boolean>
): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = vars[key];
    return value !== undefined && value !== null ? String(value) : `{{${key}}}`;
  });
}

export function usePrivacySections(): LegalDocumentContent | undefined {
  const { i18n } = useTranslation();
  return (
    i18n.getResourceBundle(i18n.language, "translation")?.legalPrivacy ??
    i18n.getResourceBundle("en", "translation")?.legalPrivacy
  );
}

export function useTermsSections(): LegalDocumentContent | undefined {
  const { i18n } = useTranslation();
  return (
    i18n.getResourceBundle(i18n.language, "translation")?.legalTerms ??
    i18n.getResourceBundle("en", "translation")?.legalTerms
  );
}

export function useLegalInterpolationVars() {
  const { t } = useTranslation();
  const { framework: f } = useComplianceFramework();

  return useMemo(() => {
    const privacyLaw =
      f?.privacyLaw ?? t("legal.defaults.internationalPrivacyStandards");
    const parentalConsentPhrase = f?.requiresParentalConsent
      ? t("legal.defaults.verifiableParentalConsent")
      : t("legal.defaults.appropriateSafeguards");
    const rightToBeForgottenDetail = f?.rightToBeForgotten
      ? t("legal.defaults.yesWithLaw", { law: privacyLaw })
      : t("legal.defaults.limited");
    const dataPortabilityDetail = f?.dataPortability
      ? t("legal.defaults.yesWithLaw", { law: privacyLaw })
      : t("legal.defaults.limited");
    const cookieConsentNote = f?.requiresCookieConsent
      ? t("legal.defaults.cookieConsentRequired", { law: privacyLaw })
      : t("legal.defaults.cookieConsentBrowser");

    return {
      privacyLaw,
      dataRetentionDays: f?.dataRetentionDays ?? 1825,
      transactionRetentionDays: f?.dataRetentionDays ?? 2555,
      breachNotificationHours: f?.breachNotificationHours ?? 72,
      ageOfConsent: f?.ageOfConsent ?? 16,
      parentalConsentPhrase,
      rightToBeForgottenDetail,
      dataPortabilityDetail,
      cookieConsentNote,
      taxRecordRetentionYears: f?.dataRetentionDays ?? 7,
    };
  }, [f, t]);
}
