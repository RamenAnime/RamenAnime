import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, ShoppingBag, Package } from "lucide-react";
import { toast } from "sonner";

type ProfileEarningsProps = {
  accentColor: string;
  textColor: string;
};

export default function ProfileEarnings({ accentColor, textColor }: ProfileEarningsProps) {
  const { t } = useTranslation();
  const { data: sales } = trpc.stripe.mySales.useQuery();
  const { data: purchases } = trpc.stripe.myOrders.useQuery();
  const { data: stripeStatus } = trpc.stripe.getSellerStatus.useQuery();
  const { data: analytics } = trpc.marketplace.sellerAnalytics.useQuery();
  const connectStripe = trpc.stripe.createOnboardingLink.useMutation({
    onSuccess: (data) => {
      if (data?.url) window.location.href = data.url;
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      {stripeStatus && !stripeStatus.onboardingComplete && (
        <Card className="border-amber-500/30 bg-amber-500/5 border-0 shadow-lg" style={{ backgroundColor: "#111" }}>
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
            <div className="flex gap-3">
              <CreditCard className="h-8 w-8 shrink-0" style={{ color: accentColor }} />
              <div>
                <p className="font-semibold text-sm" style={{ color: textColor }}>{t("profile.connectStripe")}</p>
                <p className="text-xs mt-1 opacity-70" style={{ color: textColor }}>{t("earnings.feeNote")}</p>
              </div>
            </div>
            <Button
              size="sm"
              className="shrink-0 bg-primary"
              disabled={connectStripe.isPending}
              onClick={() => connectStripe.mutate()}
            >
              {connectStripe.isPending ? t("earnings.connecting") : t("profile.connectStripeBtn")}
            </Button>
          </CardContent>
        </Card>
      )}

      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm mb-4">
          <div className="rounded-lg border border-white/10 p-3">
            <p className="text-lg font-bold" style={{ color: accentColor }}>{analytics.activeListings}</p>
            <p className="opacity-70" style={{ color: textColor }}>{t("earnings.active")}</p>
          </div>
          <div className="rounded-lg border border-white/10 p-3">
            <p className="text-lg font-bold" style={{ color: accentColor }}>{analytics.totalViews}</p>
            <p className="opacity-70" style={{ color: textColor }}>{t("earnings.views")}</p>
          </div>
          <div className="rounded-lg border border-white/10 p-3">
            <p className="text-lg font-bold" style={{ color: accentColor }}>{analytics.totalSales}</p>
            <p className="opacity-70" style={{ color: textColor }}>{t("earnings.sales")}</p>
          </div>
          <div className="rounded-lg border border-white/10 p-3">
            <p className="text-lg font-bold" style={{ color: accentColor }}>${analytics.revenue}</p>
            <p className="opacity-70" style={{ color: textColor }}>{t("earnings.revenue")}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg" style={{ backgroundColor: "#111", borderColor: accentColor + "30" }}>
          <CardContent className="p-5">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: accentColor }}>
              <ShoppingBag className="h-5 w-5" />
              {t("profile.mySales")}
            </h3>
            {!sales?.length ? (
              <p className="text-sm opacity-70" style={{ color: textColor }}>{t("profile.noSales")}</p>
            ) : (
              <ul className="space-y-3">
                {sales.map((order) => (
                  <li key={order.id} className="text-sm border-b border-white/10 pb-2 last:border-0">
                    <div className="flex justify-between gap-2">
                      <span style={{ color: textColor }}>{order.listing?.title ?? t("admin.unknown")}</span>
                      <Badge variant="outline" className="text-xs capitalize">{order.status}</Badge>
                    </div>
                    <p className="text-xs opacity-60 mt-1" style={{ color: textColor }}>
                      {t("profile.orderNumber")} {order.orderNumber} · ${order.totalAmount}
                    </p>
                    {order.listingId && (
                      <Link to={`/marketplace/${order.listingId}`} className="text-xs hover:underline" style={{ color: accentColor }}>
                        {t("earnings.viewListing")}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg" style={{ backgroundColor: "#111", borderColor: accentColor + "30" }}>
          <CardContent className="p-5">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2" style={{ color: accentColor }}>
              <Package className="h-5 w-5" />
              {t("profile.myPurchases")}
            </h3>
            {!purchases?.length ? (
              <p className="text-sm opacity-70" style={{ color: textColor }}>{t("profile.noPurchases")}</p>
            ) : (
              <ul className="space-y-3">
                {purchases.map((order) => (
                  <li key={order.id} className="text-sm border-b border-white/10 pb-2 last:border-0">
                    <div className="flex justify-between gap-2">
                      <span style={{ color: textColor }}>{order.listing?.title ?? t("admin.unknown")}</span>
                      <Badge variant="outline" className="text-xs capitalize">{order.status}</Badge>
                    </div>
                    <p className="text-xs opacity-60 mt-1" style={{ color: textColor }}>
                      {t("profile.orderNumber")} {order.orderNumber} · ${order.totalAmount}
                    </p>
                    {order.listingId && (
                      <Link to={`/marketplace/${order.listingId}`} className="text-xs hover:underline" style={{ color: accentColor }}>
                        {t("earnings.viewListing")}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
