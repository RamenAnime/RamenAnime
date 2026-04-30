import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

const products = [
  { id: 1, name: "Anime Figure Stand", price: "$12.99", image: "/product-figure-stand.jpg", description: "Custom 3D printed display stand for anime figures. Durable PLA, multiple colors available.", },
  { id: 2, name: "Naruto Keychain", price: "$6.99", image: "/product-keychain.jpg", description: "High detail 3D printed Naruto themed keychain. Lightweight and durable.", },
  { id: 3, name: "Custom Name Plate", price: "$9.99", image: "/product-nameplate.jpg", description: "Personalized 3D printed name plate with Japanese kanji styling.", },
  { id: 4, name: "Phone Stand (Anime Edition)", price: "$8.99", image: "/product-phonestand.jpg", description: "Sleek 3D printed phone stand featuring anime-inspired wave design.", },
];

export default function Prints3D() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen py-12">
      <div className="container px-4 md:px-6">
        <Link to="/shop" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Shop
        </Link>
        <div className="text-center mb-10 space-y-4">
          <p className="text-sm font-medium text-primary tracking-wider uppercase">{t("features.prints")}</p>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{t("nav.prints3d")}</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Every piece is made to order using high-quality PLA and resin. Custom requests welcome!
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group relative rounded-xl border border-border/50 bg-card overflow-hidden hover:border-primary/30 transition-all duration-300 card-glow">
              <div className="aspect-square overflow-hidden bg-muted/20">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{product.name}</h3>
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">3D Print</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{product.description}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="font-bold text-primary">{product.price}</span>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs">{t("products.orderNow")}</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
