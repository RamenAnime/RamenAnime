import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Ban, AlertCircle, Loader2 } from "lucide-react";

const ALLOWED_COUNTRIES = ["US","CA","JP","KR","CN","HK","AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","SG","MY","GB"];
const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", CA: "Canada", JP: "Japan", KR: "South Korea", CN: "China", HK: "Hong Kong", FR: "France", DE: "Germany", GB: "United Kingdom", SG: "Singapore", MY: "Malaysia",
};

const GEO_KEY = "ramen_anime_geo_verified";
const GEO_COUNTRY_KEY = "ramen_anime_country";

export default function GeoBlock({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [country, setCountry] = useState("");
  const [countryName, setCountryName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const storedCountry = localStorage.getItem(GEO_COUNTRY_KEY);
    const storedVerified = localStorage.getItem(GEO_KEY);
    if (storedVerified === "true" && storedCountry && ALLOWED_COUNTRIES.includes(storedCountry)) {
      setAllowed(true);
      setChecking(false);
      return;
    }
    detectCountry();
  }, []);

  const detectCountry = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      const code = data.country_code?.toUpperCase() || "";
      const name = data.country_name || COUNTRY_NAMES[code] || code;
      setCountry(code);
      setCountryName(name);
      if (ALLOWED_COUNTRIES.includes(code)) {
        localStorage.setItem(GEO_KEY, "true");
        localStorage.setItem(GEO_COUNTRY_KEY, code);
        setAllowed(true);
      } else {
        setAllowed(false);
      }
    } catch {
      setError("Unable to detect location. Please try again or contact support.");
      setAllowed(false);
    } finally {
      setChecking(false);
    }
  };

  const handleRetry = () => {
    setChecking(true);
    setError("");
    detectCountry();
  };

  if (checking) {
    return (
      <div className="fixed inset-0 z-[200] bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Detecting your location...</p>
        </div>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="fixed inset-0 z-[200] bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Card className="bg-card/90 border-border/50 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-8 space-y-6 text-center">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                <Ban className="h-10 w-10 text-destructive" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Service Not Available</h1>
                <p className="text-muted-foreground mt-2">
                  This service is only available in:
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {Object.entries(COUNTRY_NAMES).map(([code, name]) => (
                  <div key={code} className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm">
                    <Globe className="h-3 w-3" />
                    {name}
                  </div>
                ))}
              </div>
              {country && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
                  Detected country: <strong className="text-foreground">{countryName} ({country})</strong>
                </div>
              )}
              {error && (
                <div className="flex items-start gap-2 bg-destructive/10 rounded-lg p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-3">
                <Button onClick={handleRetry} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Globe className="mr-2 h-4 w-4" />
                  Retry Detection
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "https://google.com"}>
                  Exit
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                If you believe this is an error and you are in an allowed country, please contact us at{" "}
                <a href="mailto:ramenanime@protonmail.com" className="text-primary hover:underline">
                  ramenanime@protonmail.com
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
