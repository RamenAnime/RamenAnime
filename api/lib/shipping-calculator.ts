/** Domestic JP + international shipping estimate matrix (USD). */

export type PackageSize = "envelope" | "small" | "medium" | "large" | "oversize";
export type ShippingPayer = "buyer" | "seller";

export const PACKAGE_SIZES: { id: PackageSize; label: string; labelJa: string }[] = [
  { id: "envelope", label: "Envelope / sleeve", labelJa: "封筒・スリーブ" },
  { id: "small", label: "Small (figurine, few cards)", labelJa: "小型（フィギュア・カード少量）" },
  { id: "medium", label: "Medium (box set)", labelJa: "中型（箱物）" },
  { id: "large", label: "Large (premium figure)", labelJa: "大型（プレミアム figure）" },
  { id: "oversize", label: "Oversize", labelJa: "特大" },
];

const BASE_RATES_USD: Record<PackageSize, { domestic: number; international: number }> = {
  envelope: { domestic: 4, international: 12 },
  small: { domestic: 8, international: 22 },
  medium: { domestic: 15, international: 38 },
  large: { domestic: 28, international: 65 },
  oversize: { domestic: 45, international: 95 },
};

export function estimateShipping(input: {
  packageSize: PackageSize;
  sellerCountry?: string;
  buyerCountry?: string;
  payer?: ShippingPayer;
}): {
  cost: number;
  currency: string;
  payer: ShippingPayer;
  carrierHint: string;
  breakdown: string;
} {
  const seller = (input.sellerCountry || "US").toUpperCase();
  const buyer = (input.buyerCountry || "US").toUpperCase();
  const domestic = seller === buyer || (seller === "JP" && buyer === "JP");
  const rates = BASE_RATES_USD[input.packageSize] ?? BASE_RATES_USD.small;
  const cost = domestic ? rates.domestic : rates.international;
  const payer = input.payer ?? "buyer";
  const carrierHint =
    seller === "JP" || buyer === "JP"
      ? domestic
        ? "Japan Post / Yamato / Sagawa"
        : "Japan Post EMS / DHL"
      : "USPS / FedEx / UPS";

  return {
    cost,
    currency: "USD",
    payer,
    carrierHint,
    breakdown: domestic
      ? `Domestic ${input.packageSize} estimate`
      : `International ${input.packageSize} estimate`,
  };
}
