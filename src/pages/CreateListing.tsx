import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router";
import { Upload, X, ImageIcon, Sparkles, Camera, Package, Tag, Clock, FileText, ChevronRight, AlertCircle, CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocalizedLabels } from "@/lib/label-i18n";

const CATEGORY_IDS = [
  { id: "anime-figures", key: "cat_figures", icon: "🎌" },
  { id: "manga", key: "cat_manga", icon: "📚" },
  { id: "art-cels", key: "cat_art", icon: "🎨" },
  { id: "collectibles", key: "cat_collectibles", icon: "🏆" },
  { id: "apparel", key: "cat_apparel", icon: "👕" },
  { id: "accessories", key: "cat_accessories", icon: "⌚" },
  { id: "trading-cards", key: "cat_cards", icon: "🃏" },
  { id: "games", key: "cat_gaming", icon: "🎮" },
  { id: "dvds", key: "cat_other", icon: "📀" },
  { id: "posters", key: "cat_other", icon: "🖼️" },
  { id: "plush", key: "cat_other", icon: "🧸" },
  { id: "other", key: "cat_other", icon: "✨" },
];

const DURATION_OPTIONS = [
  { key: "duration3", hours: 72 },
  { key: "duration5", hours: 120 },
  { key: "duration7", hours: 168 },
  { key: "duration10", hours: 240 },
  { key: "duration14", hours: 336 },
] as const;

const PACKAGE_SIZE_KEYS = {
  envelope: "packageEnvelope",
  small: "packageSmall",
  medium: "packageMedium",
  large: "packageLarge",
  oversize: "packageOversize",
} as const;

