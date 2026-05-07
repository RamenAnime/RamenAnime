import { useEffect, useState } from "react";

const BLOCKED_COUNTRIES = ["CN", "IR", "KP", "RU"];

export default function GeoBlock({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        setAllowed(!BLOCKED_COUNTRIES.includes(data.country_code));
      })
      .catch(() => setAllowed(true));
  }, []);

  if (allowed === null) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">This service is not available in your region.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
