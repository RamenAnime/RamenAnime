import { useCallback } from "react";
import { useTranslation } from "react-i18next";

const CATEGORY_SLUGS = [
  "trading-cards",
  "3d-prints",
  "figures",
  "apparel",
  "accessories",
  "other",
] as const;

const CONDITION_SLUGS = ["new", "like_new", "like-new", "used", "fair", "poor"] as const;

function normalizeCondition(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "_").replace(/-/g, "_");
}

function normalizeCategory(value: string): string {
  return value.toLowerCase().replace(/\s+/g, "-").replace(/_/g, "-");
}

export function countryDisplayName(code: string, language: string): string {
  try {
    const base = language.split("-")[0];
    const dn = new Intl.DisplayNames([base], { type: "region" });
    return dn.of(code) ?? code;
  } catch {
    return code;
  }
}

export function useLocalizedLabels() {
  const { t, i18n } = useTranslation();

  const categoryLabel = useCallback(
    (raw: string | null | undefined) => {
      if (!raw) return "";
      const slug = normalizeCategory(raw);
      if (slug === "all") return t("marketplace.categories.all");
      const key = `marketplace.categories.${slug}`;
      if (CATEGORY_SLUGS.includes(slug as (typeof CATEGORY_SLUGS)[number])) {
        return t(key);
      }
      return t(`createListing.cat_${slug.replace(/-/g, "_")}`, {
        defaultValue: t(key, { defaultValue: raw }),
      });
    },
    [t]
  );

  const conditionLabel = useCallback(
    (raw: string | null | undefined) => {
      if (!raw) return "";
      const norm = normalizeCondition(raw);
      const key = `listing.conditions.${norm}`;
      const fromListing = t(key, { defaultValue: "" });
      if (fromListing) return fromListing;
      const legacy = t(`createListing.${norm}`, { defaultValue: "" });
      if (legacy) return legacy;
      return t(`marketplace.${norm}`, { defaultValue: raw });
    },
    [t]
  );

  const orderStatusLabel = useCallback(
    (status: string | null | undefined) => {
      if (!status) return "";
      const s = status.toLowerCase();
      const detail = t(`orderDetail.status${s.charAt(0).toUpperCase()}${s.slice(1)}Label`, {
        defaultValue: "",
      });
      if (detail) return detail;
      return t(`orders.${s}`, { defaultValue: t(`orderDetail.${s}`, { defaultValue: status }) });
    },
    [t]
  );

  const roleLabel = useCallback(
    (role: string | null | undefined) => t(`admin.roles.${role ?? "user"}`, { defaultValue: role ?? "" }),
    [t]
  );

  const paymentMethodLabel = useCallback(
    (method: string | null | undefined) =>
      t(`donations.methods.${(method ?? "").toLowerCase()}`, { defaultValue: method ?? "" }),
    [t]
  );

  const forumCategoryLabel = useCallback(
    (id: string | null | undefined) => {
      if (!id) return "";
      return t(`forum.subforums.${id}.name`, {
        defaultValue: t(`forum.cat_${id}`, { defaultValue: id }),
      });
    },
    [t]
  );

  const severityLabel = useCallback(
    (severity: string | null | undefined) =>
      t(`swarm.severity.${(severity ?? "").toLowerCase()}`, { defaultValue: severity ?? "" }),
    [t]
  );

  const copyrightStatusLabel = useCallback(
    (status: string | null | undefined) =>
      t(`admin.copyrightStatus.${(status ?? "").toLowerCase()}`, { defaultValue: status ?? "" }),
    [t]
  );

  const countryLabel = useCallback(
    (code: string) => countryDisplayName(code, i18n.language),
    [i18n.language]
  );

  const genericError = useCallback(
    (err: unknown) => {
      const msg = err instanceof Error ? err.message : typeof err === "string" ? err : "";
      if (!msg) return t("errors.generic");
      return t(`errors.${msg}`, { defaultValue: t("errors.generic") });
    },
    [t]
  );

  return {
    categoryLabel,
    conditionLabel,
    orderStatusLabel,
    roleLabel,
    paymentMethodLabel,
    forumCategoryLabel,
    severityLabel,
    copyrightStatusLabel,
    countryLabel,
    genericError,
  };
}