export default function CreateListing() {
  const { t } = useTranslation();
  const { genericError } = useLocalizedLabels();
  const CATEGORIES = CATEGORY_IDS.map((c) => ({ ...c, name: t(`createListing.${c.key}`) }));
  const CONDITIONS = [
    { id: "new", label: t("createListing.new"), desc: t("createListing.conditionNewDesc") },
    { id: "like_new", label: t("createListing.like_new"), desc: t("createListing.conditionLikeNewShort") },
    { id: "used", label: t("createListing.used"), desc: t("createListing.conditionUsedShort") },
    { id: "fair", label: t("createListing.conditionFair"), desc: t("createListing.conditionFairDesc") },
    { id: "poor", label: t("createListing.conditionPoor"), desc: t("createListing.conditionPoorDesc") },
  ];
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [startPrice, setStartPrice] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [buyNowPrice, setBuyNowPrice] = useState("");
  const [duration, setDuration] = useState(168);
  const [isAuction, setIsAuction] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [packageSize, setPackageSize] = useState<"envelope" | "small" | "medium" | "large" | "oversize">("small");
  const [shippingPayer, setShippingPayer] = useState<"buyer" | "seller">("buyer");
  const [authenticityDeclared, setAuthenticityDeclared] = useState(false);
  const [cardSet, setCardSet] = useState("");
  const [cardGrade, setCardGrade] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const shippingEstimate = trpc.marketplace.estimateShipping.useQuery({
    packageSize,
    payer: shippingPayer,
  });

  const listingPriceNum = parseFloat(startPrice || "0");
  const jpTaxPreview = trpc.tax.calculate.useQuery(
    { subtotal: listingPriceNum, countryCode: "JP" },
    { enabled: listingPriceNum > 0 }
  );

  const { data: stripeStatus } = trpc.stripe.getSellerStatus.useQuery(undefined, { enabled: !!user });
  const connectStripe = trpc.stripe.createOnboardingLink.useMutation({
    onSuccess: (data) => {
      if (data?.url) window.location.href = data.url;
    },
    onError: (err) => toast.error(genericError(err)),
  });

  const createMutation = trpc.marketplace.createListing.useMutation({
    onSuccess: () => {
      toast.success(t("createListing.success"));
      navigate("/marketplace");
    },
    onError: (err) => toast.error(genericError(err)),
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (images.length + files.length > 10) {
      toast.error(t("createListing.max_images"));
      return;
    }
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        if (typeof dataUrl === "string") {
          setImages((prev) => [...prev, dataUrl]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (!title || !category || !condition || !startPrice) {
      toast.error(t("createListing.fillRequired"));
      return;
    }
    if (images.length === 0) {
      toast.error(t("createListing.uploadOneImage"));
      return;
    }
    const endTime = new Date(Date.now() + duration * 3600000).toISOString();
    const itemSpecifics =
      category === "trading-cards" && (cardSet || cardGrade)
        ? { set: cardSet, grade: cardGrade }
        : undefined;

    createMutation.mutate({
      title,
      description,
      category,
      condition: condition as "new" | "used" | "like_new",
      price: startPrice,
      startPrice,
      reservePrice: reservePrice || undefined,
      buyNowPrice: buyNowPrice || undefined,
      images: images.slice(0, 5),
      listingType: isAuction ? "auction" : "fixed",
      auctionEnd: endTime,
      packageSize,
      shippingPayer,
      shippingCost: shippingEstimate.data?.cost?.toFixed(2),
      authenticityDeclared,
      itemSpecifics,
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">{t("createListing.signInToCreate")}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {t("createListing.signInSellDesc")}
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild><Link to="/login">{t("createListing.signIn")}</Link></Button>
              <Button variant="outline" asChild><Link to="/register">{t("createListing.createAccount")}</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedCat = CATEGORIES.find((c) => c.id === category);
  const selectedCond = CONDITIONS.find((c) => c.id === condition);
  const selectedDur = DURATION_OPTIONS.find((d) => d.hours === duration);

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-1">{t("createListing.pageTitle")}</h1>
          <p className="text-sm text-muted-foreground mb-4">
            {t("createListing.subtitle")}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-primary text-primary-foreground">{t("createListing.stepItemInfo")}</Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">{t("createListing.stepPhotos")}</Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">{t("createListing.stepReview")}</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {stripeStatus && !stripeStatus.onboardingComplete && (
          <Card className="border-amber-500/30 bg-amber-500/5">
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
              <div className="flex gap-3">
                <CreditCard className="h-8 w-8 text-amber-600 shrink-0" />
                <div>
                  <p className="font-semibold text-sm">{t("createListing.connectStripeTitle")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("createListing.connectStripeFees")}
                  </p>
                </div>
              </div>
              <Button
                className="shrink-0"
                disabled={connectStripe.isPending}
                onClick={() => connectStripe.mutate()}
              >
                {connectStripe.isPending ? t("createListing.openingStripe") : stripeStatus.connected ? t("createListing.finishSetup") : t("createListing.connectStripe")}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* PHOTOS SECTION */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-5 w-5" />
              {t("createListing.images")}
              <span className="text-red-500 text-sm">{t("createListing.photosRequired")}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {/* Main image slot */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer flex flex-col items-center justify-center bg-muted/30 transition-colors"
              >
                <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                <span className="text-xs text-muted-foreground">{t("createListing.addPhoto")}</span>
              </div>

              {/* Uploaded images */}
              {images.map((img, i) => (
                <div key={i} className="relative w-32 h-32 rounded-lg overflow-hidden border border-border group">
                  <img src={img} alt={`upload-${i}`} className="w-full h-full object-cover" />
                  {i === 0 && (
                    <Badge className="absolute top-1 left-1 text-[10px] px-1.5 py-0 bg-primary/90">{t("createListing.mainPhoto")}</Badge>
                  )}
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageUpload}
            />
            {images.length > 0 && (
              <p className="text-xs text-muted-foreground mt-2">{t("createListing.photosUploaded", { count: images.length })}</p>
            )}
          </CardContent>
        </Card>

        {/* BASIC INFO */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {t("createListing.itemDetails")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                {t("createListing.item_title")} <span className="text-red-500">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("createListing.item_title_ph")}
                className="h-11"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t("createListing.charsCount", { count: title.length })}</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">{t("createListing.description")}</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("createListing.description_ph")}
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-muted-foreground">{t("createListing.descCharsCount", { count: description.length })}</p>
            </div>

          </CardContent>
        </Card>

        {/* CATEGORY */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-5 w-5" />
              {t("createListing.category")} <span className="text-red-500">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    category === cat.id
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-card border-border hover:border-primary/50 text-foreground"
                  }`}
                >
                  <span className="mr-1">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CONDITION */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t("createListing.condition")} <span className="text-red-500">*</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {CONDITIONS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCondition(c.id)}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    condition === c.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:border-primary/40 bg-card"
                  }`}
                >
                  <div className={`font-semibold text-sm ${condition === c.id ? "text-primary" : ""}`}>
                    {c.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">{c.desc}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* LISTING TYPE */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("createListing.listingType")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <button
                onClick={() => setIsAuction(true)}
                className={`flex-1 p-4 rounded-lg border text-center transition-all ${
                  isAuction
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="font-semibold text-sm">{t("createListing.auction")}</div>
                <div className="text-xs text-muted-foreground">{t("createListing.auctionBuyersBid")}</div>
              </button>
              <button
                onClick={() => setIsAuction(false)}
                className={`flex-1 p-4 rounded-lg border text-center transition-all ${
                  !isAuction
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <Tag className="h-5 w-5 mx-auto mb-1 text-primary" />
                <div className="font-semibold text-sm">{t("createListing.fixed_price")}</div>
                <div className="text-xs text-muted-foreground">{t("createListing.fixedImmediate")}</div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* PRICING */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-lg font-bold">$</span>
              {t("createListing.pricing")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  {isAuction ? t("createListing.startingBid") : t("createListing.price")} <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    value={startPrice}
                    onChange={(e) => setStartPrice(e.target.value)}
                    placeholder="0.00"
                    className="pl-7 h-11"
                  />
                </div>
              </div>
              {isAuction && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">{t("createListing.reservePrice")}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number"
                        value={reservePrice}
                        onChange={(e) => setReservePrice(e.target.value)}
                        placeholder={t("createListing.optional")}
                        className="pl-7 h-11"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{t("createListing.reserveHidden")}</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">{t("createListing.buyItNow")}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number"
                        value={buyNowPrice}
                        onChange={(e) => setBuyNowPrice(e.target.value)}
                        placeholder={t("createListing.optional")}
                        className="pl-7 h-11"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">{t("createListing.buyNowInstant")}</p>
                  </div>
                </>
              )}
            </div>

            {listingPriceNum > 0 && jpTaxPreview.data && (
              <div className="rounded-lg border border-border p-3 text-sm bg-muted/30">
                <p className="font-medium">{t("createListing.jpTaxPreview")}</p>
                <p className="text-sm text-muted-foreground">
                  {t("createListing.jpTaxLine", {
                    vat: jpTaxPreview.data.vatAmount.toFixed(2),
                    amount: listingPriceNum.toFixed(2),
                  })}
                </p>
              </div>
            )}

            {isAuction && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">{t("createListing.auctionDuration")}</Label>
                <div className="flex flex-wrap gap-2">
                  {DURATION_OPTIONS.map((d) => (
                    <button
                      key={d.hours}
                      onClick={() => setDuration(d.hours)}
                      className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                        duration === d.hours
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      {t(`createListing.${d.key}`)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t("createListing.shippingAuthenticity")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(["envelope", "small", "medium", "large", "oversize"] as const).map((s) => (
                <button key={s} type="button" onClick={() => setPackageSize(s)} className={`px-3 py-1.5 rounded-lg text-sm border ${packageSize === s ? "border-primary bg-primary/10" : "border-border"}`}>
                  {t(`createListing.${PACKAGE_SIZE_KEYS[s]}`)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShippingPayer("buyer")} className={`flex-1 py-2 rounded-lg border text-sm ${shippingPayer === "buyer" ? "border-primary" : ""}`}>{t("createListing.buyerPaysShipping")}</button>
              <button type="button" onClick={() => setShippingPayer("seller")} className={`flex-1 py-2 rounded-lg border text-sm ${shippingPayer === "seller" ? "border-primary" : ""}`}>{t("createListing.freeShipping")}</button>
            </div>
            {shippingEstimate.data && (
              <p className="text-sm text-muted-foreground">
                {t("createListing.estimatedShipping", {
                  cost: shippingEstimate.data.cost.toFixed(2),
                  carrier: shippingEstimate.data.carrierHint,
                })}
              </p>
            )}
            {category === "trading-cards" && (
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder={t("createListing.cardSet")} value={cardSet} onChange={(e) => setCardSet(e.target.value)} />
                <Input placeholder={t("createListing.cardGrade")} value={cardGrade} onChange={(e) => setCardGrade(e.target.value)} />
              </div>
            )}
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={authenticityDeclared} onChange={(e) => setAuthenticityDeclared(e.target.checked)} />
              {t("createListing.authenticityDeclare")}
            </label>
          </CardContent>
        </Card>

        {/* SUMMARY + SUBMIT */}
        <Card className="bg-muted/30">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {t("createListing.listingSummary")}
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="text-muted-foreground">{t("createListing.summaryCategory")}</div>
              <div>{selectedCat ? `${selectedCat.icon} ${selectedCat.name}` : <span className="text-red-500">{t("createListing.notSelected")}</span>}</div>
              <div className="text-muted-foreground">{t("createListing.summaryCondition")}</div>
              <div>{selectedCond?.label || <span className="text-red-500">{t("createListing.notSelected")}</span>}</div>
              <div className="text-muted-foreground">{t("createListing.summaryType")}</div>
              <div>{isAuction ? t("createListing.auction") : t("createListing.fixed_price")}</div>
              <div className="text-muted-foreground">{isAuction ? t("createListing.startingBid") : t("createListing.price")}</div>
              <div>{startPrice ? `$${startPrice}` : <span className="text-red-500">{t("createListing.notSet")}</span>}</div>
              {isAuction && (
                <>
                  <div className="text-muted-foreground">{t("createListing.summaryDuration")}</div>
                  <div>{selectedDur ? t(`createListing.${selectedDur.key}`) : null}</div>
                </>
              )}
              <div className="text-muted-foreground">{t("createListing.summaryPhotos")}</div>
              <div>{images.length > 0 ? t("createListing.photosUploadedCount", { count: images.length }) : <span className="text-red-500">{t("createListing.none")}</span>}</div>
            </div>
            <Separator />
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || !title || !category || !condition || !startPrice || images.length === 0}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {createMutation.isPending ? t("createListing.creatingListing") : t("createListing.listMyItem")}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              {t("createListing.listingLegal")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
