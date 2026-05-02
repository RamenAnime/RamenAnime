import { useEffect, useState } from "react";
import { getFrameworkForCountry } from "@/data/legal-frameworks";
import type { LegalFramework } from "@/data/legal-frameworks";

export function useComplianceFramework() {
  const [framework, setFramework] = useState<LegalFramework | null>(null);
  const [country, setCountry] = useState<string>("US");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function detect() {
      try {
        // Try to get country from backend (which reads X-Country-Code header)
        const res = await fetch("/api/trpc/geo.checkAccess");
        if (res.ok) {
          const data = await res.json();
          if (data?.result?.data?.country) {
            setCountry(data.result.data.country);
            setFramework(getFrameworkForCountry(data.result.data.country));
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fallback to browser language
      }
      // Fallback: detect from browser locale
      const lang = navigator.language;
      const langCountry = lang.split("-")[1] ?? "US";
      setCountry(langCountry);
      setFramework(getFrameworkForCountry(langCountry));
      setLoading(false);
    }
    detect();
  }, []);

  return { framework, country, loading };
}

// Cookie consent banner (GDPR/ePrivacy compliance)
export function CookieConsent() {
  const [show, setShow] = useState(false);
  const { framework } = useComplianceFramework();

  useEffect(() => {
    if (framework?.requiresCookieConsent) {
      const consent = localStorage.getItem("cookie_consent");
      if (!consent) setShow(true);
    }
  }, [framework]);

  if (!show || !framework?.requiresCookieConsent) return null;

  const accept = () => {
    localStorage.setItem("cookie_consent", JSON.stringify({
      essential: true,
      analytics: true,
      marketing: false,
      timestamp: Date.now(),
    }));
    setShow(false);
  };

  const acceptEssential = () => {
    localStorage.setItem("cookie_consent", JSON.stringify({
      essential: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    }));
    setShow(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t border-border p-4 shadow-lg">
      <div className="container mx-auto max-w-4xl flex flex-col md:flex-row items-center gap-4">
        <div className="flex-1 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">Cookie Notice</p>
          <p>
            We use cookies and similar technologies to provide our services, analyze usage, and improve your experience.
            Under {framework.privacyLaw}, we require your consent for non-essential cookies.
            You can manage your preferences at any time.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={acceptEssential} className="px-4 py-2 text-sm border rounded-md hover:bg-muted transition-colors">
            Essential Only
          </button>
          <button onClick={accept} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
