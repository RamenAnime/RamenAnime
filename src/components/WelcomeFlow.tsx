import { useState } from "react";
import BrandSplash, { hasPlayedIntroThisSession } from "@/components/BrandSplash";
import EnhancedAgeGate from "@/components/EnhancedAgeGate";

const AGE_KEY = "ramen_anime_age_verified_v2";

function isAgeVerified(): boolean {
  try {
    return localStorage.getItem(AGE_KEY) === "true";
  } catch {
    return false;
  }
}

export default function WelcomeFlow({ children }: { children: React.ReactNode }) {
  const [splashDone, setSplashDone] = useState(
    () => isAgeVerified() || hasPlayedIntroThisSession()
  );

  if (isAgeVerified()) {
    return <>{children}</>;
  }

  if (!splashDone) {
    return <BrandSplash onComplete={() => setSplashDone(true)} />;
  }

  return <EnhancedAgeGate>{children}</EnhancedAgeGate>;
}
