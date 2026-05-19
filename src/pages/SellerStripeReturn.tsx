import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, AlertCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";

export default function SellerStripeReturn() {
  const [params] = useSearchParams();
  const success = params.get("success") === "true";

  const sync = trpc.stripe.syncOnboardingStatus.useMutation({
    onSuccess: (data) => {
      if (data.onboardingComplete) {
        toast.success("Payment account is ready. You can receive payouts on Ramen Anime.");
      } else if (success) {
        toast.message("Stripe setup in progress. Finish any remaining steps in Stripe.");
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
            {success ? "Stripe connected" : "Stripe setup incomplete"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {success
              ? "Your seller payout account is linked to Ramen Anime. List items and buyers can pay by card."
              : "You left Stripe before finishing. Connect again to accept card payments on your listings."}
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link to="/marketplace/new">
                <CreditCard className="w-4 h-4 mr-2" />
                Create a listing
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/marketplace">Back to marketplace</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
