import { useState } from "react";
  import { Link } from "react-router";
  import { X, Zap, Users, CheckCircle, Mail, Globe } from "lucide-react";
  import { Button } from "@/components/ui/button";
  import { Badge } from "@/components/ui/badge";

  const DISMISSED_KEY = "ramen_beta_banner_dismissed";

  export default function BetaBanner() {
    const [dismissed, setDismissed] = useState(() => {
      try { return localStorage.getItem(DISMISSED_KEY) === "true"; } catch { return false; }
    });

    const dismiss = () => {
      try { localStorage.setItem(DISMISSED_KEY, "true"); } catch {}
      setDismissed(true);
    };

    if (dismissed) return null;

    return (
      <div className="relative bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 border-y border-amber-700/50 overflow-hidden">
        {/* Background shimmer */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(212,168,83,0.15),transparent_70%)]" />

        <div className="relative container px-4 md:px-6 py-6 md:py-8">
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 text-amber-400/60 hover:text-amber-300 transition-colors"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="max-w-4xl mx-auto text-center space-y-4">
            {/* Header */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-xs font-semibold tracking-widest uppercase px-3 py-1">
                <Zap className="h-3 w-3 mr-1" />
                Beta Programme
              </Badge>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-amber-100">
              ラーメンアニメ is looking for Beta Testers!
            </h2>

            <p className="text-amber-200/80 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
              We are building something special for the anime community and we need your help to make it great.
              Join as a volunteer beta tester — explore the site, report bugs, test features across languages,
              and help shape the platform before public launch.
            </p>

            {/* Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
              {[
                { icon: CheckCircle, text: "Early access to all new features" },
                { icon: Globe, text: "Help us test all 28 languages" },
                { icon: Users, text: "Beta tester badge on your profile" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2 bg-amber-900/40 rounded-lg px-3 py-2 border border-amber-700/30">
                  <Icon className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-xs text-amber-200/90">{text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <a
                href="mailto:ramenanime@protonmail.com?subject=Beta%20Tester%20Application&body=Hi!%20I%20would%20love%20to%20beta%20test%20ラーメンアニメ.%0A%0AUsername%3A%20%0ACountry%3A%20%0ABrowser%2FDevice%3A%20%0A%0AWhat%20I%20want%20to%20test%3A%20"
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2.5 rounded-lg transition-colors text-sm"
              >
                <Mail className="h-4 w-4" />
                Apply via Email
              </a>
              <Link to="/social">
                <Button variant="outline" size="sm" className="border-amber-600/50 text-amber-300 hover:bg-amber-900/60 text-sm">
                  <Users className="h-4 w-4 mr-2" />
                  Join the Forum
                </Button>
              </Link>
            </div>

            <p className="text-xs text-amber-400/50">
              ramenanime@protonmail.com · Open to everyone worldwide · No experience required
            </p>
          </div>
        </div>
      </div>
    );
  }
  