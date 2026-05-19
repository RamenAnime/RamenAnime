import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Box, Search, Plus, Tag, Gavel, Clock, ArrowLeft, ImageIcon, Loader2,
} from "lucide-react";

export default function Prints3D() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [search, setSearch] = useState("");

  const { data: listings, isLoading } = trpc.marketplace.listListings.useQuery({
    category: "3d-prints",
    search: search || undefined,
    listingType: "all",
    limit: 50,
    offset: 0,
  });

  return (
    <div className="min-h-screen py-12">
      <div className="container px-4 md:px-6">
        <Link to="/marketplace" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" /> {t("prints3d.backMarketplace")}
        </Link>

        <div className="text-center mb-10 space-y-4">
          <p className="text-sm font-medium text-primary tracking-wider uppercase">{t("features.prints")}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center justify-center gap-3">
            <Box className="h-8 w-8 text-primary" />
            {t("nav.prints3d")}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t("prints3d.subtitle")}
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("prints3d.searchPlaceholder")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-muted/50" />
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 mb-6">
          {isAuthenticated && (
            <Link to="/marketplace/create">
              <Button size="sm" className="bg-primary">
                <Plus className="mr-1 h-4 w-4" /> {t("prints3d.sellPrints")}
              </Button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : listings && listings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((listing: any) => {
              const imgs: string[] = listing.images ? JSON.parse(listing.images) : [];
              const isAuction = listing.listingType === "auction";
              return (
                <Link key={listing.id} to={`/marketplace/${listing.id}`}>
                  <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 card-glow overflow-hidden h-full">
                    {imgs.length > 0 ? (
                      <div className="relative aspect-square bg-muted">
                        <img src={imgs[0]} alt={listing.title} className="w-full h-full object-cover" />
                        {imgs.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                            {t("prints3d.photosCount", { count: imgs.length })}
                          </div>
                        )}
                        {isAuction && (
                          <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                            <Gavel className="w-3 h-3" /> {t("common.auction")}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs capitalize">{listing.condition}</Badge>
                        {listing.copyrightStatus === "clear" && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-300">{t("common.verified")}</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground line-clamp-2">{listing.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{listing.description}</p>
                      <div className="pt-2 border-t border-border/30">
                        {isAuction ? (
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-primary text-lg">${listing.currentBid || listing.startPrice}</span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {t("listing.bidsCount", { count: listing.bidCount || 0 })}
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-primary text-lg">{listing.price}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="bg-primary/10 text-primary text-[10px]">{listing.seller?.name?.charAt(0) ?? "U"}</AvatarFallback>
                        </Avatar>
                        <span>{listing.seller?.name ?? t("common.user")}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-12 text-center">
              <Box className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium mb-2">{t("prints3d.emptyTitle")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {isAuthenticated ? t("prints3d.emptyAuthShort") : t("prints3d.loginToSell")}
              </p>
              {isAuthenticated && (
                <Link to="/marketplace/create">
                  <Button><Plus className="mr-1 h-4 w-4" /> {t("prints3d.listPrints")}</Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}