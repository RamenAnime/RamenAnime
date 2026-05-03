import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Gavel, Tag, Clock, ArrowLeft, Heart, MessageSquare, TrendingUp,
  Loader2, ImageIcon, Film, ChevronLeft, ChevronRight, ShieldCheck,
  ShieldAlert, Zap, Eye, Truck, HelpCircle, Send, Check,
  Star, ChevronUp, ChevronDown, Share2, Flag, Flame, Snowflake,
  Thermometer, Award, BarChart3, AlertTriangle, DollarSign,
} from "lucide-react";

function useCountdown(endDate: string | null) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0, ended: false });
  useEffect(() => {
    if (!endDate) return;
    const calc = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0, ended: true }); return; }
      setTimeLeft({ days: Math.floor(diff / 86400000), hours: Math.floor((diff % 86400000) / 3600000), mins: Math.floor((diff % 3600000) / 60000), secs: Math.floor((diff % 60000) / 1000), ended: false });
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [endDate]);
  return timeLeft;
}

function getBidIncrements(current: number): number[] {
  if (current < 1000) return [10, 50, 100, 500];
  if (current < 5000) return [100, 250, 500, 1000];
  if (current < 10000) return [250, 500, 1000, 2500];
  if (current < 50000) return [500, 1000, 2500, 5000];
  return [1000, 2500, 5000, 10000];
}

function HeatBadge({ heat, views }: { heat: string; views: number }) {
  if (heat === "hot") return <Badge className="bg-red-500 text-white border-0"><Flame className="w-3 h-3 mr-1" /> Hot {views > 0 && `· ${views} views`}</Badge>;
  if (heat === "warm") return <Badge variant="outline" className="text-orange-500 border-orange-300"><Thermometer className="w-3 h-3 mr-1" /> Warm {views > 0 && `· ${views} views`}</Badge>;
  return <Badge variant="outline" className="text-blue-400 border-blue-200"><Snowflake className="w-3 h-3 mr-1" /> {views} views</Badge>;
}

function SellerLevelBadge({ level }: { level?: string }) {
  const colors: Record<string, string> = { bronze: "bg-amber-700 text-white", silver: "bg-gray-400 text-white", gold: "bg-yellow-500 text-white", platinum: "bg-cyan-400 text-white", diamond: "bg-purple-500 text-white" };
  return level ? <Badge className={`${colors[level] || colors.bronze} capitalize text-[10px]`}><Award className="w-3 h-3 mr-0.5" />{level}</Badge> : null;
}

function StarRating({ rating, count }: { rating: string; count: number }) {
  const num = parseFloat(rating) || 0;
  return <div className="flex items-center gap-1">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= num ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />)}
    <span className="text-sm font-bold ml-1">{rating}</span><span className="text-xs text-muted-foreground">({count} reviews)</span></div>;
}

