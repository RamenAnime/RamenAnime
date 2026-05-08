import { useState, useEffect } from "react";
  import { useTranslation } from "react-i18next";
  import { Button } from "@/components/ui/button";
  import { Card, CardContent } from "@/components/ui/card";
  import { Globe, Ban, Loader2 } from "lucide-react";

  const ALLOWED_COUNTRIES = ["US","CA","JP","KR","CN","HK","AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE","SG","MY","GB","TW","MO","MN","VN","PH","ID","BN","KH","LA","TL","IN","BD","PK","LK","NP","BH","MV","AF","KZ","UZ","TM","TJ","KG","TR","GE","AM","AZ","IL","JO","LB","IQ","KW","SA","AE","QA","OM","YE","PS","AU","NZ","ZA","NG","GH","KE","ET","TZ","UG","RW","SN","CI","CM","ZW","ZM","MZ","MG","NA","BW"];
  const COUNTRY_NAMES: Record<string, string> = {
    US: "United States", CA: "Canada", JP: "Japan", KR: "South Korea", CN: "China", HK: "Hong Kong",
    FR: "France", DE: "Germany", GB: "United Kingdom", SG: "Singapore", MY: "Malaysia", AT: "Austria",
    BE: "Belgium", BG: "Bulgaria", HR: "Croatia", CY: "Cyprus", CZ: "Czech Republic", DK: "Denmark",
    EE: "Estonia", FI: "Finland", GR: "Greece", HU: "Hungary", IE: "Ireland", IT: "Italy",
    LV: "Latvia", LT: "Lithuania", LU: "Luxembourg", MT: "Malta", NL: "Netherlands", PL: "Poland",
    PT: "Portugal", RO: "Romania", SK: "Slovakia", SI: "Slovenia", ES: "Spain", SE: "Sweden",
    TW: "Taiwan", AU: "Australia", NZ: "New Zealand", IN: "India", TR: "Turkey", VN: "Vietnam",
    ID: "Indonesia", PH: "Philippines", TH: "Thailand", SA: "Saudi Arabia", AE: "United Arab Emirates",
  };

  const GEO_KEY = "ramen_anime_geo_verified";
  const GEO_COUNTRY_KEY = "ramen_anime_country";
  const TIMEOUT_MS = 4000;

  // Browser-compatible first-success race (no Promise.any required)
  function firstSuccess<T>(
    fns: Array<() => Promise<T | null>>
  ): Promise<T | null> {
    return new Promise((resolve) => {
      let settled = false;
      let pending = fns.length;

      const done = (value: T | null) => {
        if (!settled) {
          settled = true;
          resolve(value);
        }
      };

      const timer = setTimeout(() => done(null), TIMEOUT_MS);

      fns.forEach((fn) => {
        fn()
          .then((result) => {
            if (result) {
              clearTimeout(timer);
              done(result);
            }
          })
          .catch(() => {})
          .finally(() => {
            pending -= 1;
            if (pending === 0) {
              clearTimeout(timer);
              done(null);
            }
          });
      });
    });
  }

  async function detectCountry(): Promise<{ code: string; name: string } | null> {
    return firstSuccess<{ code: string; name: string }>([
      () =>
        fetch("https://ipapi.co/json/")
          .then((r) => r.json())
          .then((d) =>
            d.country_code
              ? { code: d.country_code, name: d.country_name || d.country_code }
              : null
          ),
      () =>
        fetch("https://ipwho.is/")
          .then((r) => r.json())
          .then((d) =>
            d.country_code
              ? { code: d.country_code, name: d.country || d.country_code }
              : null
          ),
      () =>
        fetch("https://api.country.is/")
          .then((r) => r.json())
          .then((d) =>
            d.country ? { code: d.country, name: d.country } : null
          ),
    ]);
  }

  interface GeoBlockProps {
    children: React.ReactNode;
  }

  export default function GeoBlock({ children }: GeoBlockProps) {
    const { t } = useTranslation();
    const [status, setStatus] = useState<"checking" | "allowed" | "blocked">(
      "checking"
    );
    const [country, setCountry] = useState<{
      code: string;
      name: string;
    } | null>(null);
    const [showManual, setShowManual] = useState(false);

    useEffect(() => {
      const cached = localStorage.getItem(GEO_KEY);
      const cachedCountry = localStorage.getItem(GEO_COUNTRY_KEY);
      if (cached === "true") {
        setStatus("allowed");
        return;
      }
      if (cached === "false" && cachedCountry) {
        try {
          setCountry(JSON.parse(cachedCountry));
        } catch {}
        setStatus("blocked");
        return;
      }
      detectCountry().then((result) => {
        if (!result) {
          setStatus("allowed");
          return;
        }
        const allowed = ALLOWED_COUNTRIES.includes(result.code);
        setCountry(result);
        localStorage.setItem(GEO_KEY, allowed ? "true" : "false");
        localStorage.setItem(GEO_COUNTRY_KEY, JSON.stringify(result));
        setStatus(allowed ? "allowed" : "blocked");
      });
    }, []);

    const handleManualSelect = (code: string) => {
      const name = COUNTRY_NAMES[code] || code;
      const c = { code, name };
      const allowed = ALLOWED_COUNTRIES.includes(code);
      setCountry(c);
      localStorage.setItem(GEO_KEY, allowed ? "true" : "false");
      localStorage.setItem(GEO_COUNTRY_KEY, JSON.stringify(c));
      setStatus(allowed ? "allowed" : "blocked");
      setShowManual(false);
    };

    const handleRetry = () => {
      localStorage.removeItem(GEO_KEY);
      localStorage.removeItem(GEO_COUNTRY_KEY);
      setStatus("checking");
      detectCountry().then((result) => {
        if (!result) {
          setStatus("allowed");
          return;
        }
        const allowed = ALLOWED_COUNTRIES.includes(result.code);
        setCountry(result);
        localStorage.setItem(GEO_KEY, allowed ? "true" : "false");
        localStorage.setItem(GEO_COUNTRY_KEY, JSON.stringify(result));
        setStatus(allowed ? "allowed" : "blocked");
      });
    };

    if (status === "checking")
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-foreground text-sm font-medium">
              Loadingラーメンアニメ…
            </p>
          </div>
        </div>
      );

    if (status === "allowed") return <>{children}</>;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardContent className="p-8 text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <Ban className="h-10 w-10 text-destructive" />
              <Globe className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {t("geoBlock.title")}
              </h1>
              <p className="text-muted-foreground">{t("geoBlock.subtitle")}</p>
            </div>
            {country && (
              <div className="bg-muted rounded-lg p-3 text-sm">
                <span className="text-muted-foreground">
                  {t("geoBlock.detected")}{" "}
                </span>
                <span className="font-semibold text-foreground">
                  {country.name} ({country.code})
                </span>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {t("geoBlock.not_available")}
            </p>
            <div className="flex flex-col gap-3">
              <Button variant="outline" onClick={handleRetry}>
                {t("geoBlock.retry")}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowManual(!showManual)}
              >
                {t("geoBlock.select_country")}
              </Button>
            </div>
            {showManual && (
              <div className="mt-4">
                <p className="text-xs text-muted-foreground mb-2">
                  {t("geoBlock.available_in")}:
                </p>
                <div className="grid grid-cols-2 gap-1 max-h-48 overflow-y-auto text-left">
                  {ALLOWED_COUNTRIES.map((code) => (
                    <button
                      key={code}
                      onClick={() => handleManualSelect(code)}
                      className="text-xs px-2 py-1 rounded hover:bg-muted text-left transition-colors text-foreground"
                    >
                      {COUNTRY_NAMES[code] || code}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
  