import { useState } from "react";
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
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
  { code: "MXN", symbol: "MX$", name: "Mexican Peso" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
];

const REVOLUT_USERNAME = "jasonakw8";
const PAYPAL_USERNAME = "ramenanime";

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
  const paypalUrl = `https://paypal.me/${PAYPAL_USERNAME}/${amount}${currency}`;

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
      paymentMethod: "revolut",
      message: message || undefined,
    });
  };

  const copyRevolut = () => {
    navigator.clipboard.writeText(revolutUrl);
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
            Your donations help us grow the anime collectibles community, improve the marketplace,
            and create more awesome features. Every contribution matters!
          </p>
        </div>

        {!submitted ? (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 md:p-8 space-y-6">

              {/* Amount Section */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-foreground">
                  {t("donate.amount", "Choose Amount & Currency")}
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

              {/* Divider */}
              <div className="border-t border-border/50 pt-4 space-y-3">
                <p className="text-xs text-muted-foreground text-center">
                  <Shield className="h-3 w-3 inline mr-1" />
                  Secure payment. No card data stored on our servers.
                </p>

                {/* PRIMARY: Revolut Button */}
                <a
                  href={amount ? revolutUrl : "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!amount || parseFloat(amount) <= 0) {
                      e.preventDefault();
                      return;
                    }
                    handleDonate();
                  }}
                  className={`flex items-center justify-center gap-3 w-full font-semibold py-4 px-6 rounded-xl transition-all ${
                    amount && parseFloat(amount) > 0
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                >
                  <Landmark className="h-5 w-5" />
                  {amount && parseFloat(amount) > 0
                    ? `Donate ${selectedCurrency.symbol}${amount} ${selectedCurrency.code} via Revolut`
                    : "Enter an amount to donate"
                  }
                  <ExternalLink className="h-4 w-4" />
                </a>

                {/* Copy Link Option */}
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

                {/* Secondary: PayPal */}
                {amount && parseFloat(amount) > 0 && (
                  <a
                    href={paypalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleDonate}
                    className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-border/50 text-sm text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-all"
                  >
                    <Globe className="h-4 w-4" />
                    Prefer PayPal? Donate via PayPal.me
                    <ExternalLink className="h-3 w-3" />
                  </a>
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

              {/* Complete Payment Box */}
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-5 space-y-4">
                <p className="font-semibold text-foreground">Complete Your Payment</p>
                <p className="text-sm text-muted-foreground">
                  Click the button below to open Revolut and send your donation.
                  The amount is already filled in for you.
                </p>
                <a
                  href={revolutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground font-semibold py-4 px-6 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  <Landmark className="h-5 w-5" />
                  Pay {selectedCurrency.symbol}{amount} on Revolut
                  <ExternalLink className="h-4 w-4" />
                </a>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-background/50 border border-border/50 rounded-lg px-3 py-2 text-xs break-all text-muted-foreground">
                    {revolutUrl}
                  </code>
                  <Button size="sm" variant="ghost" onClick={copyRevolut}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Reference: <strong>Donation-{Date.now().toString(36).toUpperCase()}</strong>
                </p>
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
              <Landmark className="h-6 w-6 text-primary mb-2 mx-auto" />
              <p className="font-medium text-foreground text-sm">Revolut</p>
              <p className="text-xs text-muted-foreground">135+ currencies, instant, zero fees</p>
            </CardContent>
          </Card>
          <Card className="bg-card/30 border-border/30">
            <CardContent className="p-4 text-center">
              <Shield className="h-6 w-6 text-primary mb-2 mx-auto" />
              <p className="font-medium text-foreground text-sm">Secure</p>
              <p className="text-xs text-muted-foreground">No payment data stored on our servers</p>
            </CardContent>
          </Card>
          <Card className="bg-card/30 border-border/30">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 text-primary mb-2 mx-auto" />
              <p className="font-medium text-foreground text-sm">Global</p>
              <p className="text-xs text-muted-foreground">Works from any country, any device</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
