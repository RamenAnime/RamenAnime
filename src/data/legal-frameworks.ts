// Country-to-compliance-framework mapping
// This drives which legal documents are shown and which tax rates apply

export type LegalFramework = {
  id: string;
  name: string;
  region: string;
  privacyLaw: string;
  consumerLaw: string;
  vatRate: number; // 0-100
  vatName: string;
  hasDigitalServicesTax: boolean;
  requiresCookieConsent: boolean;
  requiresDPO: boolean;
  dataRetentionDays: number;
  breachNotificationHours: number;
  ageOfConsent: number;
  requiresParentalConsent: boolean;
  rightToBeForgotten: boolean;
  dataPortability: boolean;
  marketplaceTaxRate: number; // Tax on user-to-user sales
  requiresVatCollection: boolean;
  exportControl: string[]; // Restricted item categories
};

export const LEGAL_FRAMEWORKS: Record<string, LegalFramework> = {
  // European Union (GDPR + EU Consumer Rights Directive)
  EU: {
    id: "eu",
    name: "European Union",
    region: "Europe",
    privacyLaw: "GDPR (Regulation 2016/679) + ePrivacy Directive",
    consumerLaw: "EU Consumer Rights Directive 2011/83 + Digital Content Directive",
    vatRate: 20, // Standard rate (varies by member state 17-27%)
    vatName: "VAT",
    hasDigitalServicesTax: true,
    requiresCookieConsent: true,
    requiresDPO: true,
    dataRetentionDays: 2555, // ~7 years for tax records
    breachNotificationHours: 72,
    ageOfConsent: 16, // Can be lowered to 13 by member states
    requiresParentalConsent: true,
    rightToBeForgotten: true,
    dataPortability: true,
    marketplaceTaxRate: 0, // VAT handled separately
    requiresVatCollection: true,
    exportControl: ["military", "dual-use", "encryption"],
  },
  // United Kingdom (UK GDPR + DPA 2018)
  GB: {
    id: "gb",
    name: "United Kingdom",
    region: "Europe",
    privacyLaw: "UK GDPR + Data Protection Act 2018",
    consumerLaw: "Consumer Rights Act 2015",
    vatRate: 20,
    vatName: "VAT",
    hasDigitalServicesTax: false,
    requiresCookieConsent: true,
    requiresDPO: true,
    dataRetentionDays: 2555,
    breachNotificationHours: 72,
    ageOfConsent: 13,
    requiresParentalConsent: true,
    rightToBeForgotten: true,
    dataPortability: true,
    marketplaceTaxRate: 0,
    requiresVatCollection: true,
    exportControl: ["military", "dual-use"],
  },
  // United States (CCPA/CPRA + COPPA + state laws)
  US: {
    id: "us",
    name: "United States",
    region: "North America",
    privacyLaw: "CCPA/CPRA (California) + State Privacy Laws + COPPA (children)",
    consumerLaw: "FTC Act + State Consumer Protection Laws + UCC",
    vatRate: 0, // No federal VAT; sales tax varies by state (0-10%)
    vatName: "Sales Tax",
    hasDigitalServicesTax: false,
    requiresCookieConsent: false, // Opt-out model
    requiresDPO: false,
    dataRetentionDays: 2555,
    breachNotificationHours: 72, // Varies by state
    ageOfConsent: 13, // COPPA
    requiresParentalConsent: true,
    rightToBeForgotten: true, // CCPA deletion right
    dataPortability: true,
    marketplaceTaxRate: 0, // Sales tax on marketplace varies
    requiresVatCollection: false,
    exportControl: ["military", "dual-use", "encryption", "sanctions"],
  },
  // Canada (PIPEDA + Provincial laws)
  CA: {
    id: "ca",
    name: "Canada",
    region: "North America",
    privacyLaw: "PIPEDA + Provincial Privacy Laws",
    consumerLaw: "Consumer Protection Act (Provincial)",
    vatRate: 5, // GST (varies 5-15% with HST/PST)
    vatName: "GST/HST",
    hasDigitalServicesTax: false,
    requiresCookieConsent: true, // Implied consent for cookies
    requiresDPO: false, // Recommended but not required
    dataRetentionDays: 2555,
    breachNotificationHours: 72, // PIPEDA
    ageOfConsent: 13,
    requiresParentalConsent: true,
    rightToBeForgotten: false, // PIPEDA has deletion right but not as strong
    dataPortability: true,
    marketplaceTaxRate: 0,
    requiresVatCollection: true,
    exportControl: ["military", "dual-use"],
  },
  // Japan (APPI - Act on Protection of Personal Information)
  JP: {
    id: "jp",
    name: "Japan",
    region: "Asia",
    privacyLaw: "APPI (Act on Protection of Personal Information) 2022 Amendment",
    consumerLaw: "Consumer Contract Act + Specified Commercial Transactions Act",
    vatRate: 10, // Consumption tax
    vatName: "Consumption Tax",
    hasDigitalServicesTax: false,
    requiresCookieConsent: true,
    requiresDPO: false, // Encouraged
    dataRetentionDays: 1825, // 5 years
    breachNotificationHours: 72, // Voluntary but expected
    ageOfConsent: 15, // Minors under 15 require parental consent for data
    requiresParentalConsent: true,
    rightToBeForgotten: true, // 2022 amendment
    dataPortability: false,
    marketplaceTaxRate: 0,
    requiresVatCollection: true,
    exportControl: ["military", "dual-use", "crypto"],
  },
  // South Korea (PIPA)
  KR: {
    id: "kr",
    name: "South Korea",
    region: "Asia",
    privacyLaw: "PIPA (Personal Information Protection Act)",
    consumerLaw: "Framework Act on Consumers + e-Commerce Act",
    vatRate: 10,
    vatName: "VAT",
    hasDigitalServicesTax: false,
    requiresCookieConsent: true,
    requiresDPO: true,
    dataRetentionDays: 1825,
    breachNotificationHours: 72,
    ageOfConsent: 14,
    requiresParentalConsent: true,
    rightToBeForgotten: true,
    dataPortability: true,
    marketplaceTaxRate: 0,
    requiresVatCollection: true,
    exportControl: ["military", "dual-use", "crypto"],
  },
  // China (PIPL - Personal Information Protection Law)
  CN: {
    id: "cn",
    name: "China",
    region: "Asia",
    privacyLaw: "PIPL (Personal Information Protection Law) 2021 + CSL + DSL",
    consumerLaw: "Consumer Rights Protection Law + E-Commerce Law",
    vatRate: 13, // Standard rate
    vatName: "VAT",
    hasDigitalServicesTax: false,
    requiresCookieConsent: true,
    requiresDPO: true, // Must designate person responsible
    dataRetentionDays: 1825,
    breachNotificationHours: 72,
    ageOfConsent: 14,
    requiresParentalConsent: true,
    rightToBeForgotten: true,
    dataPortability: false,
    marketplaceTaxRate: 0,
    requiresVatCollection: true,
    exportControl: ["military", "dual-use", "crypto", "content"],
  },
  // Hong Kong (PDPO)
  HK: {
    id: "hk",
    name: "Hong Kong",
    region: "Asia",
    privacyLaw: "PDPO (Personal Data Privacy Ordinance)",
    consumerLaw: "Sale of Goods Ordinance + Trade Descriptions Ordinance",
    vatRate: 0, // No VAT/GST in Hong Kong
    vatName: "N/A",
    hasDigitalServicesTax: false,
    requiresCookieConsent: false,
    requiresDPO: false,
    dataRetentionDays: 1825,
    breachNotificationHours: 72, // Voluntary
    ageOfConsent: 18,
    requiresParentalConsent: true,
    rightToBeForgotten: false, // No statutory right
    dataPortability: false,
    marketplaceTaxRate: 0,
    requiresVatCollection: false,
    exportControl: ["military", "dual-use"],
  },
  // Brazil (LGPD)
  BR: {
    id: "br",
    name: "Brazil",
    region: "South America",
    privacyLaw: "LGPD (Lei Geral de Protecao de Dados) 13.709/2018",
    consumerLaw: "CDC (Codigo de Defesa do Consumidor)",
    vatRate: 17, // ICMS varies by state
    vatName: "ICMS",
    hasDigitalServicesTax: false,
    requiresCookieConsent: true,
    requiresDPO: true,
    dataRetentionDays: 1825,
    breachNotificationHours: 72,
    ageOfConsent: 18, // No specific provision for minors
    requiresParentalConsent: true,
    rightToBeForgotten: true,
    dataPortability: true,
    marketplaceTaxRate: 0,
    requiresVatCollection: false, // Complex state-based system
    exportControl: ["military"],
  },
  // Australia (Privacy Act 1988 + APPs)
  AU: {
    id: "au",
    name: "Australia",
    region: "Oceania",
    privacyLaw: "Privacy Act 1988 + APPs (Australian Privacy Principles)",
    consumerLaw: "Australian Consumer Law (ACL)",
    vatRate: 10, // GST
    vatName: "GST",
    hasDigitalServicesTax: false,
    requiresCookieConsent: false, // No cookie law
    requiresDPO: false, // Recommended
    dataRetentionDays: 2555,
    breachNotificationHours: 72, // OAIC
    ageOfConsent: 15, // APP guidelines
    requiresParentalConsent: true,
    rightToBeForgotten: false, // No explicit right
    dataPortability: true,
    marketplaceTaxRate: 0,
    requiresVatCollection: true,
    exportControl: ["military", "dual-use"],
  },
  // Default / Global
  GLOBAL: {
    id: "global",
    name: "Global (Default)",
    region: "Global",
    privacyLaw: "Best Practices (GDPR-aligned)",
    consumerLaw: "General Consumer Protection Principles",
    vatRate: 0,
    vatName: "N/A",
    hasDigitalServicesTax: false,
    requiresCookieConsent: true,
    requiresDPO: false,
    dataRetentionDays: 1825,
    breachNotificationHours: 72,
    ageOfConsent: 16,
    requiresParentalConsent: true,
    rightToBeForgotten: true,
    dataPortability: true,
    marketplaceTaxRate: 0,
    requiresVatCollection: false,
    exportControl: [],
  },
};

