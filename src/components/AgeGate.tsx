import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertTriangle, Globe, FileText, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

const AGE_VERIFIED_KEY = "ramen_anime_age_verified";

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [verified, setVerified] = useState(false);
  const [age, setAge] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem(AGE_VERIFIED_KEY);
    if (stored === "true") {
      setVerified(true);
    }
  }, []);

  const handleVerify = () => {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18) {
      setError(t("ageGate.error", { defaultValue: "You must be 18 or older to enter." }));
      return;
    }
    localStorage.setItem(AGE_VERIFIED_KEY, "true");
    setVerified(true);
  };

  const handleExit = () => {
    window.location.href = "https://www.google.com";
  };

  if (verified) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card className="bg-card/90 border-border/50 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-3xl mx-auto">
                ラ
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{t("ageGate.title")}</h1>
                <p className="text-sm text-muted-foreground mt-1">{t("ageGate.subtitle")}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">{t("ageGate.desc")}</p>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">{t("ageGate.enterAge", { defaultValue: "Enter your age" })}</label>
              <input
                type="number"
                value={age}
                onChange={(e) => { setAge(e.target.value); setError(""); }}
                placeholder="18"
                min="1"
                max="120"
                className="w-full h-10 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            <div className="flex flex-col gap-3">
              <Button
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleVerify}
              >
                <Shield className="mr-2 h-4 w-4" />
                {t("ageGate.confirm")}
              </Button>
              <Button
                variant="outline"
                className="w-full border-border/50 text-muted-foreground"
                onClick={handleExit}
              >
                {t("ageGate.exit")}
              </Button>
            </div>

            <div className="text-center space-y-2 pt-2 border-t border-border/30">
              <p className="text-xs text-muted-foreground">{t("ageGate.notice")}</p>
              <div className="flex items-center justify-center gap-4">
                <Link to="/terms" className="text-xs text-primary hover:underline flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {t("ageGate.readTerms")}
                </Link>
                <Link to="/privacy" className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  {t("ageGate.readPrivacy")}
                </Link>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Globe className="h-3 w-3" />
              <span>USA · Japan · Canada · South Korea · France</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
