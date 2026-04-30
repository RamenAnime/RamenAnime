import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Store, Search, Plus, Tag, Clock, Mail, ArrowRight, User,
} from "lucide-react";

const conditions = [
  { value: "new", labelKey: "marketplace.new" },
  { value: "like_new", labelKey: "marketplace.likeNew" },
  { value: "used", labelKey: "marketplace.used" },
];

const categories = ["All", "trading-cards", "3d-prints", "figures", "manga", "accessories", "other"];

export default function Marketplace() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [newOpen, setNewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCondition, setNewCondition] = useState("new");
  const [newCategory, setNewCategory] = useState("trading-cards");
  const [newContact, setNewContact] = useState("");

  const { data: listings, isLoading } = trpc.marketplace.listListings.useQuery({
    category: activeCategory === "All" ? undefined : activeCategory,
    limit: 50,
    offset: 0,
  });

  const utils = trpc.useUtils();
  const createListing = trpc.marketplace.createListing.useMutation({
    onSuccess: () => {
      utils.marketplace.listListings.invalidate();
      setNewOpen(false);
      setNewTitle(""); setNewDesc(""); setNewPrice(""); setNewContact("");
    },
  });

  const filtered = listings?.filter(
    (l) =>
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getConditionLabel = (c: string) => {
    if (c === "new") return t("marketplace.new");
    if (c === "like_new") return t("marketplace.likeNew");
    return t("marketplace.used");
  };

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
            <Input
              placeholder={t("marketplace.search", { defaultValue: "Search listings..." })}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/50 border-border/50"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={activeCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(cat)}
              className={
                activeCategory === cat
                  ? "bg-primary text-primary-foreground capitalize"
                  : "border-border/50 text-muted-foreground hover:text-foreground capitalize"
              }
            >
              {cat}
            </Button>
          ))}
          {isAuthenticated && (
            <Dialog open={newOpen} onOpenChange={setNewOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 ml-2">
                  <Plus className="mr-1 h-4 w-4" />
                  {t("marketplace.sellItem")}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-lg">
                <DialogHeader>
                  <DialogTitle>{t("marketplace.sellItem")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Title</label>
                    <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="bg-muted/50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Description</label>
                    <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} rows={3} className="bg-muted/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Price</label>
                      <Input value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="$" className="bg-muted/50" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">Category</label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm"
                      >
                        {categories.filter(c => c !== "All").map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Condition</label>
                    <div className="flex gap-2">
                      {conditions.map((c) => (
                        <Badge
                          key={c.value}
                          variant={newCondition === c.value ? "default" : "outline"}
                          className={`cursor-pointer ${
                            newCondition === c.value ? "bg-primary text-primary-foreground" : "border-border/50"
                          }`}
                          onClick={() => setNewCondition(c.value)}
                        >
                          {t(c.labelKey)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Contact Method (email, eBay link, etc.)</label>
                    <Input value={newContact} onChange={(e) => setNewContact(e.target.value)} className="bg-muted/50" />
                  </div>
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!newTitle.trim() || !newDesc.trim() || !newPrice.trim() || createListing.isPending}
                    onClick={() =>
                      createListing.mutate({
                        title: newTitle,
                        description: newDesc,
                        price: newPrice,
                        condition: newCondition as "new" | "used" | "like_new",
                        category: newCategory,
                        contactMethod: newContact || undefined,
                      })
                    }
                  >
                    {createListing.isPending ? "Posting..." : t("marketplace.sellItem")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {!isAuthenticated && (
          <Card className="bg-card/50 border-border/50 mb-6">
            <CardContent className="p-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{t("marketplace.loginToSell", { defaultValue: "Log in to list your own items for sale." })}</p>
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
        ) : filtered && filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((listing) => (
              <Card key={listing.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 card-glow">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary capitalize">
                      {listing.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
                      {getConditionLabel(listing.condition)}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-foreground">{listing.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">{listing.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-border/30">
                    <span className="font-bold text-primary text-lg">{listing.price}</span>
                    {listing.contactMethod ? (
                      <a href={listing.contactMethod.startsWith("http") ? listing.contactMethod : `mailto:${listing.contactMethod}`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                          <Mail className="mr-1 h-4 w-4" />
                          {t("marketplace.contactSeller")}
                        </Button>
                      </a>
                    ) : (
                      <Link to={`/profile/${listing.sellerId}`}>
                        <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                          <User className="mr-1 h-4 w-4" />
                          {t("marketplace.contactSeller")}
                        </Button>
                      </Link>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={listing.seller?.avatar ?? undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px]">
                        {listing.seller?.name?.charAt(0) ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span>{listing.seller?.name ?? "User"}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-12 text-center">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium text-foreground mb-2">No listings yet</h3>
              <p className="text-sm text-muted-foreground">
                {isAuthenticated ? "Be the first to list an item for sale!" : "Log in to start selling your anime goods."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
