import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { trpc } from "@/providers/trpc";
import { useTranslation } from "react-i18next";
import { useLocalizedLabels } from "@/lib/label-i18n";
import { toast } from "sonner";

const REVOLUT_USERNAME =
  (import.meta.env.VITE_REVOLUT_USERNAME as string) || "jasonakw8";
const PAYPAL_CLIENT_ID =
  (import.meta.env.VITE_PAYPAL_CLIENT_ID as string) ||
  "BAASlHbTmeb5Ew6qO8-3cDi2V-Ox9RR6PAhDBtM8neOZ4UsC7yUhZzFbSnpWWwhX4TGPs5qZviWNkriI4w";

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: { layout?: string; color?: string; shape?: string; label?: string };
        createOrder: (data: unknown, actions: { order: { create: (o: unknown) => Promise<string> } }) => Promise<string>;
        onApprove: (data: { orderID: string }, actions: { order: { capture: () => Promise<PayPalCapture> } }) => Promise<void>;
        onError?: (err: unknown) => void;
      }) => { render: (el: HTMLElement) => Promise<void> };
    };
  }
}

type PayPalCapture = {
  id: string;
  payer?: { name?: { given_name?: string; surname?: string }; email_address?: string };
  purchase_units?: Array<{ amount?: { value?: string; currency_code?: string } }>;
};

function PayPalDonateButton({
  amount,
  onSuccess,
  onError,
}: {
  amount: string;
  onSuccess: (capture: PayPalCapture) => void;
  onError: (message: string) => void;
}) {
  const { t } = useTranslation();
  const paypalRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const renderedRef = useRef(false);

  useEffect(() => {
    if (!document.getElementById("paypal-sdk")) {
      const script = document.createElement("script");
      script.id = "paypal-sdk";
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
      script.async = true;
      script.onload = () => setLoaded(true);
      document.body.appendChild(script);
    } else if (window.paypal) {
      setLoaded(true);
    }
  }, []);

  const renderButtons = useCallback(async () => {
    if (!loaded || !paypalRef.current || !window.paypal || renderedRef.current) return;
    renderedRef.current = true;
    paypalRef.current.innerHTML = "";

    const value = amount && parseFloat(amount) >= 1 ? parseFloat(amount).toFixed(2) : "5.00";

    try {
      await window.paypal
        .Buttons({
          style: { layout: "vertical", color: "gold", shape: "rect", label: "donate" },
          createOrder: (_data, actions) =>
            actions.order.create({
              purchase_units: [{ amount: { currency_code: "USD", value } }],
            }),
          onApprove: async (_data, actions) => {
            const details = await actions.order.capture();
            onSuccess(details);
          },
          onError: (err) => {
            onError(err instanceof Error ? err.message : String(err));
          },
        })
        .render(paypalRef.current);
    } catch (err) {
      onError(err instanceof Error ? err.message : String(err));
    }
  }, [loaded, amount, onSuccess, onError]);

  useEffect(() => {
    renderedRef.current = false;
    void renderButtons();
  }, [renderButtons]);

  return (
    <div>
      {!loaded && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          {t("donations.loadingPayPal")}
        </div>
      )}
      <div ref={paypalRef} style={{ width: "100%", minHeight: "50px" }} />
    </div>
  );
}

