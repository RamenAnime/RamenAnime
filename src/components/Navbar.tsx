import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBell } from "./NotificationBell";
import {
  ShoppingCart,
  Menu,
  Globe,
  LogOut,
  Shield,
  Package,
  User,
  Settings,
} from "lucide-react";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const { data: myProfile } = trpc.social.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 60000,
  });

  const isActive = (path: string) => location.pathname === path;

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLangOpen(false);
  };

  const navLinks = [
    { path: "/", label: t("nav.home", "Home") },
    { path: "/shop", label: t("nav.shop", "Shop") },
    { path: "/social", label: t("nav.forum", "Forum") },
    { path: "/marketplace", label: t("nav.marketplace", "Marketplace") },
    { path: "/donate", label: t("nav.donate", "Donate") },
    { path: "/contact", label: t("nav.contact", "Contact") },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
            <span className="text-primary">ラーメン</span>
            <span className="text-foreground">アニメ</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link to="/shop" className="relative">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </Link>

            <div className="relative">
              <Button variant="ghost" size="sm" onClick={() => setLangOpen(!langOpen)} className="text-muted-foreground hover:text-foreground">
                <Globe className="h-4 w-4" />
              </Button>
              {langOpen && (
                <div className="absolute right-0 mt-1 bg-card border border-border rounded-md shadow-lg p-1 min-w-[120px] z-50">
                  {[
                    { code: "en", label: "English" },
                    { code: "ja", label: "日本語" },
                    { code: "zh-TW", label: "繁體中文" },
                    { code: "zh-CN", label: "简体中文" },
                    { code: "ko", label: "한국어" },
                    { code: "fr", label: "Français" },
                  ].map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`block w-full text-left px-3 py-1.5 text-sm rounded-md ${
                        i18n.language === lang.code ? "bg-primary/10 text-primary" : "hover:bg-muted"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <>
                <NotificationBell />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition-colors">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={myProfile?.user?.avatar ?? undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {user?.name?.charAt(0) ?? user?.username?.charAt(0) ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2 border-b border-border/50">
                      <p className="font-medium text-sm">{user?.name ?? user?.username}</p>
                      <p className="text-xs text-muted-foreground">@{user?.username}</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link to={`/profile/${user?.id}`} className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" />
                        {t("nav.myProfile", "My Profile")}
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
                          <Shield className="h-4 w-4" />
                          {t("nav.admin", "Admin Dashboard")}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link to="/friends" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="h-4 w-4" />
                        Friends
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive flex items-center gap-2 cursor-pointer">
                      <LogOut className="h-4 w-4" />
                      {t("nav.logout", "Logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link to="/login">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {t("nav.login", "Login")}
                </Button>
              </Link>
            )}

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="sm">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background border-border">
                <SheetTitle className="text-lg font-bold mb-4">Menu</SheetTitle>
                <div className="flex flex-col gap-2 mt-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setOpen(false)}
                      className={`px-3 py-2 rounded-md text-sm font-medium ${
                        isActive(link.path)
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                  {isAuthenticated && (
                    <>
                      <div className="border-t border-border my-2" />
                      <Link to={`/profile/${user?.id}`} onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                        {t("nav.myProfile", "My Profile")}
                      </Link>
                      {user?.role === "admin" && (
                        <Link to="/admin" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                          {t("nav.admin", "Admin Dashboard")}
                        </Link>
                      )}
                      <button onClick={() => { logout(); setOpen(false); }} className="px-3 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 text-left">
                        {t("nav.logout", "Logout")}
                      </button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

