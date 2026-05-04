import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import {
  Loader2, Sparkles, X, Check, TrendingUp, ImagePlus, Film,
  Gavel, Tag, Clock, Shield, FileAudio, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  processMediaFiles, formatFileSize, calculateTotalSavings,
  type UniversalMediaResult,
} from "@/lib/mediaCompression";

export default function CreateListing() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("figures");
  const [condition, setCondition] = useState("new");
  const [price, setPrice] = useState("");
  const [listingType, setListingType] = useState<"fixed" | "auction">("fixed");
  const [startPrice, setStartPrice] = useState("");
  const [reservePrice, setReservePrice] = useState("");
  const [buyNowPrice, setBuyNowPrice] = useState("");
  const [auctionDuration, setAuctionDuration] = useState("7");
  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<{ url: string; thumbnail: string }[]>([]);
  const [mediaResults, setMediaResults] = useState<UniversalMediaResult[]>([]);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [trends, setTrends] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [priceAnalysis, setPriceAnalysis] = useState<any>(null);

  const createListing = trpc.marketplace.createListing.useMutation({
    onSuccess: () => navigate("/marketplace"),
    onError: (e) => setError(e.message),
  });

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (title.length < 3) { setTrends([]); return; }
      setIsSearching(true);
      try {
        const res = await fetch(`/api/trpc/ai.trends?input=${encodeURIComponent(JSON.stringify({ query: title }))}`);
        if (res.ok) { const json = await res.json(); setTrends(json.result?.data?.trends || []); }
      } catch { /* ignore */ }
      setIsSearching(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [title]);

  const handleGenerateTitle = async () => {
    if (!description.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/trpc/ai.suggestTitles?input=${encodeURIComponent(JSON.stringify({ description }))}`);
      if (res.ok) { const json = await res.json(); setTitleSuggestions(json.result?.data?.titles || []); }
    } catch { /* ignore */ }
    setIsGenerating(false);
  };

  const handleAnalyzePrice = async () => {
    if (!title.trim()) return;
    try {
      const res = await fetch(`/api/trpc/ai.analyzePrice?input=${encodeURIComponent(JSON.stringify({ title, category }))}`);
      if (res.ok) { const json = await res.json(); setPriceAnalysis(json.result?.data); }
    } catch { /* ignore */ }
  };

  const handleMediaUpload = async (files: FileList | null, type: "image" | "video") => {
    if (!files || files.length === 0) return;
    setCompressing(true);
    setError("");
    try {
      const results = await processMediaFiles(Array.from(files));
      setMediaResults((prev) => [...prev, ...results]);
      const imgUrls = results.filter((r) => r.type === "image" && r.success).map((r) => r.url);
      const vidUrls = results.filter((r) => r.type === "video" && r.success).map((r) => ({ url: r.url, thumbnail: r.thumbnailUrl || r.url }));
      if (type === "image") setImages((prev) => [...prev, ...imgUrls]);
      else setVideos((prev) => [...prev, ...vidUrls]);
    } catch (e: any) {
      setError(e.message || "Failed to process media");
    }
    setCompressing(false);
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));
  const removeVideo = (idx: number) => setVideos((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = () => {
    if (!title.trim() || !price.trim()) { setError("Title and price are required"); return; }
    setError("");
    createListing.mutate({
      title, description, category, condition,
      price: listingType === "auction" ? startPrice : price,
      listingType, startPrice, reservePrice, buyNowPrice,
      auctionEnd: listingType === "auction" ? new Date(Date.now() + parseInt(auctionDuration) * 86400000).toISOString() : undefined,
      images, videos: videos.map((v) => v.url),
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Please log in to create a listing</p>
          <Button onClick={() => navigate("/login")}>Login</Button>
        </div>
      </div>
    );
  }

  const compressionStats = mediaResults.length > 0 && !compressing
    ? calculateTotalSavings(mediaResults)
    : null;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{t("marketplace.createListing") || "Create Listing"}</h1>
          <p className="text-sm text-muted-foreground">{t("marketplace.listItem") || "List your item for sale or auction"}</p>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-2 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">{error}</div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block font-medium mb-2 text-sm">{t("marketplace.title") || "Title"}</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("marketplace.titlePlaceholder") || "e.g., Rare Goku Action Figure"} className="bg-muted/50" />
              {title.length >= 3 && (
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : <TrendingUp className="w-3 h-3" />}
                  {isSearching ? "Searching..." : `${trends.length} trends`}
                </div>
              )}
              {trends.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {trends.map((tr, i) => (
                    <Badge key={i} variant="outline" className="cursor-pointer hover:bg-primary/10" onClick={() => setTitle(tr.title)}>
                      <Sparkles className="w-3 h-3 mr-1" />{tr.title}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block font-medium mb-2 text-sm">{t("marketplace.description") || "Description"}</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe your item..." className="w-full rounded-md bg-muted/50 border border-border/50 px-3 py-2 text-sm" />
              {description.length > 20 && titleSuggestions.length === 0 && (
                <Button variant="outline" size="sm" className="mt-2" onClick={handleGenerateTitle} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {t("marketplace.suggestTitle") || "Suggest Title"}
                </Button>
              )}
              {titleSuggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                  {titleSuggestions.map((s, i) => (
                    <button key={i} className="block text-sm text-left w-full p-2 rounded hover:bg-muted transition-colors" onClick={() => { setTitle(s); setTitleSuggestions([]); }}>{s}</button>
                  ))}
                </div>
              )}
            </div>
            <Button className="w-full" onClick={() => setStep(2)} disabled={!title.trim()}>
              {t("common.continue") || "Continue"}
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-medium mb-2 text-sm">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md bg-muted/50 border border-border/50 px-3 py-2 text-sm">
                  <option value="figures">Figures</option>
                  <option value="trading-cards">Trading Cards</option>
                  <option value="3d-prints">3D Prints</option>
                  <option value="apparel">Apparel</option>
                  <option value="accessories">Accessories</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block font-medium mb-2 text-sm">Condition</label>
                <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full rounded-md bg-muted/50 border border-border/50 px-3 py-2 text-sm">
                  <option value="new">New</option>
                  <option value="used">Used</option>
                  <option value="like-new">Like New</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2 text-sm">Listing Type</label>
              <div className="flex gap-2">
                <Button variant={listingType === "fixed" ? "default" : "outline"} onClick={() => setListingType("fixed")} className="flex-1"><Tag className="w-4 h-4 mr-2" />Fixed Price</Button>
                <Button variant={listingType === "auction" ? "default" : "outline"} onClick={() => setListingType("auction")} className="flex-1"><Gavel className="w-4 h-4 mr-2" />Auction</Button>
              </div>
            </div>

            {listingType === "fixed" ? (
              <div>
                <label className="block font-medium mb-2 text-sm">Price</label>
                <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" className="bg-muted/50" />
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block font-medium mb-2 text-sm">Start Price</label>
                  <Input type="number" value={startPrice} onChange={(e) => setStartPrice(e.target.value)} placeholder="0.00" className="bg-muted/50" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-2 text-sm">Reserve Price</label>
                    <Input type="number" value={reservePrice} onChange={(e) => setReservePrice(e.target.value)} placeholder="Optional" className="bg-muted/50" />
                  </div>
                  <div>
                    <label className="block font-medium mb-2 text-sm">Buy Now Price</label>
                    <Input type="number" value={buyNowPrice} onChange={(e) => setBuyNowPrice(e.target.value)} placeholder="Optional" className="bg-muted/50" />
                  </div>
                </div>
                <div>
                  <label className="block font-medium mb-2 text-sm flex items-center gap-1"><Clock className="w-3 h-3" />Duration</label>
                  <select value={auctionDuration} onChange={(e) => setAuctionDuration(e.target.value)} className="w-full rounded-md bg-muted/50 border border-border/50 px-3 py-2 text-sm">
                    <option value="1">1 day</option>
                    <option value="3">3 days</option>
                    <option value="5">5 days</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                  </select>
                </div>
              </div>
            )}

            <Button variant="outline" onClick={handleAnalyzePrice} disabled={!title.trim()} className="w-full">
              <TrendingUp className="w-4 h-4 mr-2" />Price Analysis
            </Button>
            {priceAnalysis && (
              <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                <p className="text-sm font-medium">Suggested: ${priceAnalysis.suggested}</p>
                <p className="text-xs text-muted-foreground">Range: ${priceAnalysis.min} - ${priceAnalysis.max}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(1)} className="flex-1">Back</Button>
              <Button onClick={() => setStep(3)} className="flex-1">Continue</Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <label className="block font-medium mb-2 text-sm">Photos ({images.length})</label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border/50">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-destructive text-white rounded-full flex items-center justify-center text-xs"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleMediaUpload(e.target.files, "image")} />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full" disabled={compressing}>
                <ImagePlus className="w-4 h-4 mr-2" />Add Photos
              </Button>
            </div>

            <div>
              <label className="block font-medium mb-2 text-sm">Videos & Audio ({videos.length})</label>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {videos.map((v, i) => (
                  <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    {v.thumbnail ? <img src={v.thumbnail} alt="" className="w-full h-full object-cover" /> : <Film className="w-full h-full p-4 text-muted-foreground" />}
                    <div className="absolute inset-0 flex items-center justify-center">
                      {mediaResults.find(r => r.result?.dataUrl === v.url)?.type === "audio" ? <FileAudio className="w-6 h-6 text-white drop-shadow" /> : <Film className="w-6 h-6 text-white drop-shadow" />}
                    </div>
                    <button onClick={() => removeVideo(i)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
              <input ref={videoInputRef} type="file" accept="video/*,audio/*" multiple className="hidden" onChange={(e) => handleMediaUpload(e.target.files, "video")} />
              <Button variant="outline" onClick={() => videoInputRef.current?.click()} className="w-full" disabled={compressing}>
                <Film className="w-4 h-4 mr-2" />Add Videos
              </Button>
            </div>

            <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
              <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">All listings are scanned by our copyright detection system.</p>
            </div>

            {compressionStats && (
              <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-1 text-xs text-green-700 mb-1">
                  <BarChart3 className="w-3 h-3" /><span className="font-medium">Compression Stats</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-green-600">
                  <span>Saved: {compressionStats.saved}</span>
                  <span>Images: {compressionStats.imageCount} Videos: {compressionStats.videoCount} Audio: {compressionStats.audioCount}</span>
                  <span>Original: {formatFileSize(compressionStats.originalTotal)}</span>
                  <span>Compressed: {formatFileSize(compressionStats.compressedTotal)}</span>
                </div>
              </div>
            )}

            {compressing && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />Compressing media...
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(2)} className="flex-1">Back</Button>
              <Button onClick={handleSubmit} disabled={createListing.isPending} className="flex-1">
                {createListing.isPending ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Listing...</> : <><Check className="w-5 h-5 mr-2" />List Item</>}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
