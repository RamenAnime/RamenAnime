import { useState } from "react";
import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useCurrency } from "@/hooks/useCurrency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Heart, Share2, MessageSquare, Gavel, Tag, Zap,
  Clock, Shield, ChevronDown, ChevronUp, TrendingUp,
  Star, Truck, MapPin, AlertTriangle, Check
} from "lucide-react";

function CountdownTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState("");
  const end = new Date(endTime).getTime();

  setInterval(() => {
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) { setTimeLeft("Ended"); return; }
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s`);
  }, 1000);

  return <span className="font-mono text-lg">{timeLeft}</span>;
}

function PriceChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.price));
  return (
    <div className="mt-3 space-y-1">
      <p className="text-xs text-muted-foreground">Price History</p>
      <div className="flex items-end gap-1 h-16">
        {data.map((d, i) => (
          <div key={i} className="flex-1 bg-primary/30 rounded-t" style={{ height: `${(d.price / max) * 100}%` }} />
        ))}
      </div>
    </div>
  );
}

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const listingId = parseInt(id ?? "0");
  const { user } = useAuth();
  const { format } = useCurrency();
  const [bidAmount, setBidAmount] = useState("");
  const [showAllBids, setShowAllBids] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositPaid, setDepositPaid] = useState(false);

  const { data: listing } = trpc.marketplace.getListing.useQuery(
    { listingId },
    { enabled: listingId > 0 }
  );
  const { data: bids } = trpc.marketplace.getBidHistory.useQuery(
    { listingId },
    { enabled: listingId > 0 }
  );
  const { data: related } = trpc.marketplace.relatedItems.useQuery(
    { listingId, category: listing?.category },
    { enabled: !!listing?.category }
  );

  const placeBid = trpc.marketplace.placeBid.useMutation({
    onSuccess: () => {
      setBidAmount("");
      window.location.reload();
    },
  });
  const toggleWatch = trpc.marketplace.toggleWatchlist.useMutation({
    onSuccess: () => setIsWatching(!isWatching),
  });
  const payDeposit = trpc.marketplace.payDeposit.useMutation({
    onSuccess: () => setDepositPaid(true),
  });

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const isAuction = listing.listingType === "auction";
  const isEnded = listing.auctionEnd ? new Date(listing.auctionEnd) < new Date() : false;
  const priceHistory = (bids || []).map((b: any, i: number) => ({ price: parseFloat(b.amount), time: i }));

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/marketplace" className="hover:text-primary">Marketplace</Link>
          <span>/</span>
          <span className="capitalize">{listing.category}</span>
          <span>/</span>
          <span className="truncate max-w-xs">{listing.title}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Images */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listing.images && JSON.parse(listing.images || "[]").map((img: string, i: number) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-muted border border-border/50">
                  <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
              {(!listing.images || JSON.parse(listing.images || "[]").length === 0) && (
                <div className="aspect-square rounded-xl bg-muted flex items-center justify-center">
                  <Tag className="w-12 h-12 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Title & Description */}
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className="capitalize">{listing.category}</Badge>
                <Badge variant="outline" className="capitalize">{listing.condition}</Badge>
                {listing.copyrightStatus === "clear" && (
                  <Badge variant="outline" className="border-green-500/30 text-green-500"><Shield className="w-3 h-3 mr-1" />Verified</Badge>
                )}
                {listing.copyrightStatus === "flagged" && (
                  <Badge variant="outline" className="border-yellow-500/30 text-yellow-500"><AlertTriangle className="w-3 h-3 mr-1" />Review</Badge>
                )}
                {isAuction && <Badge className="bg-primary text-primary-foreground"><Gavel className="w-3 h-3 mr-1" />Auction</Badge>}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{listing.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>Listed {new Date(listing.createdAt).toLocaleDateString()}</span>
                <span>{listing.views} views</span>
                {isAuction && <span>{listing.bidCount} bids</span>}
              </div>
              <p className="mt-4 text-foreground whitespace-pre-wrap">{listing.description}</p>
            </div>
          </div>

          {/* Right: Price & Actions */}
          <div className="space-y-4">
            <Card className="border-border/50 sticky top-20">
              <CardContent className="p-0">
                {/* Price */}
                <div className="bg-primary/5 p-4 text-center border-b border-primary/10">
                  {isAuction ? (
                    <>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        {isEnded ? "Final Price" : "Current Bid"}
                      </p>
                      <p className="text-4xl font-black text-primary">
                        ${format(listing.currentBid || listing.startPrice || "0")}
                      </p>
                      <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />{listing.bidCount || 0} bids
                        </span>
                        {listing.reservePrice && <span>Reserve: ${listing.reservePrice}</span>}
                      </div>
                      {isAuction && !isEnded && (
                        <div className="mt-2 text-sm">
                          <Clock className="w-3 h-3 inline mr-1" />
                          Ends in: <CountdownTimer endTime={listing.auctionEnd || new Date().toISOString()} />
                        </div>
                      )}
                      <PriceChart data={priceHistory} />
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Price</p>
                      <p className="text-4xl font-black text-primary">{format(listing.price)}</p>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-4 space-y-2">
                  {isAuction && !isEnded ? (
                    <>
                      {parseFloat(listing.startPrice || "0") >= 5000 && !depositPaid && (
                        <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 mb-2">
                          <p className="text-xs text-yellow-600 mb-1">Deposit Required (5%)</p>
                          <Button className="w-full" size="sm" onClick={() => payDeposit.mutate({ listingId, amount: (parseFloat(listing.startPrice || "0") * 0.05).toString() })}>
                            Pay ${(parseFloat(listing.startPrice || "0") * 0.05).toFixed(2)} Deposit
                          </Button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder="Enter bid"
                          className="flex-1"
                        />
                        <Button onClick={() => placeBid.mutate({ listingId, amount: bidAmount })} disabled={!bidAmount}>
                          <Gavel className="w-4 h-4 mr-1" />Bid
                        </Button>
                      </div>
                      <div className="flex gap-1">
                        {[10, 50, 100, 500].map((inc) => (
                          <Button key={inc} variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setBidAmount((parseFloat(listing.currentBid || listing.startPrice || "0") + inc).toString())}>
                            +${inc}
                          </Button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Button className="w-full bg-primary text-lg py-6">
                      <Tag className="w-5 h-5 mr-2" />Buy Now
                    </Button>
                  )}

                  {!isAuction && (
                    <Link to={`/profile/${listing.sellerId}`}>
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="w-4 h-4 mr-1" />Contact Seller
                      </Button>
                    </Link>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => toggleWatch.mutate({ listingId })}>
                      <Heart className={`w-4 h-4 mr-1 ${isWatching ? "fill-primary text-primary" : ""}`} />
                      {isWatching ? "Watching" : "Watch"}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                      <Share2 className="w-4 h-4 mr-1" />Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Card */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {(listing.seller?.name || "U").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-sm">{listing.seller?.name || "Seller"}</p>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} className={`w-3 h-3 ${s <= 4 ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                      ))}
                      <span className="text-xs text-muted-foreground">(12)</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p className="flex items-center gap-1"><Truck className="w-3 h-3" />Free shipping on orders over $50</p>
                  <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />Ships worldwide</p>
                  <p className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" />Verified seller</p>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Info */}
            <Card className="border-border/50">
              <CardContent className="p-4">
                <h3 className="font-medium text-sm mb-2">Shipping</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <p>Standard: 5-10 business days</p>
                  <p>Express: 2-3 business days</p>
                  <p>Returns accepted within 14 days</p>
                </div>
              </CardContent>
            </Card>

            {/* Bid History */}
            {isAuction && bids && bids.length > 0 && (
              <Card className="border-border/50 overflow-hidden">
                <button
                  onClick={() => setShowAllBids(!showAllBids)}
                  className="w-full bg-muted px-4 py-3 font-semibold flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />Bid History ({bids.length})
                  </span>
                  {showAllBids ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showAllBids && (
                  <div className="p-3 space-y-1 max-h-64 overflow-y-auto">
                    {bids.map((bid: any, i: number) => (
                      <div key={bid.id} className={`flex items-center justify-between p-2 rounded ${i === 0 ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"}`}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px] bg-primary/10">
                              {(bid.bidder?.name || "U").charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-medium">{bid.bidder?.name || "User"}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(bid.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${i === 0 ? "text-primary" : ""}`}>${bid.amount}</p>
                          {bid.isProxy && <p className="text-[10px] text-muted-foreground">auto</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>

        {/* Related Items */}
        {related && related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">Related Items</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((item: any) => (
                <Link key={item.id} to={`/marketplace/${item.id}`} className="group">
                  <Card className="border-border/50 hover:border-primary/30 transition-all">
                    <CardContent className="p-3">
                      <div className="aspect-square rounded-lg bg-muted mb-2 overflow-hidden">
                        {item.images && JSON.parse(item.images)[0] ? (
                          <img src={JSON.parse(item.images)[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <Tag className="w-full h-full p-8 text-muted-foreground/30" />
                        )}
                      </div>
                      <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.price}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
