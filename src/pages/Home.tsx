import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, CreditCard, Truck, Star, ArrowRight, MessageCircle, Mail } from "lucide-react";

const features = [
  { icon: Printer, titleKey: "features.prints", descKey: "features.printsDesc" },
  { icon: CreditCard, titleKey: "features.cards", descKey: "features.cardsDesc" },
  { icon: Truck, titleKey: "features.shipping", descKey: "features.shippingDesc" },
  { icon: Star, titleKey: "features.verified", descKey: "features.verifiedDesc" },
];

const products = [
  { id: 1, name: "Anime Figure Stand", category: "3D Print", price: "$12.99", image: "/product-figure-stand.jpg", description: "Custom 3D printed display stand for anime figures. Durable PLA, multiple colors.", },
  { id: 2, name: "Naruto Keychain", category: "3D Print", price: "$6.99", image: "/product-keychain.jpg", description: "High detail 3D printed Naruto themed keychain. Lightweight and durable.", },
  { id: 3, name: "Custom Name Plate", category: "3D Print", price: "$9.99", image: "/product-nameplate.jpg", description: "Personalized 3D printed name plate with Japanese kanji styling.", },
  { id: 4, name: "Phone Stand (Anime Edition)", category: "3D Print", price: "$8.99", image: "/product-phonestand.jpg", description: "Sleek 3D printed phone stand featuring anime-inspired wave design.", },
  { id: 5, name: "Pokémon Card Lots", category: "Trading Cards", price: "From $9.99", image: "/product-pokemon.jpg", description: "Bulk Pokémon card lots, various sets. Great for collectors and players.", ebay: true },
  { id: 6, name: "One Piece Card Game", category: "Trading Cards", price: "From $4.99", image: "/product-onepiece.jpg", description: "One Piece TCG singles and packs. Ships fast and securely.", ebay: true },
  { id: 7, name: "Dragon Ball Super Cards", category: "Trading Cards", price: "From $3.99", image: "/product-dbz.jpg", description: "DBS card singles and sets. Anime fans' favorite.", ebay: true },
  { id: 8, name: "Naruto Collectible Cards", category: "Trading Cards", price: "From $5.99", image: "/product-naruto-cards.jpg", description: "Rare and common Naruto collectible cards. Perfect for fans.", ebay: true },
  { id: 9, name: "Yu-Gi-Oh! Cards", category: "Trading Cards", price: "From $4.99", image: "/product-yugioh.jpg", description: "Yu-Gi-Oh! TCG singles and lots. Blue-Eyes White Dragon, Dark Magician & more.", ebay: true },
];

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/hero-bg.jpg" alt="Hero" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        </div>
        <div className="relative container px-4 py-24 md:py-40 md:px-6 text-center">
          <div className="mx-auto max-w-3xl space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gradient-gold">
              {t("hero.title")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link to="/shop">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                  {t("hero.shopNow")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/social">
                <Button size="lg" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 px-8">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  {t("hero.joinCommunity")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 md:py-24 border-t border-border/40">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="group relative p-6 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-300 card-glow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{t(feature.titleKey)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(feature.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 md:py-24 border-t border-border/40">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12 space-y-4">
            <p className="text-sm font-medium text-primary tracking-wider uppercase">{t("products.title")}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t("products.subtitle")}</h2>
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
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">{product.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="font-bold text-primary">{product.price}</span>
                    {product.ebay ? (
                      <a href="https://ebay.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center">
                        <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10 text-xs">
                          {t("products.viewOnEbay")}
                        </Button>
                      </a>
                    ) : (
                      <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs">{t("products.orderNow")}</Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/shop">
              <Button variant="outline" className="border-primary/30 text-primary hover:bg-primary/10">
                {t("products.viewAll")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 md:py-24 border-t border-border/40">
        <div className="container px-4 md:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <p className="text-sm font-medium text-primary tracking-wider uppercase">{t("about.title")}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t("about.subtitle")}</h2>
            <p className="text-muted-foreground leading-relaxed text-lg">{t("about.desc")}</p>
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div><p className="text-3xl md:text-4xl font-bold text-primary">100+</p><p className="text-sm text-muted-foreground mt-1">{t("about.customers")}</p></div>
              <div><p className="text-3xl md:text-4xl font-bold text-primary">50+</p><p className="text-sm text-muted-foreground mt-1">{t("about.designs")}</p></div>
              <div><p className="text-3xl md:text-4xl font-bold text-primary">500+</p><p className="text-sm text-muted-foreground mt-1">{t("about.cardsListed")}</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16 md:py-24 border-t border-border/40">
        <div className="container px-4 md:px-6">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <p className="text-sm font-medium text-primary tracking-wider uppercase">{t("contact.subtitle")}</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{t("contact.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("contact.desc")}</p>
            <a href="mailto:ramenanime@protonmail.com">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4">
                <Mail className="mr-2 h-4 w-4" />
                ramenanime@protonmail.com
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
