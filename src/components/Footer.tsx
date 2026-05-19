import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Mail, Instagram, Twitter, ShoppingBag } from "lucide-react";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container px-4 py-12 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-xs">
                ラ
              </div>
              <span className="font-semibold text-foreground">ラーメンアニメ</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="mailto:ramenanime@protonmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-medium text-foreground mb-4">{t("footer.shop")}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("nav.shop")}
                </Link>
              </li>
              <li>
                <Link to="/3d-prints" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("nav.prints3d")}
                </Link>
              </li>
              <li>
                <Link to="/trading-cards" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("nav.cards")}
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("nav.marketplace")}
                </Link>
              </li>
              <li>
                <Link to="/donate" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("footer.donate")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-medium text-foreground mb-4">{t("footer.community")}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/social" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("nav.social")}
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("nav.terms")}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t("nav.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium text-foreground mb-4">{t("footer.getInTouch")}</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                ramenanime@protonmail.com
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <ShoppingBag className="h-4 w-4 text-primary" />
                {t("footer.verifiedSeller")}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 {t("hero.title")}. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              {t("nav.terms")}
            </Link>
            <Link to="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
