import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

const products = [
  { id: 5, name: "Pokémon Card Lots", price: "From $9.99", image: "/product-pokemon.jpg", description: "Bulk Pokémon card lots, various sets. Great for collectors and players.", },
  { id: 6, name: "One Piece Card Game", price: "From $4.99", image: "/product-onepiece.jpg", description: "One Piece TCG singles and packs. Ships fast and securely.", },
  { id: 7, name: "Dragon Ball Super Cards", price: "From $3.99", image: "/product-dbz.jpg", description: "DBS card singles and sets. Anime fans' favorite.", },
  { id: 8, name: "Naruto Collectible Cards", price: "From $5.99", image: "/product-naruto-cards.jpg", description: "Rare and common Naruto collectible cards. Perfect for Naruto fans.", },
  { id: 9, name: "Yu-Gi-Oh! Cards", price: "From $4.99", image: "/product-yugioh.jpg", description: "Yu-Gi-Oh! TCG singles and lots. Blue-Eyes White Dragon, Dark Magician & more.", },
];

export default function TradingCards() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen py-12">
      <div className="container px-4 md:px-6">
        <Link to="/shop" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Shop
        </Link>
        <div className="text-center mb-10 space-y-4">
          <p className="text-sm font-medium text-primary tracking-wider uppercase">{t("features.cards")}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{t("nav.cards")}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Curated trading card collections. All cards are verified authentic and shipped with protective sleeves.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group relative rounded-xl border border-border/50 bg-card overflow-hidden hover:border-primary/30 transition-all duration-300 card-glow">
              <div className="aspect-square overflow-hidden bg-muted/20">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{product.name}</h3>
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">Cards</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{product.description}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-bold text-primary">{product.price}</span>
                  <a href="https://ebay.com" target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 text-xs">{t("products.viewOnEbay")}</Button>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
