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
  Mail,
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
    setOpen(false);
  };

  const languages = [
    { code: "en", label: "English" },
    { code: "ja", label: "日本語" },
    { code: "ko", label: "한국어" },
    { code: "zh-CN", label: "中文 (简体)" },
    { code: "zh-TW", label: "中文 (繁體)" },
    { code: "hi", label: "हिन्दी" },
    { code: "id", label: "Bahasa Indonesia" },
    { code: "ms", label: "Bahasa Melayu" },
    { code: "tl", label: "Filipino" },
    { code: "vi", label: "Tiếng Việt" },
    { code: "th", label: "ไทย" },
    { code: "ar", label: "العربية" },
    { code: "he", label: "עברית" },
    { code: "tr", label: "Türkçe" },
    { code: "de", label: "Deutsch" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "it", label: "Italiano" },
    { code: "nl", label: "Nederlands" },
    { code: "pt", label: "Português" },
    { code: "pl", label: "Polski" },
    { code: "ro", label: "Română" },
    { code: "el", label: "Ελληνικά" },
    { code: "sv", label: "Svenska" },
    { code: "cs", label: "Čeština" },
    { code: "hu", label: "Magyar" },
    { code: "bg", label: "Български" },
    { code: "da", label: "Dansk" },
    { code: "fi", label: "Suomi" },
    { code: "sk", label: "Slovenčina" },
    { code: "hr", label: "Hrvatski" },
    { code: "lt", label: "Lietuvių" },
    { code: "lv", label: "Latviešu" },
    { code: "sl", label: "Slovenščina" },
    { code: "et", label: "Eesti" },
  ];

  const currentLang = languages.find((l) => l.code === i18n.language) ?? languages[0];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container px-4 md:px-6 mx-auto">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-sm">
              ラ
            </div>
            <span className="font-bold text-lg hidden sm:block text-foreground">
              {t("nav.brand")}
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            </Link>
            <Link to="/social" className={`text-sm font-medium transition-colors ${isActive("/social") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              {t("nav.community")}
            </Link>
            <Link to="/marketplace" className={`text-sm font-medium transition-colors ${isActive("/marketplace") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              {t("nav.marketplace")}
            </Link>
            <Link to="/donate" className={`text-sm font-medium transition-colors ${isActive("/donate") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              {t("nav.donate")}
            </Link>
            {isAuthenticated ? null : (
              <Link to="/login" className={`text-sm font-medium transition-colors ${isActive("/login") ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                {t("nav.login")}
              </Link>
            )}
            {isAuthenticated && (
              <span className="text-sm font-medium text-muted-foreground">
                @{user?.username}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <>
                <Link to="/messages" className="relative">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Mail className="h-4 w-4" />
                  </Button>
                </Link>
                <NotificationBell />
              </>
            )}
              <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
                <ShoppingCart className="h-5 w-5" />
              </Button>
            </Link>

            <Sheet open={langOpen} onOpenChange={setLangOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground hover:text-primary">
                  <Globe className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background border-border">
                <SheetTitle className="text-foreground">{t("nav.language")}</SheetTitle>
                <div className="mt-4 space-y-2">
                  {languages.map((lang) => (
                    <button key={lang.code} onClick={() => changeLanguage(lang.code)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${i18n.language === lang.code ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                      {lang.label}
                    </button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {isAuthenticated && user && (
              <div className="hidden md:flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="h-8 w-8 border border-primary/30 cursor-pointer hover:border-primary transition-colors">
                      <AvatarImage src={user.avatar ?? undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs">
                        {user.name?.charAt(0) ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-background border-border">
                    <div className="px-3 py-2 border-b border-border">
                      <p className="text-sm font-medium text-foreground">{user.name ?? user.username}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to={`/profile/${user.id}`} className="flex items-center gap-2 text-foreground">
                        <User className="h-4 w-4" /> {t("nav.myProfile")}
                      </Link>
                    </DropdownMenuItem>
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild className="cursor-pointer">
                        <Link to="/admin" className="flex items-center gap-2 text-primary">
                          <Shield className="h-4 w-4" /> {t("nav.admin")}
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="h-4 w-4 mr-2" /> {t("nav.logout")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-foreground">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-background border-border w-[280px]">
                <SheetTitle className="text-foreground mb-4">{t("nav.menu")}</SheetTitle>
                <div className="flex flex-col gap-1 mt-4">
                  <Link to="/" onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                    {t("nav.home")}
                  </Link>
                  </Link>
                  <Link to="/social" onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/social") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                    {t("nav.community")}
                  </Link>
                  <Link to="/marketplace" onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/marketplace") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                    {t("nav.marketplace")}
                  </Link>
                  <Link to="/donate" onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/donate") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                    {t("nav.donate")}
                  </Link>
                  <Link to="/friends" onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/friends") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                    <Package className="h-4 w-4" />{t("nav.friends")}
                  </Link>

                  {isAuthenticated && (
                    <Link to={`/profile/${user?.id}`} onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive(`/profile/${user?.id}`) ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                      <User className="h-4 w-4" /> {t("nav.myProfile")}
                    </Link>
                  )}

                  {isAuthenticated && user?.role === "admin" && (
                    <Link to="/admin" onClick={() => setOpen(false)} className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive("/admin") ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}>
                      <Shield className="h-4 w-4" />Admin
                    </Link>
                  )}

                  {isAuthenticated ? null : (
                    <Link to="/login" onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-primary bg-primary/10">
                      {t("nav.login")}
                    </Link>
                  )}

                  {isAuthenticated && (
                    <button onClick={() => { logout(); setOpen(false); }} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors mt-2">
                      <LogOut className="h-4 w-4" />{t("nav.logout")}
                    </button>
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