// Country code to framework mapping
export const COUNTRY_FRAMEWORK_MAP: Record<string, string> = {
  // EU Member States
  AT: "EU", BE: "EU", BG: "EU", HR: "EU", CY: "EU", CZ: "EU", DK: "EU",
  EE: "EU", FI: "EU", FR: "EU", DE: "EU", GR: "EU", HU: "EU", IE: "EU",
  IT: "EU", LV: "EU", LT: "EU", LU: "EU", MT: "EU", NL: "EU", PL: "EU",
  PT: "EU", RO: "EU", SK: "EU", SI: "EU", ES: "EU", SE: "EU",
  // Others
  US: "US", CA: "CA", GB: "GB", JP: "JP", KR: "KR", CN: "CN", HK: "HK",
  BR: "BR", AU: "AU", NZ: "NZ", MX: "MX",
  // Asia fallbacks to CN framework for safety, or GLOBAL
  SG: "CN", MY: "CN", TH: "CN", VN: "CN", PH: "CN", ID: "CN",
  IN: "CN", TW: "CN",
};

export function getFrameworkForCountry(countryCode: string): LegalFramework {
  const frameworkId = COUNTRY_FRAMEWORK_MAP[countryCode.toUpperCase()] ?? "GLOBAL";
  return LEGAL_FRAMEWORKS[frameworkId] ?? LEGAL_FRAMEWORKS.GLOBAL;
}

