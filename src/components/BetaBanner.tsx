import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { X, Zap, Users, CheckCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DISMISSED_KEY = "ramen_beta_banner_dismissed";

export default function BetaBanner() {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(DISMISSED_KEY) === "true"; } catch { return false; }
  });

  const dismiss = () => {
    try { localStorage.setItem(DISMISSED_KEY, "true"); } catch { /* ignore */ }
    setDismissed(true);
  };

  if (dismissed) return null;

  const perks = [
    { icon: CheckCircle, text: t("beta.perk1") },
    { icon: Users, text: t("beta.perk2") },
    { icon: Users, text: t("beta.perk3") },
  ];

  return (
    <div className="relative bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-y border-amber-700/50 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(212,168,83,0.15),transparent_70%)]" />

      <div className="relative container px-4 md:px-6 py-6 md:py-8">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 text-amber-400/60 hover:text-amber-300 transition-colors"
          aria-label={t("beta.dismissAria")}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-semibold tracking-widest uppercase px-3 py-1">
              <Zap className="h-3 w-3 mr-1" />
              {t("beta.title")}
            </Badge>
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-amber-100">
            {t("beta.heading")}
          </h2>

          <p className="text-amber-200/80 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            {t("beta.body")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
            {perks.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-2 bg-amber-900/40 rounded-lg px-3 py-2 border border-amber-700/30">
                <Icon className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                <span className="text-xs text-amber-200/90">{text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={`mailto:ramenanime@protonmail.com?subject=${encodeURIComponent(t("beta.mailtoSubject"))}&body=${encodeURIComponent(t("beta.mailtoBody"))}`}
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2.5 rounded-lg transition-colors text-sm"
            >
              <Mail className="h-4 w-4" />
              {t("beta.applyEmail")}
            </a>
            <Link to="/social">
              <Button variant="outline" size="sm" className="border-amber-600/50 text-amber-300 hover:bg-amber-900/60 text-sm">
                <Users className="h-4 w-4 mr-2" />
                {t("beta.joinForum")}
              </Button>
            </Link>
          </div>

          <p className="text-xs text-amber-400/50">
            {t("beta.footer")}
          </p>
        </div>
      </div>
    </div>
  );
}