function PriceChart({ data }: { data: any[] }) {
  if (!data || data.length < 2) return null;
  const maxPrice = Math.max(...data.map((d: any) => d.amount));
  const minPrice = Math.min(...data.map((d: any) => d.amount));
  const range = maxPrice - minPrice || 1;
  return <div className="mt-3"><p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Bid Price Trend</p>
    <div className="flex items-end gap-1 h-16">{data.map((d: any, i: number) => {
      const height = ((d.amount - minPrice) / range) * 100;
      return <div key={i} className="flex-1 flex flex-col items-center gap-0.5"><div className="w-full bg-primary/30 rounded-t" style={{ height: `${Math.max(height, 10)}%` }} /><span className="text-[8px] text-muted-foreground">${Math.round(d.amount)}</span></div>;
    })}</div></div>;
}

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const listingId = parseInt(id || "0");
  const [bidAmount, setBidAmount] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [bidError, setBidError] = useState("");
  const [bidSuccess, setBidSuccess] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [answerTexts, setAnswerTexts] = useState<Record<number, string>>({});
  const [showAllBids, setShowAllBids] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState("");
  const [depositLoading, setDepositLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const { data: listing, isLoading } = trpc.marketplace.getListing.useQuery({ id: listingId });
  const { data: bidData } = trpc.marketplace.getBidHistory.useQuery({ listingId });
  const { data: questions } = trpc.marketplace.getQuestions.useQuery({ listingId });
  const { data: related } = trpc.marketplace.relatedItems.useQuery({ listingId, limit: 6 });
  const { data: watchStatus } = trpc.marketplace.isWatching.useQuery({ listingId }, { enabled: isAuthenticated });
  const { data: popularity } = trpc.marketplace.getPopularity.useQuery({ listingId });
  const { data: depositInfo } = trpc.marketplace.getDepositInfo.useQuery({ listingId }, { enabled: listing?.listingType === "auction" });
  const { data: ratingData } = trpc.marketplace.getSellerRatings.useQuery({ sellerId: listing?.sellerId || 0, limit: 10 }, { enabled: !!listing?.sellerId });
  const utils = trpc.useUtils();

  const countdown = useCountdown(listing?.auctionEnd || null);
  const toggleWatch = trpc.marketplace.toggleWatchlist.useMutation({ onSuccess: () => { utils.marketplace.isWatching.invalidate({ listingId }); utils.marketplace.myWatchlist.invalidate(); } });
  const placeBid = trpc.marketplace.placeBid.useMutation({
    onSuccess: (data) => { setBidAmount(""); setBidError(""); setBidSuccess(data.won ? data.message : "Bid placed!"); utils.marketplace.getListing.invalidate({ id: listingId }); utils.marketplace.getBidHistory.invalidate({ listingId }); setTimeout(() => setBidSuccess(""), 5000); },
    onError: (e) => { setBidError(e.message); setTimeout(() => setBidError(""), 5000); },
  });
  const payDeposit = trpc.marketplace.payDeposit.useMutation({ onSuccess: () => { setDepositLoading(false); utils.marketplace.getDepositInfo.invalidate({ listingId }); }, onError: () => setDepositLoading(false) });
  const askQuestion = trpc.marketplace.askQuestion.useMutation({ onSuccess: () => { setQuestionText(""); utils.marketplace.getQuestions.invalidate({ listingId }); } });
  const answerQuestion = trpc.marketplace.answerQuestion.useMutation({ onSuccess: () => { setAnswerTexts({}); utils.marketplace.getQuestions.invalidate({ listingId }); } });
  const rateSeller = trpc.marketplace.rateSeller.useMutation({ onSuccess: () => { setShowRatingForm(false); setRatingComment(""); utils.marketplace.getSellerRatings.invalidate({ sellerId: listing?.sellerId || 0 }); } });
  const trackView = trpc.marketplace.trackView.useMutation();
  useEffect(() => { trackView.mutate({ listingId }); }, [listingId]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!listing) return <div className="min-h-screen flex items-center justify-center"><Card className="max-w-md"><CardContent className="p-8 text-center"><Tag className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><h2 className="text-xl font-bold mb-2">Not Found</h2><Link to="/marketplace"><Button><ArrowLeft className="w-4 h-4 mr-1" />Back</Button></Link></CardContent></Card></div>;

  const imgs: string[] = listing.images ? JSON.parse(listing.images) : [];
  const vids: string[] = listing.videos ? JSON.parse(listing.videos) : [];
  const allMedia = [...imgs, ...vids];
  const isAuction = listing.listingType === "auction";
  const isEnded = countdown.ended;
  const isOwner = user?.id === listing.sellerId;
  const currentBid = parseFloat(listing.currentBid || listing.startPrice || "0");
  const increments = getBidIncrements(currentBid);
  const bids = bidData?.bids || [];
  const priceHistory = bidData?.priceHistory || [];

  const handlePlaceBid = () => {
    if (!bidAmount || parseFloat(bidAmount) <= currentBid) { setBidError(`Must exceed $${currentBid}`); return; }
    placeBid.mutate({ listingId, amount: bidAmount });
  };
  const quickBid = (inc: number) => { setBidAmount((currentBid + inc).toString()); setBidError(""); };

  return (
    <div className="min-h-screen py-6">
      <div className="container px-4 md:px-6 max-w-6xl">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/marketplace" className="hover:text-primary transition">Marketplace</Link><span>/</span>
          <span className="capitalize">{listing.category}</span><span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{listing.title}</span>
        </nav>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted border">
              {allMedia.length > 0 ? (activeImage < imgs.length ? <img src={imgs[activeImage]} alt="" className="w-full h-full object-contain" /> : <video src={vids[activeImage - imgs.length]} className="w-full h-full object-contain" controls />) : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-20 h-20 text-muted-foreground/20" /></div>}
              {allMedia.length > 1 && (<>
                <button onClick={() => setActiveImage(Math.max(0, activeImage - 1))} disabled={activeImage === 0} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 text-white rounded-full disabled:opacity-0 hover:bg-black/80 transition"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => setActiveImage(Math.min(allMedia.length - 1, activeImage + 1))} disabled={activeImage === allMedia.length - 1} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/60 text-white rounded-full disabled:opacity-0 hover:bg-black/80 transition"><ChevronRight className="w-5 h-5" /></button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">{activeImage + 1} / {allMedia.length}</div>
              </>)}
              {isAuction && !isEnded && <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1"><Gavel className="w-3 h-3" />AUCTION</div>}
              {listing.copyrightStatus === "clear" && <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1"><ShieldCheck className="w-3 h-3" />Authentic</div>}
            </div>

            {allMedia.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {imgs.map((img, i) => <button key={i} onClick={() => setActiveImage(i)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${activeImage === i ? "border-primary" : "border-transparent hover:border-muted"}`}><img src={img} alt="" className="w-full h-full object-cover" /></button>)}
                {vids.map((vid, i) => <button key={`v${i}`} onClick={() => setActiveImage(imgs.length + i)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 bg-muted flex items-center justify-center ${activeImage === imgs.length + i ? "border-primary" : "border-transparent"}`}><Film className="w-6 h-6 text-muted-foreground" /></button>)}
              </div>
            )}

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <HeatBadge heat={popularity?.heat || "low"} views={listing.viewCount || 0} />
                <Badge variant="outline" className="capitalize">{listing.condition}</Badge>
                <Badge variant="outline" className="capitalize">{listing.category}</Badge>
                {listing.sellerProfile?.verifiedSeller && <Badge variant="outline" className="text-blue-600 border-blue-300"><ShieldCheck className="w-3 h-3 mr-0.5" />Verified</Badge>}
              </div>
              <h1 className="text-xl lg:text-2xl font-bold leading-tight">{listing.title}</h1>
            </div>

            <Card className="border-border/50"><CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm"><Tag className="w-4 h-4" /> Description</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{listing.description}</p>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {[{ label: "Category", value: listing.category }, { label: "Condition", value: listing.condition }, { label: "Type", value: isAuction ? "Auction" : "Fixed Price" }, { label: "Listed", value: new Date(listing.createdAt).toLocaleDateString() }, { label: "Views", value: String(listing.viewCount || 0) }, { label: "Bids", value: String(listing.bidCount || 0) }, ...(listing.auctionEnd ? [{ label: "Ends", value: new Date(listing.auctionEnd).toLocaleDateString() }] : []), ...(listing.reservePrice ? [{ label: "Reserve", value: `$${listing.reservePrice}` }] : [])].map((item, i) => <div key={i} className="bg-muted/50 p-2 rounded"><span className="text-muted-foreground block">{item.label}</span><span className="font-medium">{item.value}</span></div>)}
              </div>
            </CardContent></Card>

            <Card className="border-border/50"><CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2 text-sm"><HelpCircle className="w-4 h-4" /> Questions & Answers ({questions?.length || 0})</h3>
              {questions?.map((q: any) => <div key={q.id} className="space-y-2 border-b last:border-0 pb-3 last:pb-0">
                <div className="flex items-start gap-2"><Avatar className="h-6 w-6"><AvatarFallback className="text-[10px] bg-primary/10">{q.asker?.name?.charAt(0) || "U"}</AvatarFallback></Avatar><div className="flex-1"><p className="text-sm">{q.question}</p><p className="text-[10px] text-muted-foreground">{q.asker?.name || "User"}</p></div></div>
                {q.answer && <div className="ml-8 p-2 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800"><p className="text-[10px] text-green-600 flex items-center gap-1 mb-1"><Check className="w-3 h-3" />Seller answer</p><p className="text-sm">{q.answer}</p></div>}
                {isOwner && !q.answer && <div className="ml-8 flex gap-2"><Textarea value={answerTexts[q.id] || ""} onChange={(e) => setAnswerTexts(p => ({ ...p, [q.id]: e.target.value }))} placeholder="Answer..." className="min-h-[50px] text-xs" /><Button size="sm" onClick={() => answerQuestion.mutate({ questionId: q.id, answer: answerTexts[q.id] || "" })} disabled={!answerTexts[q.id]}><Send className="w-3 h-3" /></Button></div>}
              </div>)}
              {isAuthenticated && !isOwner && <div className="flex gap-2 pt-2 border-t"><Textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="Ask the seller..." className="min-h-[50px] text-xs" /><Button size="sm" onClick={() => askQuestion.mutate({ listingId, question: questionText })} disabled={!questionText.trim()}><Send className="w-4 h-4" /></Button></div>}
            </CardContent></Card>

            {ratingData && ratingData.ratings.length > 0 && <Card className="border-border/50"><CardContent className="p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm"><Star className="w-4 h-4" /> Seller Reviews ({listing.sellerRatingCount})</h3>
              <div className="flex items-center gap-4 mb-3"><div className="text-center"><p className="text-3xl font-black">{listing.sellerAvgRating}</p><p className="text-xs text-muted-foreground">out of 5</p></div>
                <div className="flex-1 space-y-1">{[5, 4, 3, 2, 1].map((s) => { const pct = listing.sellerRatingCount > 0 ? ((ratingData.distribution[s as keyof typeof ratingData.distribution] || 0) / listing.sellerRatingCount * 100) : 0; return <div key={s} className="flex items-center gap-2 text-xs"><span className="w-3">{s}</span><Star className="w-3 h-3 text-yellow-400" /><Progress value={pct} className="h-1.5 flex-1" /><span className="w-6 text-right text-muted-foreground">{Math.round(pct)}%</span></div>; })}</div>
              </div>
              {ratingData.ratings.slice(0, 3).map((r: any) => <div key={r.id} className="border-t pt-2 mt-2"><div className="flex items-center gap-1 mb-1">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className={`w-3 h-3 ${s <= r.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />)}<span className="text-xs text-muted-foreground ml-1">{r.rater?.name || "User"}</span></div>{r.comment && <p className="text-xs text-muted-foreground">{r.comment}</p>}</div>)}
            </CardContent></Card>}

            {isAuthenticated && !isOwner && !showRatingForm && <Button variant="outline" size="sm" onClick={() => setShowRatingForm(true)} className="w-full"><Star className="w-4 h-4 mr-1" /> Rate This Seller</Button>}
            {showRatingForm && <Card className="border-primary/20"><CardContent className="p-4 space-y-3"><p className="text-sm font-medium">Rate your experience</p><div className="flex items-center gap-1">{[1, 2, 3, 4, 5].map((s) => <button key={s} onClick={() => setRatingValue(s)}><Star className={`w-6 h-6 ${s <= ratingValue ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} /></button>)}</div><Textarea value={ratingComment} onChange={(e) => setRatingComment(e.target.value)} placeholder="Optional comment..." className="text-xs" /><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setShowRatingForm(false)} className="flex-1">Cancel</Button><Button size="sm" onClick={() => rateSeller.mutate({ sellerId: listing.sellerId, listingId, rating: ratingValue, comment: ratingComment })} className="flex-1">Submit</Button></div></CardContent></Card>}
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-2">
              {isAuthenticated && <Button variant={watchStatus?.watching ? "default" : "outline"} size="sm" onClick={() => toggleWatch.mutate({ listingId })} className="flex-1"><Heart className={`w-4 h-4 mr-1 ${watchStatus?.watching ? "fill-current" : ""}`} />{watchStatus?.watching ? "Watching" : "Watch"}</Button>}
              <Button variant="outline" size="sm" onClick={() => setShowShare(!showShare)} className="flex-1"><Share2 className="w-4 h-4 mr-1" />Share</Button>
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive"><Flag className="w-4 h-4" /></Button>
            </div>
            {showShare && <div className="flex gap-2"><Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => { navigator.clipboard.writeText(window.location.href); setShowShare(false); }}>Copy Link</Button></div>}

            <Card className="border-2 border-primary/20 overflow-hidden">
              <CardContent className="p-0">
                <div className="bg-primary/5 p-4 text-center border-b border-primary/10">
                  {isAuction ? (<><p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{isEnded ? "Final Price" : "Current Bid"}</p><p className="text-4xl font-black text-primary">${listing.currentBid || listing.startPrice}</p><div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground"><span className="flex items-center gap-1"><Zap className="w-3 h-3" />{listing.bidCount || 0} bids</span>{listing.reservePrice && <span>Reserve: ${listing.reservePrice}</span></div><PriceChart data={priceHistory} /></>) : (<><p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Price</p><p className="text-4xl font-black text-primary">{listing.price}</p></>)}
                </div>

                {isAuction && (<div className={`p-3 text-center ${isEnded ? "bg-gray-100" : "bg-orange-50 dark:bg-orange-950/20"}`}>{isEnded ? <p className="font-medium text-gray-600 flex items-center justify-center gap-1"><Clock className="w-4 h-4" />Auction Ended</p> : <><p className="text-xs text-orange-600 mb-1">Time Remaining</p><div className="flex items-center justify-center gap-1 font-mono text-xl font-bold">{countdown.days > 0 && <><span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 px-2 py-1 rounded">{String(countdown.days).padStart(2, "0")}</span><span className="text-orange-400">:</span></>}<span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 px-2 py-1 rounded">{String(countdown.hours).padStart(2, "0")}</span><span className="text-orange-400">:</span><span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 px-2 py-1 rounded">{String(countdown.mins).padStart(2, "0")}</span><span className="text-orange-400">:</span><span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 px-2 py-1 rounded">{String(countdown.secs).padStart(2, "0")}</span></div><p className="text-[10px] text-muted-foreground mt-1">{listing.auctionEnd ? new Date(listing.auctionEnd).toLocaleString() : ""}</p>{!isEnded && countdown.days === 0 && countdown.hours === 0 && countdown.mins < 5 && <p className="text-[10px] text-orange-500 mt-1 flex items-center justify-center gap-1"><AlertTriangle className="w-3 h-3" />Bidding extends +5 min in final minutes</p>}</>}</div>)}

                {isAuction && !isEnded && !isOwner && isAuthenticated && <div className="p-4 space-y-3">
                  {bidError && <div className="bg-red-50 text-red-600 p-2 rounded text-xs font-medium">{bidError}</div>}
                  {bidSuccess && <div className="bg-green-50 text-green-600 p-2 rounded text-xs font-medium flex items-center gap-1"><Check className="w-3 h-3" />{bidSuccess}</div>}

                  {depositInfo?.isRequired && <div className="bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 p-2 rounded text-xs"><p className="flex items-center gap-1 text-yellow-700"><DollarSign className="w-3 h-3" /> Deposit required: ${depositInfo.required}</p><Button size="sm" variant="outline" className="w-full mt-1 text-xs" onClick={() => { setDepositLoading(true); payDeposit.mutate({ listingId }); }} disabled={depositLoading}>{depositLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <><DollarSign className="w-3 h-3" /> Pay Deposit</>}</Button></div>}

                  <div><p className="text-xs text-muted-foreground mb-1">Quick Bid (+increment)</p><div className="grid grid-cols-4 gap-2">{increments.map((inc) => <button key={inc} onClick={() => quickBid(inc)} className={`text-xs py-2 rounded-md border font-bold transition ${bidAmount === (currentBid + inc).toString() ? "border-primary bg-primary/10 text-primary" : "border-input hover:border-primary/50"}`}>+${inc}</button>)}</div><p className="text-[10px] text-muted-foreground mt-1">Min increment: ${getBidIncrements(currentBid)[0]}</p></div>

                  <div className="flex gap-2"><div className="relative flex-1"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span><Input type="number" value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} placeholder={`Min $${(currentBid + getBidIncrements(currentBid)[0])}`} className="pl-7 text-lg font-bold" /></div><Button onClick={handlePlaceBid} disabled={placeBid.isPending} className="bg-primary px-6">{placeBid.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Gavel className="w-4 h-4 mr-1" />Bid</>}</Button></div>

                  {listing.buyNowPrice && <Button variant="outline" className="w-full border-green-500 text-green-600 hover:bg-green-50" onClick={() => { setBidAmount(String(listing.buyNowPrice)); setTimeout(handlePlaceBid, 50); }}><Zap className="w-4 h-4 mr-1" /> Buy Now ${listing.buyNowPrice}</Button>}
                </div>}

                {isAuction && isOwner && <div className="p-4 text-center text-sm text-muted-foreground bg-muted/50">You cannot bid on your own auction.</div>}
                {!isAuthenticated && isAuction && !isEnded && <div className="p-4 text-center"><p className="text-sm text-muted-foreground mb-2">Log in to place bids</p><Link to="/login"><Button size="sm">Log In</Button></Link></div>}

                {!isAuction && <div className="p-4 space-y-2"><Button className="w-full bg-primary text-lg py-6"><Tag className="w-5 h-5 mr-2" />Buy Now</Button><Link to={`/profile/${listing.sellerId}`}><Button variant="outline" className="w-full"><MessageSquare className="w-4 h-4 mr-1" />Contact Seller</Button></Link></div>}
              </CardContent>
            </Card>

            <Card className="border-border/50"><CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3"><Avatar className="h-14 w-14"><AvatarFallback className="bg-primary/10 text-primary text-lg">{listing.seller?.name?.charAt(0) ?? "U"}</AvatarFallback></Avatar><div className="flex-1"><p className="font-semibold">{listing.seller?.name ?? "Unknown"}</p><div className="flex items-center gap-2 mt-0.5"><SellerLevelBadge level={listing.sellerProfile?.level} />{listing.sellerProfile?.verifiedSeller && <Badge variant="outline" className="text-blue-600 border-blue-300 text-[10px]"><ShieldCheck className="w-3 h-3 mr-0.5" />Verified</Badge>}</div></div></div>
              {listing.sellerAvgRating && parseFloat(listing.sellerAvgRating) > 0 && <StarRating rating={listing.sellerAvgRating} count={listing.sellerRatingCount} />}
              <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs"><div className="bg-muted/50 p-2 rounded"><p className="font-bold">{listing.sellerProfile?.totalSales || 0}</p><p className="text-muted-foreground">Sales</p></div><div className="bg-muted/50 p-2 rounded"><p className="font-bold">{listing.sellerProfile?.successfulAuctions || 0}</p><p className="text-muted-foreground">Auctions</p></div><div className="bg-muted/50 p-2 rounded"><p className="font-bold">{listing.sellerProfile?.responseTimeMinutes || "--"}</p><p className="text-muted-foreground">Min Response</p></div></div>
              <Link to={`/profile/${listing.sellerId}`}><Button variant="outline" size="sm" className="w-full mt-3"><Eye className="w-3 h-3 mr-1" />View Full Profile</Button></Link>
            </CardContent></Card>

            <Card className="border-border/50"><CardContent className="p-4 space-y-2"><h4 className="font-medium text-sm flex items-center gap-1"><Truck className="w-4 h-4" /> Shipping</h4><div className="text-xs text-muted-foreground space-y-1"><p className="flex justify-between"><span>Standard (5-14 days)</span><span className="font-medium">Calculated at checkout</span></p><p className="flex justify-between"><span>Express (3-7 days)</span><span className="font-medium">+$15-35</span></p><p className="text-[10px] pt-1 border-t">International shipping available to all geofence countries</p></div></CardContent></Card>

            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 border ${listing.copyrightStatus === "clear" ? "bg-green-50 text-green-700 border-green-200" : listing.copyrightStatus === "flagged" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-muted border-muted"}`}>
              {listing.copyrightStatus === "clear" ? <ShieldCheck className="w-4 h-4" /> : listing.copyrightStatus === "flagged" ? <ShieldAlert className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
              {listing.copyrightStatus === "clear" ? "Authenticity verified by copyright bot" : listing.copyrightStatus === "flagged" ? "Under copyright review" : "Copyright scan pending"}
            </div>

            {isAuction && bids.length > 0 && <Card className="border-border/50 overflow-hidden"><button onClick={() => setShowAllBids(!showAllBids)} className="w-full bg-muted px-4 py-3 font-semibold flex items-center justify-between text-sm"><span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" />Bid History ({bids.length})</span>{showAllBids ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>{showAllBids && <div className="p-3 space-y-1 max-h-64 overflow-y-auto">{bids.map((bid: any, i: number) => <div key={bid.id} className={`flex items-center justify-between p-2 rounded ${i === 0 ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"}`}><div className="flex items-center gap-2"><Avatar className="h-6 w-6"><AvatarFallback className="text-[10px] bg-primary/10">{bid.bidder?.name?.charAt(0) ?? "U"}</AvatarFallback></Avatar><div><p className="text-xs font-medium">{bid.bidder?.name ?? "User"}</p><p className="text-[10px] text-muted-foreground">{new Date(bid.createdAt).toLocaleDateString()}</p></div></div><div className="text-right"><p className={`text-sm font-bold ${i === 0 ? "text-primary" : ""}`}>${bid.amount}</p>{bid.isProxy && <p className="text-[10px] text-muted-foreground">auto</p>}</div></div>)}</div>}</Card>}
          </div>
        </div>

        {related && related.length > 0 && <div className="mt-12"><h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Eye className="w-5 h-5" />Similar Items You May Like</h3><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">{related.map((item: any) => { const rImgs: string[] = item.images ? JSON.parse(item.images) : []; return <Link key={item.id} to={`/marketplace/${item.id}`} className="group"><div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2">{rImgs.length > 0 ? <img src={rImgs[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" /> : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10"><Star className="w-8 h-8 text-primary/20" /></div>}</div><p className="text-xs font-medium line-clamp-1 group-hover:text-primary transition">{item.title}</p><p className="text-xs text-primary font-bold">{item.listingType === "auction" ? `Current: $${item.currentBid || item.startPrice}` : item.price}</p></Link>; })}</div></div>}
      </div>
    </div>
  );
}