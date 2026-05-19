import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export default function SellerStripeReturn() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const success = params.get("success") === "true";

  const sync = trpc.stripe.syncOnboardingStatus.useMutation({
    onSuccess: (data) => {
      if (data.onboardingComplete) {
        toast.success(t("sellerStripe.readyToast"));
      } else if (success) {
        toast.message(t("sellerStripe.progressToast"));
      }
    },
  });

  useEffect(() => {
    sync.mutate();
  }, []);

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full border-border/50">
        <CardContent className="p-8 text-center space-y-4">
          {success ? (
            <Check className="w-12 h-12 text-green-500 mx-auto" />
          ) : (
            <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          )}
          <h1 className="text-xl font-bold">
            {success ? t("sellerStripe.connectedTitle") : t("sellerStripe.incompleteTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {success ? t("sellerStripe.connectedDesc") : t("sellerStripe.incompleteDesc")}
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link to="/marketplace/new">
                <CreditCard className="w-4 h-4 mr-2" />
                {t("sellerStripe.createListing")}
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/marketplace">{t("sellerStripe.backMarketplace")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
