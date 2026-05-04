bids?.bids || []import { useState } from "react";
bids?.bids || []import { useParams, Link } from "react-router";
bids?.bids || []import { trpc } from "@/providers/trpc";
bids?.bids || []
bids?.bids || []import { useCurrency } from "@/hooks/useCurrency";
bids?.bids || []import { Card, CardContent } from "@/components/ui/card";
bids?.bids || []import { Button } from "@/components/ui/button";
bids?.bids || []import { Avatar, AvatarFallback } from "@/components/ui/avatar";
bids?.bids || []import { Badge } from "@/components/ui/badge";
bids?.bids || []
bids?.bids || []import {
bids?.bids || []  Heart, Share2, MessageSquare, Gavel, Tag, Zap,
bids?.bids || []  Clock, Shield, ChevronDown, ChevronUp, TrendingUp,
bids?.bids || []  Star, Truck, MapPin, AlertTriangle, Check
bids?.bids || []} from "lucide-react";
bids?.bids || []
bids?.bids || []function CountdownTimer({ endTime }: { endTime: string }) {
bids?.bids || []  const [timeLeft, setTimeLeft] = useState("");
bids?.bids || []  const end = new Date(endTime).getTime();
bids?.bids || []
bids?.bids || []  setInterval(() => {
bids?.bids || []    const now = Date.now();
bids?.bids || []    const diff = end - now;
bids?.bids || []    if (diff <= 0) { setTimeLeft("Ended"); return; }
bids?.bids || []    const days = Math.floor(diff / 86400000);
bids?.bids || []    const hours = Math.floor((diff % 86400000) / 3600000);
bids?.bids || []    const mins = Math.floor((diff % 3600000) / 60000);
bids?.bids || []    const secs = Math.floor((diff % 60000) / 1000);
bids?.bids || []    setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s`);
bids?.bids || []  }, 1000);
bids?.bids || []
bids?.bids || []  return <span className="font-mono text-lg">{timeLeft}</span>;
bids?.bids || []}
bids?.bids || []
bids?.bids || []function PriceChart({ data }: { data: any[] }) {
bids?.bids || []  if (!data || data.length === 0) return null;
bids?.bids || []  const max = Math.max(...data.map((d) => d.price));
bids?.bids || []  return (
bids?.bids || []    <div className="mt-3 space-y-1">
bids?.bids || []      <p className="text-xs text-muted-foreground">Price History</p>
bids?.bids || []      <div className="flex items-end gap-1 h-16">
bids?.bids || []        {data.map((d, i) => (
bids?.bids || []          <div key={i} className="flex-1 bg-primary/30 rounded-t" style={{ height: `${(d.price / max) * 100}%` }} />
bids?.bids || []        ))}
bids?.bids || []      </div>
bids?.bids || []    </div>
bids?.bids || []  );
bids?.bids || []}
bids?.bids || []
bids?.bids || []export default function ListingDetail() {
bids?.bids || []  const { id } = useParams<{ id: string }>();
bids?.bids || []  const listingId = parseInt(id ?? "0");
bids?.bids || []  
bids?.bids || []  const { format } = useCurrency();
bids?.bids || []  const [bidAmount, setBidAmount] = useState("");
bids?.bids || []  const [showAllBids, setShowAllBids] = useState(false);
bids?.bids || []  const [isWatching, setIsWatching] = useState(false);
bids?.bids || []  
bids?.bids || []  const [depositPaid, setDepositPaid] = useState(false);
bids?.bids || []
bids?.bids || []  const { data: listing } = trpc.marketplace.getListing.useQuery(
bids?.bids || []    { id: listingId },
bids?.bids || []    { enabled: listingId > 0 }
bids?.bids || []  );
bids?.bids || []  const { data: bids } = trpc.marketplace.getBidHistory.useQuery(
bids?.bids || []    { id: listingId },
bids?.bids || []    { enabled: listingId > 0 }
bids?.bids || []  );
bids?.bids || []  const { data: related } = trpc.marketplace.relatedItems.useQuery(
bids?.bids || []    { listingId },
bids?.bids || []    { enabled: !!listing?.category }
bids?.bids || []  );
bids?.bids || []
bids?.bids || []  const placeBid = trpc.marketplace.placeBid.useMutation({
bids?.bids || []    onSuccess: () => {
bids?.bids || []      setBidAmount("");
bids?.bids || []      window.location.reload();
bids?.bids || []    },
bids?.bids || []  });
bids?.bids || []  const toggleWatch = trpc.marketplace.toggleWatchlist.useMutation({
bids?.bids || []    onSuccess: () => setIsWatching(!isWatching),
bids?.bids || []  });
bids?.bids || []  const payDeposit = trpc.marketplace.payDeposit.useMutation({
bids?.bids || []    onSuccess: () => setDepositPaid(true),
bids?.bids || []  });
bids?.bids || []
bids?.bids || []  if (!listing) {
bids?.bids || []    return (
bids?.bids || []      <div className="min-h-screen flex items-center justify-center">
bids?.bids || []        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
bids?.bids || []      </div>
bids?.bids || []    );
bids?.bids || []  }
bids?.bids || []
bids?.bids || []  const isAuction = listing.listingType === "auction";
bids?.bids || []  const isEnded = listing.auctionEnd ? new Date(listing.auctionEnd) < new Date() : false;
bids?.bids || []  const priceHistory = (bids || []).map((b: any, i: number) => ({ price: parseFloat(b.amount), time: i }));
bids?.bids || []
bids?.bids || []  return (
bids?.bids || []    <div className="min-h-screen py-8">
bids?.bids || []      <div className="max-w-6xl mx-auto px-4">
bids?.bids || []        {/* Breadcrumbs */}
bids?.bids || []        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
bids?.bids || []          <Link to="/marketplace" className="hover:text-primary">Marketplace</Link>
bids?.bids || []          <span>/</span>
bids?.bids || []          <span className="capitalize">{listing.category}</span>
bids?.bids || []          <span>/</span>
bids?.bids || []          <span className="truncate max-w-xs">{listing.title}</span>
bids?.bids || []        </div>
bids?.bids || []
bids?.bids || []        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
bids?.bids || []          {/* Left: Images */}
bids?.bids || []          <div className="lg:col-span-2">
bids?.bids || []            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
bids?.bids || []              {listing.images && JSON.parse(listing.images || "[]").map((img: string, i: number) => (
bids?.bids || []                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-muted border border-border/50">
bids?.bids || []                  <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
bids?.bids || []                </div>
bids?.bids || []              ))}
bids?.bids || []              {(!listing.images || JSON.parse(listing.images || "[]").length === 0) && (
bids?.bids || []                <div className="aspect-square rounded-xl bg-muted flex items-center justify-center">
bids?.bids || []                  <Tag className="w-12 h-12 text-muted-foreground/30" />
bids?.bids || []                </div>
bids?.bids || []              )}
bids?.bids || []            </div>
bids?.bids || []
bids?.bids || []            {/* Title & Description */}
bids?.bids || []            <div className="mt-6">
bids?.bids || []              <div className="flex items-center gap-2 mb-2 flex-wrap">
bids?.bids || []                <Badge variant="outline" className="capitalize">{listing.category}</Badge>
bids?.bids || []                <Badge variant="outline" className="capitalize">{listing.condition}</Badge>
bids?.bids || []                {listing.copyrightStatus === "clear" && (
bids?.bids || []                  <Badge variant="outline" className="border-green-500/30 text-green-500"><Shield className="w-3 h-3 mr-1" />Verified</Badge>
bids?.bids || []                )}
bids?.bids || []                {listing.copyrightStatus === "flagged" && (
bids?.bids || []                  <Badge variant="outline" className="border-yellow-500/30 text-yellow-500"><AlertTriangle className="w-3 h-3 mr-1" />Review</Badge>
bids?.bids || []                )}
bids?.bids || []                {isAuction && <Badge className="bg-primary text-primary-foreground"><Gavel className="w-3 h-3 mr-1" />Auction</Badge>}
bids?.bids || []              </div>
bids?.bids || []              <h1 className="text-2xl md:text-3xl font-bold">{listing.title}</h1>
bids?.bids || []              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
bids?.bids || []                <span>Listed {new Date(listing.createdAt).toLocaleDateString()}</span>
bids?.bids || []                <span>{listing.bidCount || 0} views</span>
bids?.bids || []                {isAuction && <span>{listing.bidCount} bids</span>}
bids?.bids || []              </div>
bids?.bids || []              <p className="mt-4 text-foreground whitespace-pre-wrap">{listing.description}</p>
bids?.bids || []            </div>
bids?.bids || []          </div>
bids?.bids || []
bids?.bids || []          {/* Right: Price & Actions */}
bids?.bids || []          <div className="space-y-4">
bids?.bids || []            <Card className="border-border/50 sticky top-20">
bids?.bids || []              <CardContent className="p-0">
bids?.bids || []                {/* Price */}
bids?.bids || []                <div className="bg-primary/5 p-4 text-center border-b border-primary/10">
bids?.bids || []                  {isAuction ? (
bids?.bids || []                    <>
bids?.bids || []                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
bids?.bids || []                        {isEnded ? "Final Price" : "Current Bid"}
bids?.bids || []                      </p>
bids?.bids || []                      <p className="text-4xl font-black text-primary">
bids?.bids || []                        ${format(listing.currentBid || listing.startPrice || "0")}
bids?.bids || []                      </p>
bids?.bids || []                      <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
bids?.bids || []                        <span className="flex items-center gap-1">
bids?.bids || []                          <Zap className="w-3 h-3" />{listing.bidCount || 0} bids
bids?.bids || []                        </span>
bids?.bids || []                        {listing.reservePrice && <span>Reserve: ${listing.reservePrice}</span>}
bids?.bids || []                      </div>
bids?.bids || []                      {isAuction && !isEnded && (
bids?.bids || []                        <div className="mt-2 text-sm">
bids?.bids || []                          <Clock className="w-3 h-3 inline mr-1" />
bids?.bids || []                          Ends in: <CountdownTimer endTime={listing.auctionEnd || new Date().toISOString()} />
bids?.bids || []                        </div>
bids?.bids || []                      )}
bids?.bids || []                      <PriceChart data={priceHistory} />
bids?.bids || []                    </>
bids?.bids || []                  ) : (
bids?.bids || []                    <>
bids?.bids || []                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Price</p>
bids?.bids || []                      <p className="text-4xl font-black text-primary">{format(listing.price)}</p>
bids?.bids || []                    </>
bids?.bids || []                  )}
bids?.bids || []                </div>
bids?.bids || []
bids?.bids || []                {/* Action Buttons */}
bids?.bids || []                <div className="p-4 space-y-2">
bids?.bids || []                  {isAuction && !isEnded ? (
bids?.bids || []                    <>
bids?.bids || []                      {parseFloat(listing.startPrice || "0") >= 5000 && !depositPaid && (
bids?.bids || []                        <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 mb-2">
bids?.bids || []                          <p className="text-xs text-yellow-600 mb-1">Deposit Required (5%)</p>
bids?.bids || []                          <Button className="w-full" size="sm" onClick={() => payDeposit.mutate({ listingId, amount: (parseFloat(listing.startPrice || "0") * 0.05).toString() })}>
bids?.bids || []                            Pay ${(parseFloat(listing.startPrice || "0") * 0.05).toFixed(2)} Deposit
bids?.bids || []                          </Button>
bids?.bids || []                        </div>
bids?.bids || []                      )}
bids?.bids || []                      <div className="flex gap-2">
bids?.bids || []                        <Input
bids?.bids || []                          type="number"
bids?.bids || []                          value={bidAmount}
bids?.bids || []                          onChange={(e: any) => setBidAmount(e.target.value)}
bids?.bids || []                          placeholder="Enter bid"
bids?.bids || []                          className="flex-1"
bids?.bids || []                        />
bids?.bids || []                        <Button onClick={() => placeBid.mutate({ listingId, amount: bidAmount })} disabled={!bidAmount}>
bids?.bids || []                          <Gavel className="w-4 h-4 mr-1" />Bid
bids?.bids || []                        </Button>
bids?.bids || []                      </div>
bids?.bids || []                      <div className="flex gap-1">
bids?.bids || []                        {[10, 50, 100, 500].map((inc) => (
bids?.bids || []                          <Button key={inc} variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setBidAmount((parseFloat(listing.currentBid || listing.startPrice || "0") + inc).toString())}>
bids?.bids || []                            +${inc}
bids?.bids || []                          </Button>
bids?.bids || []                        ))}
bids?.bids || []                      </div>
bids?.bids || []                    </>
bids?.bids || []                  ) : (
bids?.bids || []                    <Button className="w-full bg-primary text-lg py-6">
bids?.bids || []                      <Tag className="w-5 h-5 mr-2" />Buy Now
bids?.bids || []                    </Button>
bids?.bids || []                  )}
bids?.bids || []
bids?.bids || []                  {!isAuction && (
bids?.bids || []                    <Link to={`/profile/${listing.sellerId}`}>
bids?.bids || []                      <Button variant="outline" className="w-full">
bids?.bids || []                        <MessageSquare className="w-4 h-4 mr-1" />Contact Seller
bids?.bids || []                      </Button>
bids?.bids || []                    </Link>
bids?.bids || []                  )}
bids?.bids || []
bids?.bids || []                  <div className="flex gap-2">
bids?.bids || []                    <Button variant="outline" className="flex-1" onClick={() => toggleWatch.mutate({ listingId })}>
bids?.bids || []                      <Heart className={`w-4 h-4 mr-1 ${isWatching ? "fill-primary text-primary" : ""}`} />
bids?.bids || []                      {isWatching ? "Watching" : "Watch"}
bids?.bids || []                    </Button>
bids?.bids || []                    <Button variant="outline" className="flex-1" onClick={() => navigator.clipboard.writeText(window.location.href)}>
bids?.bids || []                      <Share2 className="w-4 h-4 mr-1" />Share
bids?.bids || []                    </Button>
bids?.bids || []                  </div>
bids?.bids || []                </div>
bids?.bids || []              </CardContent>
bids?.bids || []            </Card>
bids?.bids || []
bids?.bids || []            {/* Seller Card */}
bids?.bids || []            <Card className="border-border/50">
bids?.bids || []              <CardContent className="p-4">
bids?.bids || []                <div className="flex items-center gap-3 mb-3">
bids?.bids || []                  <Avatar className="h-10 w-10">
bids?.bids || []                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
bids?.bids || []                      {(listing.seller?.name || "U").charAt(0)}
bids?.bids || []                    </AvatarFallback>
bids?.bids || []                  </Avatar>
bids?.bids || []                  <div>
bids?.bids || []                    <p className="font-medium text-sm">{listing.seller?.name || "Seller"}</p>
bids?.bids || []                    <div className="flex items-center gap-1">
bids?.bids || []                      {[1,2,3,4,5].map((s) => (
bids?.bids || []                        <Star key={s} className={`w-3 h-3 ${s <= 4 ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
bids?.bids || []                      ))}
bids?.bids || []                      <span className="text-xs text-muted-foreground">(12)</span>
bids?.bids || []                    </div>
bids?.bids || []                  </div>
bids?.bids || []                </div>
bids?.bids || []                <div className="space-y-1 text-xs text-muted-foreground">
bids?.bids || []                  <p className="flex items-center gap-1"><Truck className="w-3 h-3" />Free shipping on orders over $50</p>
bids?.bids || []                  <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />Ships worldwide</p>
bids?.bids || []                  <p className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" />Verified seller</p>
bids?.bids || []                </div>
bids?.bids || []              </CardContent>
bids?.bids || []            </Card>
bids?.bids || []
bids?.bids || []            {/* Shipping Info */}
bids?.bids || []            <Card className="border-border/50">
bids?.bids || []              <CardContent className="p-4">
bids?.bids || []                <h3 className="font-medium text-sm mb-2">Shipping</h3>
bids?.bids || []                <div className="space-y-1 text-xs text-muted-foreground">
bids?.bids || []                  <p>Standard: 5-10 business days</p>
bids?.bids || []                  <p>Express: 2-3 business days</p>
bids?.bids || []                  <p>Returns accepted within 14 days</p>
bids?.bids || []                </div>
bids?.bids || []              </CardContent>
bids?.bids || []            </Card>
bids?.bids || []
bids?.bids || []            {/* Bid History */}
bids?.bids || []            {isAuction && bids?.bids && bids.bids.bids.length > 0 && (
bids?.bids || []              <Card className="border-border/50 overflow-hidden">
bids?.bids || []                <button
bids?.bids || []                  onClick={() => setShowAllBids(!showAllBids)}
bids?.bids || []                  className="w-full bg-muted px-4 py-3 font-semibold flex items-center justify-between text-sm"
bids?.bids || []                >
bids?.bids || []                  <span className="flex items-center gap-2">
bids?.bids || []                    <TrendingUp className="w-4 h-4" />Bid History ({bids.bids.length})
bids?.bids || []                  </span>
bids?.bids || []                  {showAllBids ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
bids?.bids || []                </button>
bids?.bids || []                {showAllBids && (
bids?.bids || []                  <div className="p-3 space-y-1 max-h-64 overflow-y-auto">
bids?.bids || []                    {bids.map((bid: any, i: number) => (
bids?.bids || []                      <div key={bid.id} className={`flex items-center justify-between p-2 rounded ${i === 0 ? "bg-primary/5 border border-primary/20" : "hover:bg-muted/50"}`}>
bids?.bids || []                        <div className="flex items-center gap-2">
bids?.bids || []                          <Avatar className="h-6 w-6">
bids?.bids || []                            <AvatarFallback className="text-[10px] bg-primary/10">
bids?.bids || []                              {(bid.bidder?.name || "U").charAt(0)}
bids?.bids || []                            </AvatarFallback>
bids?.bids || []                          </Avatar>
bids?.bids || []                          <div>
bids?.bids || []                            <p className="text-xs font-medium">{bid.bidder?.name || "User"}</p>
bids?.bids || []                            <p className="text-[10px] text-muted-foreground">{new Date(bid.createdAt).toLocaleDateString()}</p>
bids?.bids || []                          </div>
bids?.bids || []                        </div>
bids?.bids || []                        <div className="text-right">
bids?.bids || []                          <p className={`text-sm font-bold ${i === 0 ? "text-primary" : ""}`}>${bid.amount}</p>
bids?.bids || []                          {bid.isProxy && <p className="text-[10px] text-muted-foreground">auto</p>}
bids?.bids || []                        </div>
bids?.bids || []                      </div>
bids?.bids || []                    ))}
bids?.bids || []                  </div>
bids?.bids || []                )}
bids?.bids || []              </Card>
bids?.bids || []            )}
bids?.bids || []          </div>
bids?.bids || []        </div>
bids?.bids || []
bids?.bids || []        {/* Related Items */}
bids?.bids || []        {related && related.length > 0 && (
bids?.bids || []          <div className="mt-12">
bids?.bids || []            <h2 className="text-xl font-bold mb-4">Related Items</h2>
bids?.bids || []            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
bids?.bids || []              {related.map((item: any) => (
bids?.bids || []                <Link key={item.id} to={`/marketplace/${item.id}`} className="group">
bids?.bids || []                  <Card className="border-border/50 hover:border-primary/30 transition-all">
bids?.bids || []                    <CardContent className="p-3">
bids?.bids || []                      <div className="aspect-square rounded-lg bg-muted mb-2 overflow-hidden">
bids?.bids || []                        {item.images && JSON.parse(item.images)[0] ? (
bids?.bids || []                          <img src={JSON.parse(item.images)[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
bids?.bids || []                        ) : (
bids?.bids || []                          <Tag className="w-full h-full p-8 text-muted-foreground/30" />
bids?.bids || []                        )}
bids?.bids || []                      </div>
bids?.bids || []                      <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">{item.title}</p>
bids?.bids || []                      <p className="text-xs text-muted-foreground">{item.price}</p>
bids?.bids || []                    </CardContent>
bids?.bids || []                  </Card>
bids?.bids || []                </Link>
bids?.bids || []              ))}
bids?.bids || []            </div>
bids?.bids || []          </div>
bids?.bids || []        )}
bids?.bids || []      </div>
bids?.bids || []    </div>
bids?.bids || []  );
bids?.bids || []}
