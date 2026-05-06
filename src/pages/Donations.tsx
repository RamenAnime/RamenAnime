import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart, DollarSign, Globe, CheckCircle2,
  Shield, ExternalLink, Copy, Check, Landmark,
} from "lucide-react";

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "\u20AC", name: "Euro" },
  { code: "GBP", symbol: "\u00A3", name: "British Pound" },
  { code: "JPY", symbol: "\u00A5", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "KRW", symbol: "\u20A9", name: "South Korean Won" },
  { code: "CNY", symbol: "\u00A5", name: "Chinese Yuan" },
  { code: "INR", symbol: "\u20B9", name: "Indian Rupee" },
  { code: "THB", symbol: "\u0E3F", name: "Thai Baht" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
];

const REVOLUT_USERNAME = "jasonakw8";

// PayPal Hosted Button config
const PAYPAL_CLIENT_ID = "BAASlHbTmeb5Ew6qO8-3cDi2V-Ox9RR6PAhDBtM8neOZ4UsC7yUhZzFbSnpWWwhX4TGPs5qZviWNkriI4w";
const PAYPAL_HOSTED_BUTTON_ID = "5G88A7F9K4WBA";

declare global {
  interface Window {
    paypal?: any;
  }
}

function PayPalButton({ currency }: { currency: string }) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Load PayPal SDK if not already loaded
    if (!document.getElementById("paypal-sdk")) {
      const script = document.createElement("script");
      script.id = "paypal-sdk";
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&components=hosted-buttons&enable-funding=venmo&currency=${currency}`;
      script.crossOrigin = "anonymous";
      script.async = true;
      script.onload = () => setLoaded(true);
      script.onerror = () => setError(true);
      document.body.appendChild(script);
    } else if (window.paypal) {
      setLoaded(true);
    }
  }, [currency]);

  useEffect(() => {
    if (loaded && paypalRef.current && window.paypal) {
      try {
        paypalRef.current.innerHTML = "";
        window.paypal.HostedButtons({
          hostedButtonId: PAYPAL_HOSTED_BUTTON_ID,
        }).render(paypalRef.current);
      } catch {
        setError(true);
      }
    }
  }, [loaded]);

  if (error) {
    return (
      <p className="text-sm text-destructive text-center">
        PayPal button failed to load. Please use Revolut below.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {!loaded && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          <span className="ml-2 text-sm text-muted-foreground">Loading PayPal...</span>
        </div>
      )}
      <div ref={paypalRef} className="flex justify-center" />
    </div>
  );
}

export default function Donations() {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
  const revolutUrl = `https://revolut.me/${REVOLUT_USERNAME}?amount=${amount}&currency=${currency}&note=RamenAnime+Donation`;

  const createDonation = trpc.donation.create.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  const handleDonate = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    createDonation.mutate({
      donorName: name || "Anonymous",
      donorEmail: email || undefined,
      amount,
      currency,
      countryCode: "US",
      paymentMethod: "paypal",
      message: message || undefined,
    });
  };

  const copyRevolut = () => {
    navigator.clipboard.writeText(`https://revolut.me/${REVOLUT_USERNAME}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container px-4 md:px-6 max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {t("donate.title", "Support Ramen Anime")}
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Your donations help us grow the anime collectibles community and improve the marketplace.
            Every contribution matters!
          </p>
        </div>

        {!submitted ? (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 md:p-8 space-y-6">

              {/* Amount Section */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">
                  Choose Amount & Currency
                </label>
                <div className="flex flex-wrap gap-2">
                  {CURRENCIES.map((c) => (
                    <Badge
                      key={c.code}
                      variant={currency === c.code ? "default" : "outline"}
                      className={`cursor-pointer text-sm ${currency === c.code ? "bg-primary text-primary-foreground" : "border-border/50 hover:border-primary/30"}`}
                      onClick={() => setCurrency(c.code)}
                    >
                      {c.symbol} {c.code}
                    </Badge>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-lg">
                    {selectedCurrency.symbol}
                  </span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    className="pl-10 bg-muted/50 text-lg font-semibold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                    {selectedCurrency.code}
                  </span>
                </div>
              </div>

              {/* Optional Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Name (optional)</label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="bg-muted/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Email (optional)</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="For receipt"
                    className="bg-muted/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Message (optional)</label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Say something nice..."
                  rows={2}
                  className="bg-muted/50"
                />
              </div>

              {/* PayPal Section */}
              <div className="border-t border-border/50 pt-5 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Pay with PayPal</p>
                </div>
                <PayPalButton currency={currency} />
                <p className="text-xs text-muted-foreground text-center">
                  Supports PayPal balance, cards, Venmo, and PayPal Credit
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>

              {/* Revolut Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Landmark className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Pay with Revolut</p>
                </div>
                <a
                  href={amount && parseFloat(amount) > 0 ? revolutUrl : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!amount || parseFloat(amount) <= 0) {
                      e.preventDefault();
                      return;
                    }
                    handleDonate();
                  }}
                  className={`flex items-center justify-center gap-2 w-full font-medium py-3 px-4 rounded-lg border transition-all ${
                    amount && parseFloat(amount) > 0
                      ? "border-primary/50 bg-primary/5 text-primary hover:bg-primary/10"
                      : "border-border/30 text-muted-foreground cursor-not-allowed opacity-50"
                  }`}
                >
                  <Landmark className="h-4 w-4" />
                  {amount && parseFloat(amount) > 0
                    ? `Send ${selectedCurrency.symbol}${amount} ${selectedCurrency.code} via Revolut`
                    : "Enter an amount above"
                  }
                  <ExternalLink className="h-3 w-3" />
                </a>
                {amount && parseFloat(amount) > 0 && (
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted/30 border border-border/50 rounded-lg px-3 py-2 text-xs break-all text-muted-foreground">
                      revolut.me/{REVOLUT_USERNAME}
                    </code>
                    <Button size="sm" variant="ghost" onClick={copyRevolut} className="shrink-0">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Thank You Screen */
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-8 text-center space-y-5">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Thank You!</h2>
              <p className="text-muted-foreground">
                Your donation of <strong className="text-foreground">{selectedCurrency.symbol}{amount} {selectedCurrency.code}</strong> means the world to us.
              </p>
              <p className="text-sm text-muted-foreground">
                If you used PayPal, your payment is being processed. If you used Revolut, click below to complete your payment.
              </p>

              {/* Revolut completion */}
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 space-y-3">
                <a
                  href={revolutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-lg hover:bg-primary/90 transition-all"
                >
                  <Landmark className="h-4 w-4" />
                  Complete Payment on Revolut
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => {
                  setSubmitted(false);
                  setAmount("");
                  setName("");
                  setEmail("");
                  setMessage("");
                }}
              >
                <Heart className="mr-2 h-4 w-4" />
                Make Another Donation
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          <Card className="bg-card/30 border-border/30">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 text-primary mb-2 mx-auto" />
              <p className="font-medium text-foreground text-sm">Multiple Currencies</p>
              <p className="text-xs text-muted-foreground">15 currencies supported</p>
            </CardContent>
          </Card>
          <Card className="bg-card/30 border-border/30">
            <CardContent className="p-4 text-center">
              <Shield className="h-6 w-6 text-primary mb-2 mx-auto" />
              <p className="font-medium text-foreground text-sm">Secure</p>
              <p className="text-xs text-muted-foreground">PayPal & Revolut handle all payments</p>
            </CardContent>
          </Card>
          <Card className="bg-card/30 border-border/30">
            <CardContent className="p-4 text-center">
              <Globe className="h-6 w-6 text-primary mb-2 mx-auto" />
              <p className="font-medium text-foreground text-sm">Global</p>
              <p className="text-xs text-muted-foreground">Works from any country</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
