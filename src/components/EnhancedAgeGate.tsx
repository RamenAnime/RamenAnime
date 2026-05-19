import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Shield } from "lucide-react";

const AGE_KEY = "ramen_anime_age_verified_v2";

export default function EnhancedAgeGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [age, setAge] = useState("");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(() => {
    try { return localStorage.getItem(AGE_KEY) === "true"; } catch { return false; }
  });

  const submitAge = trpc.geo.submitAgeVerification.useMutation({
    onSuccess: () => {
      localStorage.setItem(AGE_KEY, "true");
      setVerified(true);
      setError("");
    },
    onError: (err) => setError(err.message),
  });

  const verifyAge = () => {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18) {
      setError(t("ageGate.mustBe18"));
      return;
    }
    submitAge.mutate({ age: ageNum });
  };

  if (verified) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[150] bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card/90 border-border/50 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-xl mx-auto">
                ラ
              </div>
              <h1 className="text-2xl font-bold text-foreground">{t("ageGate.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("ageGate.desc")}</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("ageGate.enterAge")}</label>
              <Input
                type="number"
                value={age}
                onChange={(e) => { setAge(e.target.value); setError(""); }}
                placeholder="18"
                min="1"
                max="120"
                className="bg-muted/50"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={verifyAge} disabled={submitAge.isPending}>
                <Shield className="mr-2 h-4 w-4" />
                {submitAge.isPending ? t("ageGate.verifying") : t("ageGate.confirmAge")}
              </Button>
              <Button variant="outline" onClick={() => { window.location.href = "https://google.com"; }}>
                {t("ageGate.exit")}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {t("ageGate.consentFooter")}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
