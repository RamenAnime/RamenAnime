import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe, Ban, AlertCircle, Loader2 } from "lucide-react";

const ALLOWED_COUNTRIES = ["US","CA","JP","KR","CN","HK","AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","SG","MY","GB"];
const COUNTRY_NAMES: Record<string, string> = {
  US: "United States", CA: "Canada", JP: "Japan", KR: "South Korea", CN: "China", HK: "Hong Kong",
  FR: "France", DE: "Germany", GB: "United Kingdom", SG: "Singapore", MY: "Malaysia", AT: "Austria",
  BE: "Belgium", BG: "Bulgaria", HR: "Croatia", CY: "Cyprus", CZ: "Czech Republic", DK: "Denmark",
  EE: "Estonia", FI: "Finland", GR: "Greece", HU: "Hungary", IE: "Ireland", IT: "Italy",
  LV: "Latvia", LT: "Lithuania", LU: "Luxembourg", MT: "Malta", NL: "Netherlands", PL: "Poland",
  PT: "Portugal", RO: "Romania", SK: "Slovakia", SI: "Slovenia", ES: "Spain", SE: "Sweden",
};

const GEO_KEY = "ramen_anime_geo_verified";
const GEO_COUNTRY_KEY = "ramen_anime_country";

async function detectWithFallbacks(): Promise<{ code: string; name: string } | null> {
  const services = [
    { url: "https://ipapi.co/json/", extract: (d: any) => ({ code: d.country_code?.toUpperCase() || "", name: d.country_name || "" }) },
    { url: "https://ipinfo.io/json", extract: (d: any) => ({ code: d.country?.toUpperCase() || "", name: COUNTRY_NAMES[d.country?.toUpperCase()] || d.country || "" }) },
    { url: "https://api.ipgeolocation.io/ipgeo?apiKey=demo", extract: (d: any) => ({ code: d.country_code2?.toUpperCase() || "", name: d.country_name || "" }) },
  ];
  for (const svc of services) {
    try {
      const res = await fetch(svc.url, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) continue;
      const data = await res.json();
      const result = svc.extract(data);
      if (result.code) return result;
    } catch { /* try next */ }
  }
  return null;
}

export default function GeoBlock({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [country, setCountry] = useState("");
  const [countryName, setCountryName] = useState("");
  const [showManual, setShowManual] = useState(false);

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
    setShowManual(false);
    const result = await detectWithFallbacks();
    if (!result || !result.code) {
      setShowManual(true);
      setChecking(false);
      return;
    }
    setCountry(result.code);
    setCountryName(result.name || COUNTRY_NAMES[result.code] || result.code);
    if (ALLOWED_COUNTRIES.includes(result.code)) {
      localStorage.setItem(GEO_KEY, "true");
      localStorage.setItem(GEO_COUNTRY_KEY, result.code);
      setAllowed(true);
    } else {
      setAllowed(false);
    }
    setChecking(false);
  };

  const handleManualSelect = (code: string) => {
    setCountry(code);
    setCountryName(COUNTRY_NAMES[code] || code);
    if (ALLOWED_COUNTRIES.includes(code)) {
      localStorage.setItem(GEO_KEY, "true");
      localStorage.setItem(GEO_COUNTRY_KEY, code);
      setAllowed(true);
      setShowManual(false);
    } else {
      setAllowed(false);
    }
  };

  const handleRetry = () => {
    setChecking(true);
    setShowManual(false);
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

  if (showManual) {
    return (
      <div className="fixed inset-0 z-[200] bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Card className="bg-card/90 border-border/50 backdrop-blur-sm shadow-2xl">
            <CardContent className="p-8 space-y-6 text-center">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Globe className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Select Your Country</h1>
              <p className="text-muted-foreground">We could not auto-detect your location. Please select your country to continue.</p>
              <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto text-left">
                {ALLOWED_COUNTRIES.map((code) => (
                  <button key={code} onClick={() => handleManualSelect(code)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors text-sm">
                    <Globe className="h-4 w-4 shrink-0" />{COUNTRY_NAMES[code] || code}
                  </button>
                ))}
              </div>
              <Button variant="outline" onClick={handleRetry} className="w-full">
                <Globe className="mr-2 h-4 w-4" />Retry Auto-Detection
              </Button>
            </CardContent>
          </Card>
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
              <h1 className="text-2xl font-bold text-foreground">Service Not Available</h1>
              <p className="text-muted-foreground">This service is not available in your region.</p>
              {country && <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">Detected: <strong className="text-foreground">{countryName} ({country})</strong></div>}
              <div className="flex flex-col gap-3">
                <Button onClick={handleRetry} className="bg-primary text-primary-foreground hover:bg-primary/90"><Globe className="mr-2 h-4 w-4" />Retry Detection</Button>
                <Button variant="outline" onClick={() => setShowManual(true)}><Globe className="mr-2 h-4 w-4" />Select Country Manually</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
