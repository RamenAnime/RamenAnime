import { trpc } from "@/providers/trpc";
import { useComplianceFramework } from "../legal/ComplianceRouter";

interface TaxCalculatorProps { subtotal: number; buyerCountry?: string; sellerCountry?: string; }

export function TaxCalculator({ subtotal, buyerCountry = "US", sellerCountry = "US" }: TaxCalculatorProps) {
  const { framework } = useComplianceFramework();
  const { data: taxData, isLoading } = trpc.tax.calculate.useQuery(
    { subtotal, countryCode: buyerCountry },
    { enabled: subtotal > 0, staleTime: 60000 }
  );

  const isCrossBorder = buyerCountry !== sellerCountry;

  if (isLoading) {
    return (
      <div className="space-y-3 text-sm animate-pulse">
        <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="text-muted-foreground">Calculating...</span></div>
        <div className="flex justify-between font-semibold"><span>Total</span><span>--</span></div>
      </div>
    );
  }

  if (taxData == null) {
    return <div className="text-sm text-red-500">Unable to calculate tax. Please refresh or contact support.</div>;
  }

  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>${taxData.subtotal.toFixed(2)}</span></div>
      {taxData.vatRate > 0 && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">{framework?.vatName ?? "Tax"} ({taxData.vatRate}%)<span className="text-xs ml-1 text-green-600">Live Rate</span></span>
          <span>${taxData.vatAmount.toFixed(2)}</span>
        </div>
      )}
      {taxData.vatRate === 0 && <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span className="text-muted-foreground">Not applicable in {buyerCountry}</span></div>}
      <div className="flex justify-between"><span className="text-muted-foreground">Platform Fee (8%)</span><span>${taxData.platformFee.toFixed(2)}</span></div>
      {isCrossBorder && <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">Cross-border transaction. Import duties may apply in {buyerCountry}.</div>}
      <div className="border-t pt-2 flex justify-between font-semibold text-base"><span>Total</span><span>${taxData.total.toFixed(2)}</span></div>
      <p className="text-xs text-muted-foreground">
        Tax rate pulled live for {buyerCountry}.{framework?.requiresVatCollection ? " We collect and remit applicable taxes as a marketplace facilitator." : " Sellers are responsible for tax compliance."}
        {taxData.lastUpdated && <span className="block mt-1">Rate last updated: {new Date(taxData.lastUpdated).toLocaleDateString()}</span>}
      </p>
    </div>
  );
}