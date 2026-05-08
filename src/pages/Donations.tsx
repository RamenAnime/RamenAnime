import { useState, useEffect, useRef } from "react";
  import { Button } from "@/components/ui/button";
  import { Input } from "@/components/ui/input";
  import { Card, CardContent } from "@/components/ui/card";
  import { Heart, ExternalLink, Copy, CheckCircle } from "lucide-react";
  import { trpc } from "@/providers/trpc";

  const REVOLUT_USERNAME = "jasonakw8";
  const PAYPAL_CLIENT_ID =
    (import.meta.env.VITE_PAYPAL_CLIENT_ID as string) ||
    "BAASlHbTmeb5Ew6qO8-3cDi2V-Ox9RR6PAhDBtM8neOZ4UsC7yUhZzFbSnpWWwhX4TGPs5qZviWNkriI4w";
  const PAYPAL_HOSTED_BUTTON_ID =
    (import.meta.env.VITE_PAYPAL_HOSTED_BUTTON_ID as string) || "5G88A7F9K4WBA";

  declare global {
    interface Window {
      paypal?: any;
    }
  }

  function PayPalButton() {
    const paypalRef = useRef<HTMLDivElement>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
      if (!document.getElementById("paypal-sdk")) {
        const script = document.createElement("script");
        script.id = "paypal-sdk";
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&components=hosted-buttons&currency=USD&locale=en_US`;
        script.crossOrigin = "anonymous";
        script.async = true;
        script.onload = () => setLoaded(true);
        document.body.appendChild(script);
      } else if (window.paypal) {
        setLoaded(true);
      }
    }, []);

    useEffect(() => {
      if (loaded && paypalRef.current && window.paypal) {
        try {
          paypalRef.current.innerHTML = "";
          window.paypal.HostedButtons({ hostedButtonId: PAYPAL_HOSTED_BUTTON_ID }).render(paypalRef.current);
        } catch {
          // ignore render errors
        }
      }
    }, [loaded]);

    return (
      <div style={{ minWidth: "300px", maxWidth: "500px", width: "100%", margin: "0 auto" }}>
        {!loaded && (
          <div className="text-center py-4 text-sm text-muted-foreground">Loading PayPal...</div>
        )}
        <div ref={paypalRef} style={{ width: "100%", minHeight: "50px" }} />
      </div>
    );
  }

  export default function Donations() {
    const [amount, setAmount] = useState("");
    const [copied, setCopied] = useState(false);

    const { data: publicDonations } = trpc.donation.listPublic.useQuery();

    const revolutUrl = `https://revolut.me/${REVOLUT_USERNAME}${amount ? `?amount=${amount}` : ""}`;

    const copyRevolutLink = () => {
      navigator.clipboard.writeText(`https://revolut.me/${REVOLUT_USERNAME}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    const totalRaised =
      publicDonations?.reduce((sum, d) => {
        const amt = parseFloat(d.amount ?? "0");
        return isNaN(amt) ? sum : sum + amt;
      }, 0) ?? 0;

    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Heart className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Support Ramen Anime</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your support helps keep the platform running and the anime collectibles community growing.
              Every contribution makes a difference.
            </p>
            {totalRaised > 0 && (
              <p className="text-primary font-semibold text-lg">
                ${totalRaised.toFixed(2)} raised by {publicDonations?.length ?? 0} supporters
              </p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-400">P</span>
                  </div>
                  <h2 className="font-semibold text-foreground">PayPal</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Donate securely using your card or PayPal balance.
                </p>
                <PayPalButton />
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-violet-400">R</span>
                  </div>
                  <h2 className="font-semibold text-foreground">Revolut</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Send via Revolut for instant, fee-free transfers.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground shrink-0">Amount (USD)</span>
                    <Input
                      type="number"
                      min="1"
                      placeholder="e.g. 10"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1 h-9 bg-muted/50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1" size="sm">
                      <a href={revolutUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Revolut
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" onClick={copyRevolutLink}>
                      {copied ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {publicDonations && publicDonations.length > 0 && (
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <h2 className="font-semibold text-foreground mb-4">Recent Supporters</h2>
                <div className="space-y-2">
                  {publicDonations.slice(0, 10).map((d) => (
                    <div
                      key={d.id}
                      className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Heart className="h-3 w-3 text-primary shrink-0" />
                        <span className="text-sm text-foreground truncate">
                          {d.donorName ?? "Anonymous"}
                        </span>
                        {d.message && (
                          <span className="text-xs text-muted-foreground italic truncate max-w-[140px]">
                            "{d.message}"
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

          <p className="text-center text-xs text-muted-foreground">
            All donations are voluntary and non-refundable. Ramen Anime is not a registered non-profit.
          </p>
        </div>
      </div>
    );
  }
  