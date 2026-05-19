import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { useCurrency } from "@/hooks/useCurrency";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart, Share2, MessageSquare, Gavel, Tag, Zap,
  Clock, Shield, ChevronDown, ChevronUp, TrendingUp,
  Star, Truck, MapPin, AlertTriangle, Check,
} from "lucide-react";
import { toast } from "sonner";

function CountdownTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const end = new Date(endTime).getTime();
    const update = () => {
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) { setTimeLeft("Ended"); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endTime]);

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
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const listingId = parseInt(id ?? "0");
  const { format } = useCurrency();
  const utils = trpc.useUtils();
  const [bidAmount, setBidAmount] = useState("");
  const [showAllBids, setShowAllBids] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [depositPaid, setDepositPaid] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<{id: number; orderNumber: string} | null>(null);

  const { data: listing, isLoading: listingLoading, isError: listingError } = trpc.marketplace.getListing.useQuery(
    { id: listingId },
    { enabled: listingId > 0, retry: false }
  );
  const { data: bids } = trpc.marketplace.getBidHistory.useQuery(
    { listingId },
    { enabled: listingId > 0 }
  );
  const { data: related } = trpc.marketplace.relatedItems.useQuery(
    { listingId },
    { enabled: listingId > 0 }
  );
  const { data: myOrder } = trpc.order.getByListing.useQuery(
    { listingId },
    { enabled: listingId > 0 }
  );
  const sellerCanAcceptPayments = !!(listing as { sellerPaymentReady?: boolean } | undefined)?.sellerPaymentReady;

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      toast.success("Payment received. Thank you for your purchase on Ramen Anime.");
      utils.order.getByListing.invalidate({ listingId });
      utils.marketplace.getListing.invalidate({ id: listingId });
    }
  }, [searchParams, listingId, utils]);

  const placeBid = trpc.marketplace.placeBid.useMutation({
    onSuccess: (data) => {
      setBidAmount("");
      if (data.won && data.orderId) {
        setCreatedOrder({ id: data.orderId, orderNumber: data.orderNumber || "" });
        utils.marketplace.getListing.invalidate({ id: listingId });
        utils.order.getByListing.invalidate({ listingId });
      } else {
        utils.marketplace.getListing.invalidate({ id: listingId });
        utils.marketplace.getBidHistory.invalidate({ listingId });
      }
    },
    onError: (err) => toast.error(err.message),
  });
  const toggleWatch = trpc.marketplace.toggleWatchlist.useMutation({
    onSuccess: () => setIsWatching(!isWatching),
  });
  const payDeposit = trpc.marketplace.payDeposit.useMutation({
    onSuccess: () => setDepositPaid(true),
  });
  const markPaid = trpc.order.markPaid.useMutation({
    onSuccess: () => {
      toast.success("Order marked as paid");
      utils.order.getByListing.invalidate({ listingId });
    },
  });
  const stripeCheckout = trpc.stripe.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data?.url) window.location.href = data.url;
    },
    onError: (err) => toast.error(err.message),
  });

  const handleBuyNow = () => {
    if (!sellerCanAcceptPayments) {
      toast.error(t("listing.sellerNotReadyBuy", { defaultValue: "This seller has not finished payment setup yet." }));
      return;
    }
    stripeCheckout.mutate({ listingId });
  };

  if (listingId === 0 || listingLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!listing || listingError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 px-4">
          <p className="text-2xl font-bold text-foreground">Listing Not Found</p>
          <p className="text-muted-foreground">This listing may have been removed or doesn\'t exist.</p>
          <a href="/marketplace" className="inline-flex items-center gap-2 text-primary hover:underline">← Back to Marketplace</a>
        </div>
      </div>
    );
  }

  const isAuction = listing.listingType === "auction";
  const isEnded = listing.auctionEnd ? new Date(listing.auctionEnd) < new Date() : false;
  const priceHistory = (bids?.bids || []).map((b: any, i: number) => ({ price: parseFloat(b.amount), time: i }));

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
                <span>{listing.bidCount || 0} bids</span>
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
                        {isEnded ? "Final Price" : t("listing.current_bid")}
                      </p>
                      <p className="text-4xl font-black text-primary">
                        {format(listing.currentBid || listing.startPrice || "0")}
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
                          <Button className="w-full" size="sm" disabled={payDeposit.isPending} onClick={() => payDeposit.mutate({ listingId })}>
                            {payDeposit.isPending ? "Processing..." : `Pay ${(parseFloat(listing.startPrice || "0") * 0.05).toFixed(2)} Deposit`}
                          </Button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={bidAmount}
                          onChange={(e: any) => setBidAmount(e.target.value)}
                          placeholder="Enter bid"
                          className="flex-1"
                        />
                        <Button onClick={() => placeBid.mutate({ listingId, amount: bidAmount })} disabled={!bidAmount || placeBid.isPending}>
                          {placeBid.isPending ? "Bidding..." : <><Gavel className="w-4 h-4 mr-1" />Bid</>}
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
                    <Button
                      className="w-full bg-primary text-lg py-6"
                      disabled={stripeCheckout.isPending || !listing.isActive}
                      onClick={handleBuyNow}
                    >
                      <Tag className="w-5 h-5 mr-2" />
                      {stripeCheckout.isPending ? "Redirecting..." : "Buy Now"}
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

                  {/* Payment Section - Show when user has pending order */}
                  {(createdOrder || (myOrder && myOrder.status === "pending")) && (
                    <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20 space-y-3">
                      <p className="text-sm font-semibold text-yellow-600">Payment Required</p>
                      <p className="text-xs text-muted-foreground">
                        Order: {createdOrder?.orderNumber || myOrder?.orderNumber}
                      </p>
                      {(() => {
                        const amount = parseFloat(listing.currentBid || listing.price || "0");
                        const platformFee = amount * 0.05;
                        const sellerReceives = amount - platformFee;
                        return (
                          <>
                            <div className="space-y-1 text-xs">
                              <p className="flex justify-between font-semibold text-foreground text-sm">
                                <span>Total:</span>
                                <span>${amount.toFixed(2)}</span>
                              </p>
                              <div className="pt-1 border-t border-yellow-500/20 space-y-1 text-muted-foreground">
                                <p className="flex justify-between">
                                  <span>Platform fee:</span>
                                  <span>${platformFee.toFixed(2)}</span>
                                </p>
                                <p className="flex justify-between">
                                  <span>Seller receives:</span>
                                  <span>${sellerReceives.toFixed(2)}</span>
                                </p>
                              </div>
                            </div>
                            {!sellerCanAcceptPayments ? (
                              <p className="text-xs text-red-500 text-center">
                                Seller has not set up payment processing yet
                              </p>
                            ) : (
                              <Button
                                className="w-full bg-primary"
                                onClick={() => stripeCheckout.mutate({ listingId })}
                                disabled={stripeCheckout.isPending}
                              >
                                {stripeCheckout.isPending ? "Redirecting..." : "Pay with Card (Stripe)"}
                              </Button>
                            )}
                          </>
                        );
                      })()}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => markPaid.mutate({ orderId: createdOrder?.id || myOrder?.id || 0 })}
                        disabled={markPaid.isPending}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {markPaid.isPending ? "Confirming..." : "I Have Paid"}
                      </Button>
                    </div>
                  )}

                  {/* Order Status - Show when paid */}
                  {myOrder && myOrder.status !== "pending" && (
                    <div className={`mt-4 p-3 rounded-lg border text-center ${
                      myOrder.status === "paid" ? "bg-green-500/10 border-green-500/20" :
                      myOrder.status === "shipped" ? "bg-blue-500/10 border-blue-500/20" :
                      "bg-muted border-border/50"
                    }`}>
                      <p className="text-sm font-semibold">
                        {myOrder.status === "paid" && "Payment Received - Awaiting Shipment"}
                        {myOrder.status === "shipped" && "Shipped - " + (myOrder.trackingNumber || "Tracking info available")}
                        {myOrder.status === "delivered" && "Delivered - Thank you!"}
                      </p>
                    </div>
                  )}
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
                    <p className="font-medium text-sm">{listing.seller?.name || t("listing.seller")}</p>
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
            {isAuction && bids?.bids && bids.bids.length > 0 && (
              <Card className="border-border/50 overflow-hidden">
                <button
                  onClick={() => setShowAllBids(!showAllBids)}
                  className="w-full bg-muted px-4 py-3 font-semibold flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />Bid History ({bids.bids.length})
                  </span>
                  {showAllBids ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {showAllBids && (
                  <div className="p-3 space-y-1 max-h-64 overflow-y-auto">
                    {bids.bids.map((bid: any, i: number) => (
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
