import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Heart, DollarSign, Globe, QrCode, CheckCircle2,
  ArrowRight, Shield, ExternalLink, Copy, Check,
} from "lucide-react";

const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "KRW", symbol: "₩", name: "South Korean Won" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "HKD", symbol: "HK$", name: "Hong Kong Dollar" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "MXN", symbol: "$", name: "Mexican Peso" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "THB", symbol: "฿", name: "Thai Baht" },
];

const REVOLUT_USERNAME = "jasonakw8"; // Your Revolut.me username

const COUNTRY_PAYMENTS: Record<string, { methods: { id: string; name: string; icon: string }[]; revolutLink: string; instructions: string }> = {
  US: {
    methods: [
      { id: "card", name: "Credit/Debit Card (Visa/Mastercard/Amex)", icon: "💳" },
      { id: "paypal", name: "PayPal", icon: "🅿️" },
      { id: "venmo", name: "Venmo", icon: "💸" },
      { id: "cashapp", name: "Cash App", icon: "💰" },
      { id: "applepay", name: "Apple Pay", icon: "🍎" },
      { id: "googlepay", name: "Google Pay", icon: "🤖" },
      { id: "revolut", name: "Revolut Pay", icon: "🏦" },
    ],
    revolutLink: `https://revolut.me/${REVOLUT_USERNAME}`,
    instructions: "Pay via Revolut.me, PayPal, Venmo, Cash App, Apple Pay, Google Pay, or any major credit/debit card.",
  },
  CA: {
    methods: [
      { id: "card", name: "Credit/Debit Card (Visa/Mastercard)", icon: "💳" },
      { id: "etransfer", name: "Interac e-Transfer", icon: "🏦" },
      { id: "paypal", name: "PayPal", icon: "🅿️" },
      { id: "applepay", name: "Apple Pay", icon: "🍎" },
      { id: "revolut", name: "Revolut Pay", icon: "🏦" },
    ],
    revolutLink: `https://revolut.me/${REVOLUT_USERNAME}`,
    instructions: "Send Interac e-Transfer to ramenanime@protonmail.com, use Revolut.me, PayPal, or any credit/debit card.",
  },
  JP: {
    methods: [
      { id: "card", name: "Credit/Debit Card (Visa/Mastercard/JCB)", icon: "💳" },
      { id: "paypay", name: "PayPay", icon: "📱" },
      { id: "konbini", name: "Konbini (Convenience Store)", icon: "🏪" },
      { id: "bank", name: "Bank Transfer (Furikomi)", icon: "🏦" },
      { id: "revolut", name: "Revolut Pay", icon: "🏦" },
    ],
    revolutLink: `https://revolut.me/${REVOLUT_USERNAME}`,
    instructions: "Use Revolut.me, PayPay, bank transfer, or pay at any convenience store (Konbini).",
  },
  KR: {
    methods: [
      { id: "card", name: "Credit/Debit Card", icon: "💳" },
      { id: "kakaopay", name: "KakaoPay", icon: "💬" },
      { id: "naverpay", name: "Naver Pay", icon: "🟢" },
      { id: "toss", name: "Toss", icon: "🪙" },
      { id: "samsungpay", name: "Samsung Pay", icon: "📱" },
      { id: "revolut", name: "Revolut Pay", icon: "🏦" },
    ],
    revolutLink: `https://revolut.me/${REVOLUT_USERNAME}`,
    instructions: "Use KakaoPay, Naver Pay, Toss, Samsung Pay, Revolut.me, or any credit/debit card.",
  },
  CN: {
    methods: [
      { id: "alipay", name: "Alipay (支付宝)", icon: "🔵" },
      { id: "wechat", name: "WeChat Pay (微信支付)", icon: "💬" },
      { id: "unionpay", name: "UnionPay (银联)", icon: "🏦" },
      { id: "card", name: "Credit/Debit Card", icon: "💳" },
      { id: "revolut", name: "Revolut Pay", icon: "🏦" },
    ],
    revolutLink: `https://revolut.me/${REVOLUT_USERNAME}`,
    instructions: "Use Alipay, WeChat Pay, UnionPay, or Revolut.me. QR codes available for mobile payment.",
  },
  FR: {
    methods: [
      { id: "card", name: "Credit/Debit Card (CB/Visa/Mastercard)", icon: "💳" },
      { id: "sepa", name: "SEPA Bank Transfer", icon: "🏦" },
      { id: "paypal", name: "PayPal", icon: "🅿️" },
      { id: "applepay", name: "Apple Pay", icon: "🍎" },
      { id: "googlepay", name: "Google Pay", icon: "🤖" },
      { id: "revolut", name: "Revolut Pay", icon: "🏦" },
    ],
    revolutLink: `https://revolut.me/${REVOLUT_USERNAME}`,
    instructions: "Use SEPA transfer, Revolut.me, PayPal, Apple Pay, Google Pay, or any CB/Visa/Mastercard.",
  },
};

