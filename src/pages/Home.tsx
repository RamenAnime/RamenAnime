import { useState } from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCurrency } from "@/hooks/useCurrency";
import {
  Layers, Box, Store, Gavel, Flame, TrendingUp, ArrowRight,
  MessageCircle, Star, Clock, ShieldCheck, Zap, Globe, Heart,
} from "lucide-react";
import BetaBanner from "@/components/BetaBanner";

function getTimeLeft(endDate: string | null): string {
  if (!endDate) return "";
  const diff = new Date(endDate).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  if (d > 0) return `${d}d ${h}h left`;
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m left`;
}

const categoryCards = [
  { name: "Trading Cards", icon: Layers, path: "/cards", color: "bg-red-500/10 text-red-500" },
  { name: "3D Prints", icon: Box, path: "/prints3d", color: "bg-blue-500/10 text-blue-500" },
  { name: "Figures", icon: Star, path: "/marketplace?category=figures", color: "bg-purple-500/10 text-purple-500" },
  { name: "Apparel", icon: Heart, path: "/marketplace?category=apparel", color: "bg-pink-500/10 text-pink-500" },
  { name: "Accessories", icon: Zap, path: "/marketplace?category=accessories", color: "bg-yellow-500/10 text-yellow-500" },
  { name: "Auctions", icon: Gavel, path: "/marketplace?type=auction", color: "bg-green-500/10 text-green-500" },
];

export default function Home() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { format } = useCurrency();

  const { data: auctionItems } = trpc.marketplace.listListings.useQuery({
    listingType: "auction", limit: 6, offset: 0,
  });
  const { data: trendingItems } = trpc.marketplace.listListings.useQuery({
    sortBy: "popular", limit: 4, offset: 0,
  });
  const { data: recentItems } = trpc.marketplace.listListings.useQuery({
    limit: 4, offset: 0,
  });

  return (
    <div className="min-h-screen">
      {/* Beta tester recruitment banner */}
      <BetaBanner />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/hero-bg.jpg" alt="" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        </div>
        <div className="relative container px-4 py-24 md:py-36 md:px-6 text-center">
          <div className="mx-auto max-w-3xl space-y-6">
            <Badge variant="secondary" className="text-xs px-4 py-1.5">
              <Globe className="w-3 h-3 mr-1" /> Community Marketplace + Auctions
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gradient-gold">
              {t("hero.title")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/marketplace">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                  <Store className="mr-2 h-4 w-4" />
                  Browse Marketplace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/marketplace/new">
                <Button size="lg" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 px-8">
                  <Gavel className="mr-2 h-4 w-4" />
                  Start Selling
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 pt-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-green-500" /> Authenticity Verified</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-primary" /> Live Auctions</span>
              <span className="flex items-center gap-1"><Globe className="w-3 h-3 text-blue-500" /> Global Shipping</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-12 border-t border-border/40">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {categoryCards.map((cat) => (
              <Link key={cat.name} to={cat.path} className="group">
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 hover:bg-primary/5 transition-all">
                  <div className={`w-10 h-10 rounded-lg ${cat.color} flex items-center justify-center`}>
                    <cat.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-medium text-center group-hover:text-primary transition">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Live Auctions */}
      <section className="py-12 md:py-16 border-t border-border/40">
        <div className="container px-4 md:px-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                <Gavel className="w-6 h-6 text-primary" /> Live Auctions
              </h2>
              <p className="text-sm text-muted-foreground mt-1">Bid on rare anime collectibles in real-time</p>
            </div>
            <Link to="/marketplace?type=auction">
              <Button variant="outline" size="sm">View All <ArrowRight className="w-4 h-4 ml-1" /></Button>
            </Link>
          </div>

          {auctionItems && auctionItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {auctionItems.map((item: any) => {
                const imgs: string[] = item.images ? JSON.parse(item.images) : [];
                const timeLeft = getTimeLeft(item.auctionEnd);
                return (
                  <Link key={item.id} to={`/marketplace/${item.id}`}>
                    <Card className="border-border/50 hover:border-primary/30 transition-all overflow-hidden group">
                      <div className="relative h-44 bg-muted">
                        {imgs.length > 0 ? (
                          <img src={imgs[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                            <Layers className="w-10 h-10 text-primary/20" />
                          </div>
                        )}
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                          <Gavel className="w-3 h-3" /> Auction
                        </div>
                        {timeLeft && (
                          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {timeLeft}
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition">{item.title}</h3>
                        <div className="flex items-center justify-between mt-2">
                          <span className="font-bold text-primary text-lg">${item.currentBid || item.startPrice}</span>
                          <span className="text-xs text-muted-foreground">{item.bidCount || 0} bids</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Avatar className="h-4 w-4"><AvatarFallback className="text-[8px] bg-primary/10">{item.seller?.name?.charAt(0) || "U"}</AvatarFallback></Avatar>
                          <span>{item.seller?.name || "Seller"}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <Card className="border-border/50"><CardContent className="p-8 text-center">
              <Gavel className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">No active auctions. Be the first to list one!</p>
              <Link to="/marketplace/new" className="mt-2 inline-block">
                <Button size="sm" className="mt-2"><Gavel className="w-4 h-4 mr-1" /> Start an Auction</Button>
              </Link>
            </CardContent></Card>
          )}
        </div>
      </section>

      {/* Trending */}
      {trendingItems && trendingItems.length > 0 && (
        <section className="py-12 md:py-16 border-t border-border/40">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Flame className="w-6 h-6 text-orange-500" /> Trending Now
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Most popular items this week</p>
              </div>
              <Link to="/marketplace">
                <Button variant="outline" size="sm">Explore <ArrowRight className="w-4 h-4 ml-1" /></Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {trendingItems.map((item: any) => {
                const imgs: string[] = item.images ? JSON.parse(item.images) : [];
                return (
                  <Link key={item.id} to={`/marketplace/${item.id}`} className="group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-2">
                      {imgs.length > 0 ? (
                        <img src={imgs[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                          <TrendingUp className="w-8 h-8 text-primary/20" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition">{item.title}</p>
                    <p className="text-sm text-primary font-bold">{item.listingType === "auction" ? `Current: $${item.currentBid || item.startPrice}` : format(parseFloat(item.price || "0"))}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {recentItems && recentItems.length > 0 && (
        <section className="py-12 md:py-16 border-t border-border/40">
          <div className="container px-4 md:px-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Zap className="w-6 h-6 text-primary" /> New Arrivals
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Fresh listings from the community</p>
              </div>
              <Link to="/marketplace">
                <Button variant="outline" size="sm">See All <ArrowRight className="w-4 h-4 ml-1" /></Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {recentItems.map((item: any) => {
                const imgs: string[] = item.images ? JSON.parse(item.images) : [];
                return (
                  <Link key={item.id} to={`/marketplace/${item.id}`} className="group">
                    <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-2">
                      {imgs.length > 0 ? (
                        <img src={imgs[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
                          <Star className="w-8 h-8 text-primary/20" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-[10px] capitalize">{item.condition}</Badge>
                      <span className="text-sm text-primary font-bold">{item.listingType === "auction" ? `$${item.currentBid || item.startPrice}` : format(parseFloat(item.price || "0"))}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-12 md:py-16 border-t border-border/40">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold">Why Sell Here?</h2>
            <p className="text-muted-foreground mt-2">Built for anime collectors, by anime collectors</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Gavel, title: "Live Auctions", desc: "Real-time bidding with anti-snipe protection, proxy bids, and automatic extensions." },
              { icon: ShieldCheck, title: "Authenticity Scan", desc: "Every listing is scanned for counterfeits and copyright violations before going live." },
              { icon: Star, title: "Seller Ratings", desc: "Build your reputation with verified buyer reviews and seller level badges." },
              { icon: TrendingUp, title: "Price Negotiation", desc: "Buyers can make offers on fixed-price items. Accept, reject, or counter." },
              { icon: Globe, title: "Multi-Currency", desc: "Automatic currency detection with live exchange rates from the European Central Bank." },
              { icon: MessageCircle, title: "Community", desc: "Built-in social forum, instant messaging, and Q&A on every listing." },
              { icon: Layers, title: "All Categories", desc: "Trading cards, 3D prints, figures, apparel, accessories, manga, and more." },
              { icon: Heart, title: "Watchlist", desc: "Track auctions, get notified when outbid, and never miss an ending item." },
            ].map((f, i) => (
              <div key={i} className="p-5 rounded-xl border border-border/50 bg-card/50 hover:border-primary/30 transition-all card-glow">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-t border-border/40 bg-muted/30">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div><p className="text-3xl md:text-4xl font-black text-primary">35</p><p className="text-sm text-muted-foreground mt-1">Languages</p></div>
            <div><p className="text-3xl md:text-4xl font-black text-primary">24/7</p><p className="text-sm text-muted-foreground mt-1">Copyright Bot</p></div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 border-t border-border/40">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">Start Selling Today</h2>
            <p className="text-muted-foreground leading-relaxed">
              List your first item in under 2 minutes. Our AI helps you price competitively,
              and our copyright bot keeps the marketplace clean and authentic.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/marketplace/new">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                  <Gavel className="mr-2 h-4 w-4" /> List an Item
                </Button>
              </Link>
              <Link to="/social">
                <Button size="lg" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 px-8">
                  <MessageCircle className="mr-2 h-4 w-4" /> Join Community
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}