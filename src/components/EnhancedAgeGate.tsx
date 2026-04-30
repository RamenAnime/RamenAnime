import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertTriangle, Loader2, CheckCircle2 } from "lucide-react";

const AGE_KEY = "ramen_anime_age_verified_v2";

export default function EnhancedAgeGate({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [age, setAge] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submitAge = trpc.geo.submitAgeVerification.useMutation({
    onSuccess: () => {
      localStorage.setItem(AGE_KEY, "true");
      setDone(true);
      setError("");
    },
    onError: (err) => setError(err.message),
  });

  const verifyAge = () => {
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18) {
      setError("You must be 18 or older to access this service.");
      return;
    }
    submitAge.mutate({ age: ageNum });
  };

  const isVerified = localStorage.getItem(AGE_KEY) === "true";

  if (isVerified || done) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[150] bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-card/90 border-border/50 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-6 md:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-xl mx-auto">
              ラ
            </div>
            <h1 className="text-2xl font-bold text-foreground">{t("ageGate.title")}</h1>
            <p className="text-sm text-muted-foreground">{t("ageGate.subtitle")}</p>

            <div className="bg-muted/30 rounded-lg p-4 text-sm text-muted-foreground space-y-2 text-left">
              <p className="font-medium text-foreground">Legal compliance:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>USA: COPPA & CCPA</li>
                <li>Canada: PIPEDA</li>
                <li>Japan: APPI</li>
                <li>South Korea: Youth Protection Act</li>
                <li>China: PIPL real-name rules</li>
                <li>France/EU: GDPR</li>
              </ul>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Enter your age</label>
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
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={verifyAge}
                disabled={submitAge.isPending}
              >
                {submitAge.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
                {submitAge.isPending ? "Verifying..." : "Confirm Age & Continue"}
              </Button>
              <Button variant="outline" onClick={() => window.location.href = "https://google.com"}>
                Exit
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              By proceeding, you agree that false age declarations may result in account termination.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
