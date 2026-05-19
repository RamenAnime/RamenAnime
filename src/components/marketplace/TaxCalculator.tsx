import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { useComplianceFramework } from "../legal/ComplianceRouter";

interface TaxCalculatorProps { subtotal: number; buyerCountry?: string; sellerCountry?: string; }

export function TaxCalculator({ subtotal, buyerCountry = "US", sellerCountry = "US" }: TaxCalculatorProps) {
  const { t } = useTranslation();
  const { framework } = useComplianceFramework();
  const { data: taxData, isLoading } = trpc.tax.calculate.useQuery(
    { subtotal, countryCode: buyerCountry },
    { enabled: subtotal > 0, staleTime: 60000 }
  );

  const isCrossBorder = buyerCountry !== sellerCountry;
  const taxLabel = framework?.vatName ?? t("tax.tax");

  if (isLoading) {
    return (
      <div className="space-y-3 text-sm animate-pulse">
        <div className="flex justify-between"><span className="text-muted-foreground">{t("tax.subtotal")}</span><span>${subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">{t("tax.tax")}</span><span className="text-muted-foreground">{t("tax.calculating")}</span></div>
        <div className="flex justify-between font-semibold"><span>{t("tax.total")}</span><span>--</span></div>
      </div>
    );
  }

  if (taxData == null) {
    return <div className="text-sm text-red-500">{t("tax.calcError")}</div>;
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between"><span className="text-muted-foreground">{t("tax.subtotal")}</span><span>${taxData.subtotal.toFixed(2)}</span></div>
      {taxData.vatRate > 0 && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {taxLabel} ({taxData.vatRate}%)
            <span className="text-xs ml-1 text-green-600">{t("tax.liveRate")}</span>
          </span>
          <span>${taxData.vatAmount.toFixed(2)}</span>
        </div>
      )}
      {taxData.vatRate === 0 && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">{t("tax.tax")}</span>
          <span className="text-muted-foreground">{t("tax.notApplicable", { country: buyerCountry })}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-muted-foreground">{t("tax.platformFee")}</span>
        <span>${taxData.platformFee.toFixed(2)}</span>
      </div>
      {isCrossBorder && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          {t("tax.crossBorderDetail", { country: buyerCountry })}
        </div>
      )}
      <div className="border-t pt-2 flex justify-between font-semibold text-base">
        <span>{t("tax.total")}</span>
        <span>${taxData.total.toFixed(2)}</span>
      </div>
      <p className="text-xs text-muted-foreground">
        {t("tax.disclaimerLive", { country: buyerCountry })}
        {framework?.requiresVatCollection ? t("tax.disclaimerFacilitator") : t("tax.disclaimerSeller")}
        {taxData.lastUpdated && (
          <span className="block mt-1">
            {t("tax.rateUpdated", { date: new Date(taxData.lastUpdated).toLocaleDateString() })}
          </span>
        )}
      </p>
    </div>
  );
}
