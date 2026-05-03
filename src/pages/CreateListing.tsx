import { useState, useEffect, useCallback, useRef } from "react";
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
import { Textarea } from "@/components/ui/textarea";
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
  const [category, setCategory] = useState("Figures");
  const [condition, setCondition] = useState("New");
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
      } catch {}
      setIsSearching(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [title]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (title.length < 3 || title.length > 30) { setTitleSuggestions([]); return; }
      try {
        const res = await fetch(`/api/trpc/ai.titleSuggestions?input=${encodeURIComponent(JSON.stringify({ partial: title, category }))}`);
        if (res.ok) { const json = await res.json(); setTitleSuggestions(json.result?.data?.suggestions || []); }
      } catch {}
    }, 600);
    return () => clearTimeout(timer);
  }, [title, category]);

  useEffect(() => {
    if (!price || !trends.length) { setPriceAnalysis(null); return; }
    const timer = setTimeout(async () => {
      try {
        const marketAvg = trends[0]?.avgPrice || 50;
        const res = await fetch(`/api/trpc/ai.priceAnalysis?input=${encodeURIComponent(JSON.stringify({ price: parseFloat(price), marketAvg, condition }))}`);
        if (res.ok) { const json = await res.json(); setPriceAnalysis(json.result?.data); }
      } catch {}
    }, 400);
    return () => clearTimeout(timer);
  }, [price, trends, condition]);

  const generateWithAI = useCallback(async () => {
    if (!title) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/trpc/ai.listingSuggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category, condition }),
      });
      if (res.ok) {
        const json = await res.json();
        const data = json.result?.data;
        if (data) { setDescription(data.description); setPrice(data.suggestedPrice.toFixed(2)); if (listingType === "auction") setStartPrice(data.suggestedPrice.toFixed(2)); setCategory(data.category); setCondition(data.condition); }
      }
    } catch {}
    setIsGenerating(false);
  }, [title, category, condition, listingType]);

  const handleMediaUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setCompressing(true);
    const results = await processMediaFiles(Array.from(files), { maxWidth: 1600, quality: 0.92 });
    setMediaResults(prev => [...prev, ...results]);
    for (const r of results) {
      if (r.error || !r.result) continue;
      if (r.type === "image") setImages(prev => [...prev, r.result!.dataUrl]);
      else if (r.type === "video") setVideos(prev => [...prev, { url: r.result!.dataUrl, thumbnail: r.thumbnail || "" }]);
      else if (r.type === "audio") setVideos(prev => [...prev, { url: r.result!.dataUrl, thumbnail: r.thumbnail || "" }]);
    }
    setCompressing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  }, []);

  const handleSubmit = () => {
    if (!title || !price) { setError("Title and price required"); return; }
    if (listingType === "auction" && !startPrice) { setError("Start price required for auctions"); return; }
    const auctionEnd = listingType === "auction" ? new Date(Date.now() + parseInt(auctionDuration) * 86400000).toISOString() : undefined;
    createListing.mutate({
      title, description, category, condition, price, listingType,
      startPrice: listingType === "auction" ? startPrice : undefined,
      reservePrice: listingType === "auction" ? reservePrice : undefined,
      buyNowPrice: listingType === "auction" ? buyNowPrice : undefined,
      auctionEnd, images, videos: videos.map(v => v.url),
    });
  };

  const conditions = ["New", "Like New", "Used", "For Parts"];
  const categories = ["Figures", "Trading Cards", "3D Prints", "Apparel", "Accessories", "Manga", "Other"];

  if (!user) return <div className="min-h-screen flex items-center justify-center"><div className="text-center"><p className="text-muted-foreground mb-4">Please log in to create a listing</p><Button onClick={() => navigate("/login")}>Log In</Button></div></div>;

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2"><Tag className="w-8 h-8 text-primary" /> List an Item</h1>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex gap-1">{[1, 2, 3].map(s => <div key={s} className={`h-2 w-8 rounded-full ${s <= step ? "bg-primary" : "bg-muted"}`} />)}</div>
            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
          </div>
        </div>
        {error && <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4 flex items-center gap-2"><Shield className="w-4 h-4" />{error}</div>}

        {step === 1 && <div className="space-y-6">
          <div className="flex gap-3 p-1 bg-muted rounded-lg w-fit">
            <button onClick={() => setListingType("fixed")} className={`px-4 py-2 rounded-md text-sm font-medium transition ${listingType === "fixed" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"}`}><Tag className="w-4 h-4 inline mr-1" /> Fixed Price</button>
            <button onClick={() => setListingType("auction")} className={`px-4 py-2 rounded-md text-sm font-medium transition ${listingType === "auction" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"}`}><Gavel className="w-4 h-4 inline mr-1" /> Auction</button>
          </div>
          <div>
            <label className="block font-medium mb-2">What are you selling?</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Figma Hatsune Miku #300" className="bg-muted/50" />
            {isSearching && <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2"><Loader2 className="w-4 h-4 animate-spin" /> Searching trends...</div>}
            {titleSuggestions.length > 0 && <div className="mt-2 p-3 bg-primary/5 rounded-lg border border-primary/20"><p className="text-xs font-medium text-primary mb-2 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Suggested titles</p>{titleSuggestions.map((s, i) => <button key={i} onClick={() => setTitle(s)} className="block text-left text-sm w-full py-1 px-2 hover:bg-primary/10 rounded truncate">{s}</button>)}</div>}
          </div>
          {trends.length > 0 && <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"><div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-3"><TrendingUp className="w-5 h-5" /><span className="font-medium">Market Trends</span><Badge variant="outline" className="text-xs ml-auto">{trends[0]?.source || "estimated"}</Badge></div>{trends.map((tr: any, i: number) => <div key={i} className="flex justify-between bg-white dark:bg-background p-3 rounded-lg mb-2"><div><p className="font-medium text-sm">{tr.title}</p><p className="text-xs text-muted-foreground">from {tr.source}</p></div><div className="text-right"><p className="font-bold text-green-600">${tr.avgPrice}</p><p className="text-xs text-muted-foreground">${tr.minPrice} - ${tr.maxPrice}</p></div></div>)}</div>}
          <Button onClick={generateWithAI} disabled={!title || isGenerating} variant="outline" className="w-full border-purple-300 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20">{isGenerating ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Generating...</> : <><Sparkles className="w-5 h-5 mr-2" /> Auto-Generate with AI</>}</Button>
          <Button onClick={() => setStep(2)} disabled={!title} className="w-full">Continue</Button>
        </div>}

        {step === 2 && <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block font-medium mb-2 text-sm">Category</label><select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm">{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="block font-medium mb-2 text-sm">Condition</label><div className="grid grid-cols-2 gap-2">{conditions.map(c => <button key={c} onClick={() => setCondition(c)} className={`p-2 rounded-md border text-xs font-medium transition ${condition === c ? "border-primary bg-primary/10 text-primary" : "border-input hover:border-primary/50"}`}>{c}</button>)}</div></div>
          </div>
          {listingType === "fixed" ? <div><label className="block font-medium mb-2 text-sm">Price (USD)</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span><Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="pl-8 bg-muted/50" placeholder="0.00" min="0" step="0.01" /></div>{priceAnalysis && <div className={`mt-2 p-3 rounded-lg text-sm ${priceAnalysis.competitiveness === "high" ? "bg-green-50 text-green-700" : priceAnalysis.competitiveness === "medium" ? "bg-yellow-50 text-yellow-700" : "bg-orange-50 text-orange-700"}`}><p className="font-medium">{priceAnalysis.ratio}x market average</p><p className="text-xs mt-1">{priceAnalysis.advice}</p></div>}</div> : <div className="space-y-4"><div className="grid grid-cols-2 gap-3"><div><label className="block font-medium mb-2 text-sm"><Gavel className="w-3 h-3 inline" /> Start Price $</label><Input type="number" value={startPrice} onChange={(e) => setStartPrice(e.target.value)} className="bg-muted/50" placeholder="0.00" min="0" step="0.01" /></div><div><label className="block font-medium mb-2 text-sm">Reserve Price $</label><Input type="number" value={reservePrice} onChange={(e) => setReservePrice(e.target.value)} className="bg-muted/50" placeholder="Optional" min="0" step="0.01" /></div></div><div className="grid grid-cols-2 gap-3"><div><label className="block font-medium mb-2 text-sm">Buy-Now Price $</label><Input type="number" value={buyNowPrice} onChange={(e) => setBuyNowPrice(e.target.value)} className="bg-muted/50" placeholder="Optional" min="0" step="0.01" /></div><div><label className="block font-medium mb-2 text-sm"><Clock className="w-3 h-3 inline" /> Duration</label><select value={auctionDuration} onChange={(e) => setAuctionDuration(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"><option value="1">1 Day</option><option value="3">3 Days</option><option value="5">5 Days</option><option value="7">7 Days</option><option value="14">14 Days</option></select></div></div><p className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="w-3 h-3" /> Auction ends {new Date(Date.now() + parseInt(auctionDuration) * 86400000).toLocaleDateString()}</p></div>}
          <div><label className="block font-medium mb-2 text-sm">Description</label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Describe your item..." className="bg-muted/50" /><Button onClick={generateWithAI} disabled={isGenerating} variant="ghost" size="sm" className="mt-2 text-purple-600"><Sparkles className="w-4 h-4 mr-1" /> {isGenerating ? "Generating..." : "Regenerate with AI"}</Button></div>
          <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"><Shield className="w-4 h-4 text-green-600 mt-0.5" /><p className="text-xs text-green-700 dark:text-green-400">All listings are automatically scanned for copyright infringement and prohibited items. Counterfeit goods, bootlegs, and unlicensed replicas are not allowed.</p></div>
          <div className="flex gap-3"><Button onClick={() => setStep(1)} variant="outline" className="flex-1">Back</Button><Button onClick={() => setStep(3)} disabled={listingType === "fixed" ? !price : !startPrice} className="flex-1">Continue</Button></div>
        </div>}

        {step === 3 && <div className="space-y-6">
          <div><label className="block font-medium mb-2 text-sm">Photos ({images.length})</label><div className="grid grid-cols-4 gap-3">{images.map((img, i) => <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted"><img src={img} alt="" className="w-full h-full object-cover" /><button onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"><X className="w-3 h-3" /></button>{mediaResults.find(r => r.result?.dataUrl === img)?.result?.reduction && <span className="absolute bottom-1 left-1 bg-green-600 text-white text-[9px] px-1.5 py-0.5 rounded-full">{mediaResults.find(r => r.result?.dataUrl === img)?.result?.reduction}</span>}</div>)}
          <label className="aspect-square rounded-lg border-2 border-dashed border-input flex flex-col items-center justify-center cursor-pointer hover:border-primary transition"><ImagePlus className="w-6 h-6 text-muted-foreground mb-1" /><span className="text-xs text-muted-foreground">Add Photo</span><input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*" multiple className="hidden" onChange={handleMediaUpload} /></label></div>
          {compressing && <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Processing media...</p>}
          <p className="text-xs text-muted-foreground mt-1">Supports all formats: JPEG, PNG, WebP, GIF, AVIF, MP4, WebM, MOV, MP3, WAV, FLAC, AAC + more. Auto-compressed with quality preservation.</p>
          {mediaResults.length > 0 && !compressing && <div className="mt-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"><div className="flex items-center gap-1 text-xs text-green-700 mb-1"><BarChart3 className="w-3 h-3" /><span className="font-medium">Compression Stats</span></div>{(() => { const stats = calculateTotalSavings(mediaResults); return <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-green-600"><span>Saved: {stats.saved}</span><span>Images: {stats.imageCount} | Videos: {stats.videoCount} | Audio: {stats.audioCount}</span><span>Original: {formatFileSize(stats.originalTotal)}</span><span>Compressed: {formatFileSize(stats.compressedTotal)}</span></div>; })()}</div></div>}

          <div><label className="block font-medium mb-2 text-sm">Videos & Audio ({videos.length})</label><div className="grid grid-cols-4 gap-3">{videos.map((v, i) => <div key={i} className="relative aspect-video rounded-lg overflow-hidden bg-muted">{v.thumbnail ? <img src={v.thumbnail} alt="" className="w-full h-full object-cover" /> : <Film className="w-full h-full p-4 text-muted-foreground" />}<div className="absolute inset-0 flex items-center justify-center">{mediaResults.find(r => r.result?.dataUrl === v.url)?.type === "audio" ? <FileAudio className="w-6 h-6 text-white drop-shadow" /> : <Film className="w-6 h-6 text-white drop-shadow" />}</div><button onClick={() => setVideos(videos.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"><X className="w-3 h-3" /></button></div>)}
          <label className="aspect-video rounded-lg border-2 border-dashed border-input flex flex-col items-center justify-center cursor-pointer hover:border-primary transition"><Film className="w-6 h-6 text-muted-foreground mb-1" /><span className="text-xs text-muted-foreground">Add Video/Audio</span><input ref={videoInputRef} type="file" accept="video/*,audio/*" className="hidden" onChange={handleMediaUpload} /></label></div></div>

          <div className="bg-muted rounded-lg p-4"><h3 className="font-medium mb-3">Preview</h3><div className="bg-background rounded-lg p-4 shadow-sm border"><div className="flex items-center gap-2 mb-2"><Badge variant={listingType === "auction" ? "secondary" : "default"}>{listingType === "auction" ? <><Gavel className="w-3 h-3 mr-1" /> Auction</> : <><Tag className="w-3 h-3 mr-1" /> Fixed Price</>}</Badge><Badge variant="outline">{condition}</Badge><Badge variant="outline">{category}</Badge></div><h4 className="font-bold text-lg">{title}</h4><p className="text-primary font-bold text-xl mt-1">{listingType === "auction" ? `Start: $${startPrice}` : `$${price}`}{listingType === "auction" && buyNowPrice && <span className="text-sm text-muted-foreground font-normal ml-2">Buy-Now: ${buyNowPrice}</span>}</p><p className="text-xs text-muted-foreground mt-1">{category} · {condition}</p>{description && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{description}</p>}{images.length > 0 && <div className="flex gap-2 mt-3">{images.slice(0, 3).map((img, i) => <img key={i} src={img} alt="" className="w-16 h-16 rounded object-cover" />)}{images.length > 3 && <div className="w-16 h-16 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">+{images.length - 3}</div>}</div>}</div></div>

          <div className="flex gap-3"><Button onClick={() => setStep(2)} variant="outline" className="flex-1">Back</Button><Button onClick={handleSubmit} disabled={createListing.isPending} className="flex-1">{createListing.isPending ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Listing...</> : <><Check className="w-5 h-5 mr-2" /> List Item</>}</Button></div>
        </div>}
      </div>
    </div>
  );
}