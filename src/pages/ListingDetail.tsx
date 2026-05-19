import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { useCurrency } from "@/hooks/useCurrency";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart, Share2, MessageSquare, Gavel, Tag, Zap,
  Clock, Shield, ChevronDown, ChevronUp, TrendingUp,
  Star, Truck, MapPin, AlertTriangle, Check, Eye,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAuctionStream } from "@/hooks/useAuctionStream";
import { useAuth } from "@/hooks/useAuth";

const isDev = import.meta.env.DEV;

function CountdownTimer({ endTime }: { endTime: string }) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const end = new Date(endTime).getTime();
    const update = () => {
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) { setTimeLeft(t("common.ended")); return; }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${days}d ${hours}h ${mins}m ${secs}s`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [endTime, t]);

  return <span className="font-mono text-lg">{timeLeft}</span>;
}

function PriceChart({ data }: { data: any[] }) {
  const { t } = useTranslation();
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.price));
  return (
    <div className="mt-3 space-y-1">
      <p className="text-xs text-muted-foreground">{t("listing.priceHistory")}</p>
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
  const [searchParams] = useSearchParams();
  const listingId = parseInt(id ?? "0");
  const { format } = useCurrency();
  const { t } = useTranslation();
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [bidAmount, setBidAmount] = useState("");
  const [showAllBids, setShowAllBids] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [depositPaid, setDepositPaid] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<{id: number; orderNumber: string} | null>(null);
  const [proxyMax, setProxyMax] = useState("");

  const { data: listing } = trpc.marketplace.getListing.useQuery(
    { id: listingId },
    { enabled: listingId > 0 }
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

  const isAuctionListing = listing?.listingType === "auction";
  const stream = useAuctionStream(listingId, !!listing && isAuctionListing && !!listing.isActive);

  const displayBid = stream.currentBid ?? listing?.currentBid ?? listing?.startPrice ?? "0";
  const displayBidCount = stream.bidCount ?? listing?.bidCount ?? 0;
  const displayAuctionEnd = stream.auctionEnd ?? listing?.auctionEnd;

  const { data: depositInfo } = trpc.marketplace.getDepositInfo.useQuery(
    { listingId },
    { enabled: !!user && listingId > 0 && isAuctionListing }
  );

  const { data: liveViewers } = trpc.swarm.listingViewers.useQuery(
    { listingId },
    { enabled: listingId > 0, refetchInterval: 5000 }
  );

  const setAutoBid = trpc.marketplace.setAutoBid.useMutation({
    onSuccess: (data) => {
      setProxyMax("");
      if (data.won && data.orderId) {
        setCreatedOrder({ id: data.orderId, orderNumber: data.orderNumber || "" });
      }
      utils.marketplace.getListing.invalidate({ id: listingId });
      utils.marketplace.getBidHistory.invalidate({ listingId });
      toast.success(data.won ? data.message || t("listing.paymentSuccess") : t("listing.autoBidSet"));
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (searchParams.get("payment") === "success") {
      toast.success(t("listing.paymentSuccess"));
      utils.order.getByListing.invalidate({ listingId });
      utils.marketplace.getListing.invalidate({ id: listingId });
    }
    if (searchParams.get("deposit") === "success") {
      toast.success(t("listing.depositSecured"));
      setDepositPaid(true);
      utils.marketplace.getDepositInfo.invalidate({ listingId });
    }
  }, [searchParams, listingId, utils]);

  useEffect(() => {
    if (depositInfo?.held) setDepositPaid(true);
  }, [depositInfo?.held]);

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
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      if (data.alreadyPaid) setDepositPaid(true);
    },
    onError: (err) => toast.error(err.message),
  });
  const markPaid = trpc.order.markPaid.useMutation({
    onSuccess: () => {
      toast.success(t("listing.orderMarkedPaid"));
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
      toast.error(t("listing.sellerNotReadyBuy"));
      return;
    }
    stripeCheckout.mutate({ listingId });
  };

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const isAuction = listing.listingType === "auction";
  const isEnded = displayAuctionEnd ? new Date(displayAuctionEnd) < new Date() : false;
  let itemSpecifics: Record<string, string> | null = null;
  if (listing.itemSpecifics) {
    try {
      itemSpecifics =
        typeof listing.itemSpecifics === "string"
          ? JSON.parse(listing.itemSpecifics)
          : (listing.itemSpecifics as Record<string, string>);
    } catch {
      itemSpecifics = null;
    }
  }
  const priceHistory = (bids?.bids || []).map((b: any, i: number) => ({ price: parseFloat(b.amount), time: i }));

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/marketplace" className="hover:text-primary">{t("listing.marketplaceBreadcrumb")}</Link>
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
                  <Badge variant="outline" className="border-green-500/30 text-green-500"><Shield className="w-3 h-3 mr-1" />{t("common.verified")}</Badge>
                )}
                {listing.copyrightStatus === "flagged" && (
                  <Badge variant="outline" className="border-yellow-500/30 text-yellow-500"><AlertTriangle className="w-3 h-3 mr-1" />{t("listing.review")}</Badge>
                )}
                {isAuction && <Badge className="bg-primary text-primary-foreground"><Gavel className="w-3 h-3 mr-1" />{t("listing.auction")}</Badge>}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold">{listing.title}</h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>{t("listing.listedOn", { date: new Date(listing.createdAt).toLocaleDateString() })}</span>
                <span>{t("listing.bidsCount", { count: listing.bidCount || 0 })}</span>
                {(liveViewers?.count ?? 0) > 0 && (
                  <span className="flex items-center gap-1 text-primary">
                    <Eye className="w-3.5 h-3.5" />
                    {t("listing.viewingNow", { count: liveViewers!.count })}
                  </span>
                )}
              </div>
              <p className="mt-4 text-foreground whitespace-pre-wrap">{listing.description}</p>
              {listing.authenticityDeclared && (
                <p className="mt-2 text-sm text-green-600 flex items-center gap-1">
                  <Shield className="w-4 h-4" /> {t("listing.authenticityDeclared")}
                </p>
              )}
              {itemSpecifics && Object.keys(itemSpecifics).length > 0 && (
                <div className="mt-3 text-sm border border-border/50 rounded-lg p-3 space-y-1">
                  {Object.entries(itemSpecifics).map(([k, v]) => (
                    <p key={k}><span className="text-muted-foreground">{k}:</span> {v}</p>
                  ))}
                </div>
              )}
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
                        {isEnded ? t("listing.finalPrice") : t("listing.current_bid")}
                      </p>
                      <p className="text-4xl font-black text-primary">
                        {format(displayBid)}
                      </p>
                      {stream.connected && (
                        <p className="text-[10px] text-green-600 mt-1">{t("listing.liveUpdates")}</p>
                      )}
                      <div className="flex items-center justify-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />{t("listing.bidsCount", { count: displayBidCount })}
                        </span>
                        {listing.reservePrice && <span>{t("listing.reserve", { price: listing.reservePrice })}</span>}
                      </div>
                      {isAuction && !isEnded && (
                        <div className="mt-2 text-sm">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {t("listing.ends_in")}: <CountdownTimer endTime={String(displayAuctionEnd || new Date().toISOString())} />
                        </div>
                      )}
                      <PriceChart data={priceHistory} />
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{t("listing.priceLabel")}</p>
                      <p className="text-4xl font-black text-primary">{format(listing.price)}</p>
                    </>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="p-4 space-y-2">
                  {isAuction && !isEnded ? (
                    <>
                      {depositInfo?.isRequired && !depositPaid && !depositInfo?.held && (
                        <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20 mb-2">
                          <p className="text-xs text-yellow-600 mb-1">{t("listing.depositRequired")}</p>
                          <Button className="w-full" size="sm" disabled={payDeposit.isPending} onClick={() => payDeposit.mutate({ listingId })}>
                            {payDeposit.isPending ? t("listing.processing") : t("listing.payDepositAmount", { amount: (parseFloat(listing.startPrice || "0") * 0.05).toFixed(2) })}
                          </Button>
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={bidAmount}
                          onChange={(e: any) => setBidAmount(e.target.value)}
                          placeholder={t("listing.enterBid")}
                          className="flex-1"
                        />
                        <Button onClick={() => placeBid.mutate({ listingId, amount: bidAmount, proxyMax: proxyMax || undefined })} disabled={!bidAmount || placeBid.isPending}>
                          {placeBid.isPending ? t("listing.bidding") : <><Gavel className="w-4 h-4 mr-1" />{t("listing.bid")}</>}
                        </Button>
                      </div>
                      <div className="flex gap-2 items-center">
                        <Input type="number" value={proxyMax} onChange={(e) => setProxyMax(e.target.value)} placeholder={t("listing.autoBidMaxPlaceholder")} className="flex-1 text-sm" />
                        <Button variant="secondary" size="sm" disabled={!proxyMax || setAutoBid.isPending} onClick={() => setAutoBid.mutate({ listingId, maxAmount: proxyMax })}>{t("listing.autoBid")}</Button>
                      </div>
                      <div className="flex gap-1">
                        {[10, 50, 100, 500].map((inc) => (
                          <Button key={inc} variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setBidAmount((parseFloat(displayBid) + inc).toString())}>
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
                      {stripeCheckout.isPending ? t("listing.redirecting") : t("marketplace.buyNow")}
                    </Button>
                  )}

                  {!isAuction && (
                    <Link to={`/profile/${listing.sellerId}`}>
                      <Button variant="outline" className="w-full">
                        <MessageSquare className="w-4 h-4 mr-1" />{t("listing.contact_seller")}
                      </Button>
                    </Link>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => toggleWatch.mutate({ listingId })}>
                      <Heart className={`w-4 h-4 mr-1 ${isWatching ? "fill-primary text-primary" : ""}`} />
                      {isWatching ? t("listing.watching") : t("listing.watch")}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => navigator.clipboard.writeText(window.location.href)}>
                      <Share2 className="w-4 h-4 mr-1" />{t("listing.share")}
                    </Button>
                  </div>

                  {/* Payment Section - Show when user has pending order */}
                  {(createdOrder || (myOrder && myOrder.status === "pending")) && (
                    <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg border border-yellow-500/20 space-y-3">
                      <p className="text-sm font-semibold text-yellow-600">{t("listing.paymentRequired")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("listing.orderLabel", { number: createdOrder?.orderNumber || myOrder?.orderNumber || "" })}
                      </p>
                      {(() => {
                        const amount = parseFloat(listing.currentBid || listing.price || "0");
                        const platformFee = amount * 0.05;
                        const sellerReceives = amount - platformFee;
                        return (
                          <>
                            <div className="space-y-1 text-xs">
                              <p className="flex justify-between font-semibold text-foreground text-sm">
                                <span>{t("listing.total")}</span>
                                <span>${amount.toFixed(2)}</span>
                              </p>
                              <div className="pt-1 border-t border-yellow-500/20 space-y-1 text-muted-foreground">
                                <p className="flex justify-between">
                                  <span>{t("listing.platformFee")}</span>
                                  <span>${platformFee.toFixed(2)}</span>
                                </p>
                                <p className="flex justify-between">
                                  <span>{t("listing.sellerReceives")}</span>
                                  <span>${sellerReceives.toFixed(2)}</span>
                                </p>
                              </div>
                            </div>
                            {!sellerCanAcceptPayments ? (
                              <p className="text-xs text-red-500 text-center">
                                {t("listing.sellerNotReady")}
                              </p>
                            ) : (
                              <Button
                                className="w-full bg-primary"
                                onClick={() => stripeCheckout.mutate({ listingId })}
                                disabled={stripeCheckout.isPending}
                              >
                                {stripeCheckout.isPending ? t("listing.redirecting") : t("listing.payWithCard")}
                              </Button>
                            )}
                          </>
                        );
                      })()}
                      {isDev && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-dashed"
                          onClick={() => markPaid.mutate({ orderId: createdOrder?.id || myOrder?.id || 0 })}
                          disabled={markPaid.isPending}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          {markPaid.isPending ? t("listing.confirming") : t("listing.markPaidDev")}
                        </Button>
                      )}
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
                        {myOrder.status === "paid" && t("listing.paymentAwaitingShipment")}
                        {myOrder.status === "shipped" && t("listing.shippedTracking", { tracking: myOrder.trackingNumber || t("listing.shippedTrackingFallback") })}
                        {myOrder.status === "delivered" && t("listing.deliveredThanks")}
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
                      <span className="text-xs text-muted-foreground">{t("listing.ratingCount", { count: 12 })}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {listing.shippingCost && (
                    <p className="flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      {t("listing.shippingEstimate")}: {format(listing.shippingCost)}
                    </p>
                  )}
                  {listing.packageSize && <p className="flex items-center gap-1"><MapPin className="w-3 h-3" />{listing.packageSize}</p>}
                  <p className="flex items-center gap-1"><Check className="w-3 h-3 text-green-500" />{t("listing.verified_seller")}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardContent className="p-4">
                <h3 className="font-medium text-sm mb-2">{t("listing.shipping")}</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {listing.shippingCost ? (
                    <p>{format(listing.shippingCost)} - {listing.shippingPayer === "seller" ? t("listing.sellerPays") : t("listing.buyerPays")}</p>
                  ) : (
                    <p>{t("listing.contactForQuote")}</p>
                  )}
                  <p>{t("listing.paymentDeadline")}</p>
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
                    <TrendingUp className="w-4 h-4" />{t("listing.bidHistoryCount", { count: bids.bids.length })}
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
                            <p className="text-xs font-medium">{bid.bidder?.name || t("common.user")}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(bid.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-bold ${i === 0 ? "text-primary" : ""}`}>${bid.amount}</p>
                          {bid.isProxy && <p className="text-[10px] text-muted-foreground">{t("common.auto")}</p>}
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
            <h2 className="text-xl font-bold mb-4">{t("listing.related_items")}</h2>
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