export default function Donations() {
  const { t } = useTranslation();
  const { genericError } = useLocalizedLabels();
  const utils = trpc.useUtils();
  const [amount, setAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: publicDonations } = trpc.donation.listPublic.useQuery();

  const recordPayment = trpc.donation.recordPayment.useMutation({
    onSuccess: async () => {
      await utils.donation.listPublic.invalidate();
      await utils.admin.getStats.invalidate();
      await utils.admin.listDonations.invalidate();
    },
  });

  const revolutUrl = `https://revolut.me/${REVOLUT_USERNAME}${amount ? `?amount=${amount}` : ""}`;

  const copyRevolutLink = () => {
    navigator.clipboard.writeText(`https://revolut.me/${REVOLUT_USERNAME}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success(t("donations.copied"));
  };

  const handlePayPalSuccess = async (capture: PayPalCapture) => {
    const paid = capture.purchase_units?.[0]?.amount?.value ?? (amount || "5.00");
    const currency = capture.purchase_units?.[0]?.amount?.currency_code ?? "USD";
    const payerName = [capture.payer?.name?.given_name, capture.payer?.name?.surname]
      .filter(Boolean)
      .join(" ");
    try {
      await recordPayment.mutateAsync({
        donorName: donorName.trim() || payerName || undefined,
        donorEmail: capture.payer?.email_address,
        amount: paid,
        currency,
        paymentMethod: "paypal",
        transactionId: capture.id,
        message: message.trim() || undefined,
      });
      toast.success(t("donations.paypalRecorded"));
    } catch (err) {
      toast.error(genericError(err));
    }
  };

  const confirmRevolut = async () => {
    const parsed = parseFloat(amount);
    if (Number.isNaN(parsed) || parsed < 0.5) {
      toast.error(t("donations.revolutAmountRequired"));
      return;
    }
    try {
      await recordPayment.mutateAsync({
        donorName: donorName.trim() || undefined,
        amount: parsed.toFixed(2),
        currency: "USD",
        paymentMethod: "revolut",
        message: message.trim() || undefined,
      });
      toast.success(t("donations.revolutRecorded"));
      setAmount("");
      setMessage("");
    } catch (err) {
      toast.error(genericError(err));
    }
  };

  const totalRaised =
    publicDonations?.reduce((sum, d) => {
      const amt = parseFloat(d.amount ?? "0");
      return Number.isNaN(amt) ? sum : sum + amt;
    }, 0) ?? 0;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">{t("donations.title")}</h1>
          <p className="text-muted-foreground max-w-md mx-auto">{t("donations.desc")}</p>
          {totalRaised > 0 && (
            <p className="text-primary font-semibold text-lg">
              {t("donations.raisedSummary", {
                amount: totalRaised.toFixed(2),
                count: publicDonations?.length ?? 0,
              })}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="donor-name">{t("donations.donorName")}</Label>
            <Input
              id="donor-name"
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder={t("donations.donorNamePlaceholder")}
              className="bg-muted/50"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="donor-message">{t("donations.message")}</Label>
            <Input
              id="donor-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={t("donations.messagePlaceholder")}
              className="bg-muted/50"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card border-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-400">P</span>
                </div>
                <h2 className="font-semibold text-foreground">{t("donations.paypalTitle")}</h2>
              </div>
              <p className="text-sm text-muted-foreground">{t("donations.paypalDesc")}</p>
              <div className="space-y-2">
                <Label htmlFor="paypal-amount">{t("donations.amountUsd")}</Label>
                <Input
                  id="paypal-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="5.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-muted/50"
                />
              </div>
              <PayPalDonateButton
                amount={amount}
                onSuccess={handlePayPalSuccess}
                onError={(msg) => toast.error(msg || t("donations.recordFailed"))}
              />
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-violet-400">R</span>
                </div>
                <h2 className="font-semibold text-foreground">{t("donations.revolutTitle")}</h2>
              </div>
              <p className="text-sm text-muted-foreground">{t("donations.revolutDesc")}</p>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground shrink-0">{t("donations.amountUsd")}</span>
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="10"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="flex-1 h-9 bg-muted/50"
                  />
                </div>
                <div className="flex gap-2">
                  <Button asChild className="flex-1" size="sm">
                    <a href={revolutUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t("donations.openRevolut")}
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={copyRevolutLink} aria-label={t("donations.copyLink")}>
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  className="w-full"
                  size="sm"
                  variant="secondary"
                  onClick={confirmRevolut}
                  disabled={recordPayment.isPending}
                >
                  {t("donations.confirmRevolut")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {publicDonations && publicDonations.length > 0 && (
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <h2 className="font-semibold text-foreground mb-4">{t("donations.recentDonors")}</h2>
              <div className="space-y-2">
                {publicDonations.slice(0, 10).map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Heart className="h-3 w-3 text-primary shrink-0" />
                      <span className="text-sm text-foreground truncate">
                        {d.donorName ?? t("donations.anonymous")}
                      </span>
                      {d.message && (
                        <span className="text-xs text-muted-foreground italic truncate max-w-[140px]">
                          &quot;{d.message}&quot;
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-primary shrink-0 ml-2">
                      ${parseFloat(d.amount ?? "0").toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <p className="text-center text-xs text-muted-foreground">{t("donations.disclaimer")}</p>
      </div>
    </div>
  );
}
