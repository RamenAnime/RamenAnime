import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "age_gate_passed";
const ADULT_CATEGORIES = ["/marketplace", "/3d-prints", "/trading-cards"];

export default function EnhancedAgeGate({ children }: { children: React.ReactNode }) {
  const [passed, setPassed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const needsCheck = ADULT_CATEGORIES.some((c) => window.location.pathname.startsWith(c));
    if (stored === "true" || !needsCheck) {
      setPassed(true);
    }
    setChecking(false);
  }, []);

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" /></div>;
  }

  if (!passed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 space-y-4 text-center">
            <h1 className="text-2xl font-bold">Age Verification</h1>
            <p className="text-sm text-muted-foreground">
              You must be 18 or older to access the marketplace. Please confirm your age.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.location.href = "/"}>
                I'm Under 18
              </Button>
              <Button onClick={() => { localStorage.setItem(STORAGE_KEY, "true"); setPassed(true); }}>
                I am 18+
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
