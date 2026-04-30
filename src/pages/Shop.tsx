import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const allProducts = [
  { id: 1, name: "Anime Figure Stand", category: "3D Prints", price: "$12.99", image: "/product-figure-stand.jpg", description: "Custom 3D printed display stand for anime figures. Durable PLA, multiple colors available.", },
  { id: 2, name: "Naruto Keychain", category: "3D Prints", price: "$6.99", image: "/product-keychain.jpg", description: "High detail 3D printed Naruto themed keychain. Lightweight and durable.", },
  { id: 3, name: "Custom Name Plate", category: "3D Prints", price: "$9.99", image: "/product-nameplate.jpg", description: "Personalized 3D printed name plate with Japanese kanji styling.", },
  { id: 4, name: "Phone Stand (Anime Edition)", category: "3D Prints", price: "$8.99", image: "/product-phonestand.jpg", description: "Sleek 3D printed phone stand featuring anime-inspired wave design.", },
  { id: 5, name: "Pokémon Card Lots", category: "Trading Cards", price: "From $9.99", image: "/product-pokemon.jpg", description: "Bulk Pokémon card lots, various sets. Great for collectors and players.", ebay: true },
  { id: 6, name: "One Piece Card Game", category: "Trading Cards", price: "From $4.99", image: "/product-onepiece.jpg", description: "One Piece TCG singles and packs. Ships fast and securely.", ebay: true },
  { id: 7, name: "Dragon Ball Super Cards", category: "Trading Cards", price: "From $3.99", image: "/product-dbz.jpg", description: "DBS card singles and sets. Anime fans' favorite.", ebay: true },
  { id: 8, name: "Naruto Collectible Cards", category: "Trading Cards", price: "From $5.99", image: "/product-naruto-cards.jpg", description: "Rare and common Naruto collectible cards. Perfect for Naruto fans.", ebay: true },
  { id: 9, name: "Yu-Gi-Oh! Cards", category: "Trading Cards", price: "From $4.99", image: "/product-yugioh.jpg", description: "Yu-Gi-Oh! TCG singles and lots. Blue-Eyes White Dragon, Dark Magician & more.", ebay: true },
];

const categories = ["All Products", "3D Prints", "Trading Cards"];

export default function Shop() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState("All Products");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = allProducts.filter((p) => {
    const matchesCategory = activeCategory === "All Products" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen py-12">
      <div className="container px-4 md:px-6">
        <div className="text-center mb-10 space-y-4">
          <p className="text-sm font-medium text-primary tracking-wider uppercase">{t("products.title")}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{t("products.subtitle")}</h1>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t("marketplace.search")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-muted/50 border-border/50" />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <Button key={cat} variant={activeCategory === cat ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(cat)} className={activeCategory === cat ? "bg-primary text-primary-foreground" : "border-border/50 text-muted-foreground hover:text-foreground"}>
              {cat}
            </Button>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <div key={product.id} className="group relative rounded-xl border border-border/50 bg-card overflow-hidden hover:border-primary/30 transition-all duration-300 card-glow">
              <div className="aspect-square overflow-hidden bg-muted/20">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{product.name}</h3>
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">{product.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-bold text-primary">{product.price}</span>
                  {product.ebay ? (
                    <a href="https://ebay.com" target="_blank" rel="noopener noreferrer">
                      <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 text-xs">{t("products.viewOnEbay")}</Button>
                    </a>
                  ) : (
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs">{t("products.orderNow")}</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No products found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
