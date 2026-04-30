import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { ShoppingCart, Menu, MessageCircle, User, LogOut, LogIn, Home, Package, Printer, CreditCard, Phone, Shield, Store, Heart } from "lucide-react";

export default function Navbar() {
  const { t } = useTranslation();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { href: "/", label: t("nav.home"), icon: Home },
    { href: "/shop", label: t("nav.shop"), icon: ShoppingCart },
    { href: "/marketplace", label: t("nav.marketplace"), icon: Store },
    { href: "/3d-prints", label: t("nav.prints3d"), icon: Printer },
    { href: "/trading-cards", label: t("nav.cards"), icon: CreditCard },
    { href: "/donate", label: "Donate", icon: Heart },
    { href: "/contact", label: t("nav.contact"), icon: Phone },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-xs">
            ラ
          </div>
          <span className="hidden sm:inline font-semibold text-foreground tracking-tight">
            Ramen Anime
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated && (
            <Link
              to="/social"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive("/social")
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {t("nav.social")}
            </Link>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          {!isLoading && isAuthenticated && user ? (
            <div className="hidden lg:flex items-center gap-2">
              <Link to="/social">
                <Button variant="ghost" size="icon" className="relative">
                  <MessageCircle className="h-5 w-5" />
                </Button>
              </Link>
              <Link to={`/profile/${user.id}`}>
                <Avatar className="h-8 w-8 border border-primary/30 cursor-pointer hover:border-primary transition-colors">
                  <AvatarImage src={user.avatar ?? undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {user.name?.charAt(0) ?? "U"}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ) : !isLoading ? (
            <div className="hidden lg:flex items-center gap-2">
              <Link to="/terms">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  <Shield className="h-4 w-4 mr-1" />
                  {t("nav.terms")}
                </Button>
              </Link>
              <Link to="/login">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <LogIn className="h-4 w-4 mr-1" />
                  {t("nav.login")}
                </Button>
              </Link>
            </div>
          ) : null}

          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-background border-border">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-[10px]">
                    ラ
                  </div>
                  Ramen Anime
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
                <div className="my-2 border-t border-border" />
                {isAuthenticated && (
                  <>
                    <Link
                      to="/social"
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive("/social")
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <MessageCircle className="h-4 w-4" />
                      {t("nav.social")}
                    </Link>
                    <Link
                      to={`/profile/${user?.id}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      <User className="h-4 w-4" />
                      {t("nav.profile")}
                    </Link>
                    <Link
                      to="/friends"
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive("/friends")
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <Package className="h-4 w-4" />
                      {t("nav.friends")}
                    </Link>
                    <button
                      onClick={() => { logout(); setOpen(false); }}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                )}
                {!isAuthenticated && (
                  <>
                    <Link
                      to="/terms"
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive("/terms")
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      <Shield className="h-4 w-4" />
                      {t("nav.terms")}
                    </Link>
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <LogIn className="h-4 w-4" />
                      {t("nav.login")}
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