export default function Donations() {
  const {} = useTranslation();
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [method, setMethod] = useState("revolut");
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(0);
  const [showQR, setShowQR] = useState(false);

  const country = localStorage.getItem("ramen_anime_country") || "US";
  const countryData = COUNTRY_PAYMENTS[country] || COUNTRY_PAYMENTS.US;

  const createDonation = trpc.donation.create.useMutation({
    onSuccess: () => setStep(2),
  });

  const handleDonate = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    createDonation.mutate({
      donorName: name || "Anonymous",
      donorEmail: email || undefined,
      amount,
      currency,
      countryCode: country,
      paymentMethod: method,
      message: message || undefined,
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(countryData.revolutLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedCurrency = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  return (
    <div className="min-h-screen py-12">
      <div className="container px-4 md:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-10 space-y-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Heart className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Support ラーメンアニメ</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Your donations help us grow the community, improve the marketplace, and create more custom anime merchandise. Every contribution matters!
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>Secure payments via {countryData.methods.map(m => m.name.split(" ")[0]).join(", ")}</span>
          </div>
        </div>

        {step === 0 && (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">1. Choose Amount & Currency</h3>
                <div className="flex flex-wrap gap-2">
                  {CURRENCIES.slice(0, 10).map((c) => (
                    <Badge
                      key={c.code}
                      variant={currency === c.code ? "default" : "outline"}
                      className={`cursor-pointer text-sm ${currency === c.code ? "bg-primary text-primary-foreground" : "border-border/50"}`}
                      onClick={() => setCurrency(c.code)}
                    >
                      {c.symbol} {c.code}
                    </Badge>
                  ))}
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    {selectedCurrency.symbol}
                  </span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    min="1"
                    step="0.01"
                    className="pl-8 bg-muted/50"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    {selectedCurrency.code}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Name (optional)</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="bg-muted/50" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Email (optional)</label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="For receipt" className="bg-muted/50" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Message (optional)</label>
                <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Say something nice..." rows={2} className="bg-muted/50" />
              </div>

              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!amount || parseFloat(amount) <= 0}
                onClick={() => setStep(1)}
              >
                <ArrowRight className="mr-2 h-4 w-4" />
                Choose Payment Method
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 1 && (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold text-primary">
                    {selectedCurrency.symbol}{amount} {selectedCurrency.code}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setStep(0)}>Edit</Button>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-foreground">2. Select Payment Method</h3>
                <p className="text-xs text-muted-foreground">Country detected: {countryData.instructions}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {countryData.methods.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setMethod(m.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                        method === m.id
                          ? "border-primary bg-primary/10"
                          : "border-border/50 bg-card hover:border-primary/30"
                      }`}
                    >
                      <span className="text-2xl">{m.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm">{m.name}</p>
                      </div>
                      {method === m.id && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {method === "revolut" && (
                <div className="space-y-3">
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <p className="font-medium text-foreground flex items-center gap-2">
                      <QrCode className="h-4 w-4" />
                      Revolut.me Payment
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 bg-background border border-border rounded px-3 py-2 text-sm break-all">
                        {countryData.revolutLink}
                      </code>
                      <Button size="sm" variant="outline" onClick={copyLink}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <a
                      href={countryData.revolutLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="mr-1 h-3 w-3" />
                      Open Revolut.me
                    </a>
                    <Dialog open={showQR} onOpenChange={setShowQR}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full">
                          <QrCode className="mr-2 h-4 w-4" />
                          Show QR Code
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border">
                        <DialogHeader>
                          <DialogTitle>Scan to Pay</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center gap-4 py-4">
                          <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center">
                            <QrCode className="h-32 w-32 text-black" />
                          </div>
                          <p className="text-sm text-muted-foreground text-center">
                            Scan with Revolut app, Alipay, WeChat, or your banking app
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleDonate} disabled={createDonation.isPending}>
                  <Heart className="mr-2 h-4 w-4" />
                  {createDonation.isPending ? "Processing..." : `Donate ${selectedCurrency.symbol}${amount}`}
                </Button>
                <Button variant="outline" onClick={() => setStep(0)}>
                  <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                  Back
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Thank You!</h2>
              <p className="text-muted-foreground">
                Your donation of {selectedCurrency.symbol}{amount} {selectedCurrency.code} has been recorded. Please complete the payment using your selected method.
              </p>
              <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
                <p><strong>Method:</strong> {countryData.methods.find(m => m.id === method)?.name}</p>
                <p><strong>Reference:</strong> Donation-{Date.now().toString(36).toUpperCase()}</p>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => { setStep(0); setAmount(""); }}>
                <Heart className="mr-2 h-4 w-4" />
                Make Another Donation
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payment Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          <Card className="bg-card/30 border-border/30">
            <CardContent className="p-4">
              <DollarSign className="h-5 w-5 text-primary mb-2" />
              <p className="font-medium text-foreground text-sm">135+ Currencies</p>
              <p className="text-xs text-muted-foreground">Revolut auto-converts at real exchange rates</p>
            </CardContent>
          </Card>
          <Card className="bg-card/30 border-border/30">
            <CardContent className="p-4">
              <Shield className="h-5 w-5 text-primary mb-2" />
              <p className="font-medium text-foreground text-sm">Secure & Private</p>
              <p className="text-xs text-muted-foreground">No payment data stored on our servers</p>
            </CardContent>
          </Card>
          <Card className="bg-card/30 border-border/30">
            <CardContent className="p-4">
              <Globe className="h-5 w-5 text-primary mb-2" />
              <p className="font-medium text-foreground text-sm">Local Methods</p>
              <p className="text-xs text-muted-foreground">Alipay, WeChat, KakaoPay, Interac, SEPA</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </d