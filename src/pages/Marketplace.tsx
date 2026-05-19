import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Store, Search, Plus, Tag, Clock, ArrowRight, Gavel,
  ShieldCheck, ImageIcon, Filter,
} from "lucide-react";

function formatTimeLeft(
  endDate: string | null,
  t: (key: string) => string
): string {
  if (!endDate) return "";
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return t("marketplace.ended");
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  if (d > 0) return `${d}d ${h}h left`;
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m left`;
}

const categorySlugs = ["All", "trading-cards", "3d-prints", "figures", "apparel", "accessories", "other"] as const;

export default function Marketplace() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { format } = useCurrency();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [listingType, setListingType] = useState<"all" | "fixed" | "auction">("all");
  const trackSearch = trpc.analytics.trackSearch.useMutation();
  const swarmPulse = trpc.swarm.pulse.useMutation();
  const lastSearchTracked = useRef("");

  const formatPrice = (amount: string | number | null | undefined) =>
    format(parseFloat(String(amount ?? "0")));

  const { data: listings, isLoading } = trpc.marketplace.listListings.useQuery({
    category: activeCategory === "All" ? undefined : activeCategory,
    listingType,
    search: searchQuery || undefined,
    limit: 50,
    offset: 0,
  });

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2 || q === lastSearchTracked.current) return;
    const timer = setTimeout(() => {
      lastSearchTracked.current = q;
      trackSearch.mutate({
        query: q,
        category: activeCategory === "All" ? undefined : activeCategory,
        resultsCount: listings?.length ?? 0,
      });
      const sid = sessionStorage.getItem("ramen_analytics_session");
      if (sid) {
        swarmPulse.mutate({
          sessionId: sid,
          pagePath: window.location.pathname,
          searchQuery: q,
          category: activeCategory === "All" ? undefined : activeCategory,
        });
      }
    }, 700);
    return () => clearTimeout(timer);
  }, [searchQuery, activeCategory, listings?.length]);

  const categoryLabel = (cat: string) =>
    cat === "All" ? t("marketplace.categories.all") : t(`marketplace.categories.${cat}`, { defaultValue: cat });

  return (
    <div className="min-h-screen py-12">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-10 space-y-4">
          <p className="text-sm font-medium text-primary tracking-wider uppercase">{t("marketplace.subtitle")}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center justify-center gap-3">
            <Store className="h-8 w-8 text-primary" />
            {t("marketplace.title")}
          </h1>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("marketplace.search")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-muted/50 border-border/50" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
          {categorySlugs.map((cat) => (
            <Button key={cat} variant={activeCategory === cat ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(cat)} className={activeCategory === cat ? "" : "border-border/50 text-muted-foreground hover:text-foreground"}>
              {categoryLabel(cat)}
            </Button>
          ))}
        </div>

        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(["all", "fixed", "auction"] as const).map((type) => (
              <button key={type} onClick={() => setListingType(type)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${listingType === type ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {type === "all" ? <Filter className="w-3 h-3 inline mr-1" /> : type === "fixed" ? <Tag className="w-3 h-3 inline mr-1" /> : <Gavel className="w-3 h-3 inline mr-1" />}
                {type === "all" ? t("marketplace.filterAll") : type === "fixed" ? t("marketplace.buyNow") : t("marketplace.auctions")}
              </button>
            ))}
          </div>
          {isAuthenticated && (
            <Link to="/marketplace/new">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-1 h-4 w-4" />
                {t("marketplace.sellItem")}
              </Button>
            </Link>
          )}
        </div>

        {!isAuthenticated && (
          <Card className="bg-card/50 border-border/50 mb-6">
            <CardContent className="p-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{t("marketplace.loginToSell")}</p>
              <Link to="/login">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <ArrowRight className="mr-1 h-4 w-4" />
                  {t("nav.login")}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-card/50 border-border/50 animate-pulse">
                <CardContent className="p-6 h-48" />
              </Card>
            ))}
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => {
              const imgs: string[] = listing.images ? JSON.parse(listing.images) : [];
              const timeLeft = formatTimeLeft(listing.auctionEnd ?? null, t);
              const isAuction = listing.listingType === "auction";
              return (
                <Card key={listing.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 card-glow overflow-hidden">
                  {imgs.length > 0 ? (
                    <div className="relative h-48 bg-muted">
                      <img src={imgs[0]} alt={listing.title} className="w-full h-full object-cover" />
                      {imgs.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> {imgs.length}
                        </div>
                      )}
                      {isAuction && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Gavel className="w-3 h-3" /> {t("marketplace.auction")}
                        </div>
                      )}
                      {listing.copyrightStatus === "clear" && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 bg-muted flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}

                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs border-primary/30 text-primary capitalize">{listing.category}</Badge>
                      <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">{listing.condition}</Badge>
                    </div>

                    <Link to={`/marketplace/${listing.id}`}>
                      <h3 className="font-semibold text-foreground hover:text-primary transition line-clamp-2">{listing.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>

                    <div className="pt-2 border-t border-border/30">
                      {isAuction ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary text-lg">
                              {formatPrice(listing.currentBid || listing.startPrice)}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Gavel className="w-3 h-3" /> {t("marketplace.bids", { count: listing.bidCount || 0 })}
                            </span>
                          </div>
                          {timeLeft && (
                            <div className="flex items-center gap-1 text-xs text-orange-500">
                              <Clock className="w-3 h-3" /> {timeLeft}
                            </div>
                          )}
                          {listing.buyNowPrice && (
                            <p className="text-xs text-muted-foreground">
                              {t("marketplace.buyNowPrice", { price: formatPrice(listing.buyNowPrice) })}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary text-lg">{formatPrice(listing.price)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{listing.seller?.name?.charAt(0) ?? "U"}</AvatarFallback>
                      </Avatar>
                      <span>{listing.seller?.name ?? t("marketplace.seller")}</span>
                      <span>&middot;</span>
                      <span>{new Date(listing.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-2">{t("marketplace.noListings")}</h3>
              <p className="text-sm text-muted-foreground">
                {isAuthenticated ? t("marketplace.noListingsAuth") : t("marketplace.noListingsGuest")}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
