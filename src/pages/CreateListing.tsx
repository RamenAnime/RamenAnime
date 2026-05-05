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
import { Upload, X, ImageIcon, Sparkles, Camera, Package, Tag, Clock, FileText, ChevronRight, AlertCircle } from "lucide-react";

const CATEGORIES = [
  { id: "anime-figures", name: "Anime Figures", icon: "🎌" },
  { id: "manga", name: "Manga / Books", icon: "📚" },
  { id: "art-cels", name: "Art / Cels", icon: "🎨" },
  { id: "collectibles", name: "Collectibles", icon: "🏆" },
  { id: "apparel", name: "Apparel / Cosplay", icon: "👕" },
  { id: "accessories", name: "Accessories", icon: "⌚" },
  { id: "trading-cards", name: "Trading Cards", icon: "🃏" },
  { id: "games", name: "Games / Consoles", icon: "🎮" },
  { id: "dvds", name: "DVDs / Blu-ray", icon: "📀" },
  { id: "posters", name: "Posters / Prints", icon: "🖼️" },
  { id: "plush", name: "Plush / Toys", icon: "🧸" },
  { id: "other", name: "Other Anime Goods", icon: "✨" },
];

const CONDITIONS = [
  { id: "new", label: "New", desc: "Unopened, brand new" },
  { id: "like_new", label: "Like New", desc: "Opened but perfect" },
  { id: "used", label: "Used", desc: "Gently used" },
  { id: "fair", label: "Fair", desc: "Visible wear" },
  { id: "poor", label: "Poor", desc: "Heavy wear / parts" },
];

const DURATIONS = [
  { label: "3 Days", hours: 72 },
  { label: "5 Days", hours: 120 },
  { label: "7 Days", hours: 168 },
  { label: "10 Days", hours: 240 },
  { label: "14 Days", hours: 336 },
];

