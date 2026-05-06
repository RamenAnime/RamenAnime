import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, ExternalLink, Copy, Check } from "lucide-react";

const REVOLUT_USERNAME = "jasonakw8";
const PAYPAL_CLIENT_ID = "BAASlHbTmeb5Ew6qO8-3cDi2V-Ox9RR6PAhDBtM8neOZ4UsC7yUhZzFbSnpWWwhX4TGPs5qZviWNkriI4w";
const PAYPAL_HOSTED_BUTTON_ID = "5G88A7F9K4WBA";

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
        window.paypal.HostedButtons({
          hostedButtonId: PAYPAL_HOSTED_BUTTON_ID,
        }).render(paypalRef.current);
      } catch {
        // ignore
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
  const revolutUrl = `https://revolut.me/${REVOLUT_USERNAME}?amount=${amount || "0"}&currency=USD`;

  const copyLink = () => {
    navigator.clipboard.writeText(`https://revolut.me/${REVOLUT_USERNAME}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md text-center space-y-8">

        {/* Header */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Support Ramen Anime</h1>
          <p className="text-muted-foreground">
            Your donations help us grow the anime collectibles community. Every contribution matters!
          </p>
        </div>

        {/* Amount */}
        <div className="relative max-w-xs mx-auto">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">$</span>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="1"
            step="0.01"
            className="pl-10 bg-muted/50 text-lg font-semibold text-center"
          />
        </div>

        {/* PayPal */}
        <PayPalButton />

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border/50" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border/50" />
        </div>

        {/* Revolut */}
        <div className="space-y-3">
          <a
            href={amount && parseFloat(amount) > 0 ? revolutUrl : "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!amount || parseFloat(amount) <= 0) {
                e.preventDefault();
              }
            }}
            className={`inline-flex items-center justify-center gap-2 font-medium py-3 px-6 rounded-lg border transition-all ${
              amount && parseFloat(amount) > 0
                ? "border-primary/50 bg-primary/5 text-primary hover:bg-primary/10"
                : "border-border/30 text-muted-foreground cursor-not-allowed opacity-50"
            }`}
          >
            <ExternalLink className="h-4 w-4" />
            {amount && parseFloat(amount) > 0
              ? `Send $${amount} via Revolut`
              : "Enter an amount"
            }
          </a>

          <div className="flex items-center justify-center gap-2">
            <code className="bg-muted/30 border border-border/50 rounded-lg px-3 py-2 text-xs text-muted-foreground">
              revolut.me/{REVOLUT_USERNAME}
            </code>
            <Button size="sm" variant="ghost" onClick={copyLink}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