// VAT rates by country (simplified - real implementation needs full rate tables)
export const VAT_RATES: Record<string, number> = {
  // EU (standard rates)
  AT: 20, BE: 21, BG: 20, HR: 25, CY: 19, CZ: 21, DK: 25,
  EE: 22, FI: 25.5, FR: 20, DE: 19, GR: 24, HU: 27, IE: 23,
  IT: 22, LV: 21, LT: 21, LU: 17, MT: 18, NL: 21, PL: 23,
  PT: 23, RO: 19, SK: 23, SI: 22, ES: 21, SE: 25,
  // Others
  GB: 20,
  JP: 10,
  KR: 10,
  CN: 13,
  HK: 0,
  SG: 9,
  MY: 8,
  TH: 7,
  VN: 10,
  PH: 12,
  ID: 11,
  IN: 18, // GST
  TW: 5,
  AU: 10,
  NZ: 15,
  CA: 5, // GST
  US: 0, // No federal VAT
  BR: 17, // ICMS average
  MX: 16, // IVA
};

export function getVatRate(countryCode: string): number {
  return VAT_RATES[countryCode.toUpperCase()] ?? 0;
}

export function calculateTax(subtotal: number, countryCode: string): {
  vatAmount: number;
  total: number;
  vatRate: number;
  vatName: string;
} {
  const rate = getVatRate(countryCode);
  const framework = getFrameworkForCountry(countryCode);
  const vatAmount = Math.round(subtotal * (rate / 100) * 100) / 100;
  return {
    vatAmount,
    total: Math.round((subtotal + vatAmount) * 100) / 100,
    vatRate: rate,
    vatName: framework.vatName,
  };
}