export default function CreateListing() {
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
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createMutation = trpc.marketplace.createListing.useMutation({
    onSuccess: () => {
      toast.success("Listing created successfully!");
      navigate("/marketplace");
    },
    onError: (err) => toast.error(err.message),
  });

  const analyzePrice = trpc.marketplace.analyzePrice.useMutation({
    onSuccess: (data) => {
      setAiAnalysis(data.analysis);
      setAiLoading(false);
    },
    onError: () => {
      toast.error("Price analysis failed");
      setAiLoading(false);
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (images.length + files.length > 10) {
      toast.error("Max 10 images allowed");
      return;
    }
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImages((prev) => [...prev, reader.result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (!title || !category || !condition || !startPrice) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }
    const endTime = new Date(Date.now() + duration * 3600000).toISOString();
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
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-bold mb-2">Please log in to create a listing</h2>
            <p className="text-sm text-muted-foreground mb-4">
              You need to be signed in to start selling your anime collectibles.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild><Link to="/login">Sign In</Link></Button>
              <Button variant="outline" asChild><Link to="/register">Create Account</Link></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedCat = CATEGORIES.find((c) => c.id === category);
  const selectedCond = CONDITIONS.find((c) => c.id === condition);
  const selectedDur = DURATIONS.find((d) => d.hours === duration);

  return (
    <div className="min-h-screen bg-background">
      {/* Progress Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-1">Create a New Listing</h1>
          <p className="text-sm text-muted-foreground mb-4">
            Fill in the details below to list your item for auction
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-primary text-primary-foreground">1. Item Info</Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">2. Photos</Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">3. Review & List</Badge>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* PHOTOS SECTION */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Photos
              <span className="text-red-500 text-sm">*Required — max 10</span>
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
                <span className="text-xs text-muted-foreground">Add Photo</span>
              </div>

              {/* Uploaded images */}
              {images.map((img, i) => (
                <div key={i} className="relative w-32 h-32 rounded-lg overflow-hidden border border-border group">
                  <img src={img} alt={`upload-${i}`} className="w-full h-full object-cover" />
                  {i === 0 && (
                    <Badge className="absolute top-1 left-1 text-[10px] px-1.5 py-0 bg-primary/90">MAIN</Badge>
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
              <p className="text-xs text-muted-foreground mt-2">{images.length}/10 photos uploaded</p>
            )}
          </CardContent>
        </Card>

        {/* BASIC INFO */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Item Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., One Piece Luffy Gear 5 Figure — Banpresto Ichiban Kuji"
                className="h-11"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{title.length}/80 characters</span>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item — include details about condition, packaging, any defects, and shipping preferences..."
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-muted-foreground">{description.length}/5000 characters</p>
            </div>

          </CardContent>
        </Card>

        {/* CATEGORY */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Category <span className="text-red-500">*</span>
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
              Condition <span className="text-red-500">*</span>
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
            <CardTitle className="text-base">Listing Type</CardTitle>
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
                <div className="font-semibold text-sm">Auction</div>
                <div className="text-xs text-muted-foreground">Buyers place bids</div>
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
                <div className="font-semibold text-sm">Fixed Price</div>
                <div className="text-xs text-muted-foreground">Immediate purchase</div>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* PRICING */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="text-lg font-bold">$</span>
              Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">
                  {isAuction ? "Starting Bid" : "Price"} <span className="text-red-500">*</span>
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
                    <Label className="text-sm font-medium">Reserve Price</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number"
                        value={reservePrice}
                        onChange={(e) => setReservePrice(e.target.value)}
                        placeholder="Optional"
                        className="pl-7 h-11"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Hidden minimum to sell</p>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium">Buy It Now</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <Input
                        type="number"
                        value={buyNowPrice}
                        onChange={(e) => setBuyNowPrice(e.target.value)}
                        placeholder="Optional"
                        className="pl-7 h-11"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Instant purchase price</p>
                  </div>
                </>
              )}
            </div>

            {isAuction && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Auction Duration</Label>
                <div className="flex flex-wrap gap-2">
                  {DURATIONS.map((d) => (
                    <button
                      key={d.hours}
                      onClick={() => setDuration(d.hours)}
                      className={`px-4 py-2 rounded-lg text-sm border transition-all ${
                        duration === d.hours
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI PRICE ANALYSIS */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-12 text-base gap-2"
              onClick={() => {
                if (!title || !category) {
                  toast.error("Enter a title and category first");
                  return;
                }
                setAiLoading(true);
                analyzePrice.mutate({ title, category });
              }}
              disabled={aiLoading}
            >
              <Sparkles className="h-5 w-5 text-amber-500" />
              {aiLoading ? "Analyzing market data..." : "Get AI Price Analysis"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Price Analysis
              </DialogTitle>
            </DialogHeader>
            <div className="text-sm leading-relaxed whitespace-pre-line">
              {aiAnalysis || "No analysis yet. Click the button to analyze."}
            </div>
          </DialogContent>
        </Dialog>

        {/* SUMMARY + SUBMIT */}
        <Card className="bg-muted/30">
          <CardContent className="p-5 space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Listing Summary
            </h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="text-muted-foreground">Category</div>
              <div>{selectedCat ? `${selectedCat.icon} ${selectedCat.name}` : <span className="text-red-500">Not selected</span>}</div>
              <div className="text-muted-foreground">Condition</div>
              <div>{selectedCond?.label || <span className="text-red-500">Not selected</span>}</div>
              <div className="text-muted-foreground">Type</div>
              <div>{isAuction ? "Auction" : "Fixed Price"}</div>
              <div className="text-muted-foreground">{isAuction ? "Starting Bid" : "Price"}</div>
              <div>{startPrice ? `$${startPrice}` : <span className="text-red-500">Not set</span>}</div>
              {isAuction && (
                <>
                  <div className="text-muted-foreground">Duration</div>
                  <div>{selectedDur?.label}</div>
                </>
              )}
              <div className="text-muted-foreground">Photos</div>
              <div>{images.length > 0 ? `${images.length} uploaded` : <span className="text-red-500">None</span>}</div>
            </div>
            <Separator />
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || !title || !category || !condition || !startPrice || images.length === 0}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {createMutation.isPending ? "Creating Listing..." : "List My Item"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              By listing, you agree to our Terms of Service and confirm this item is authentic.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
