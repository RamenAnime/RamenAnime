import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { playSplashJingle } from "@/lib/splash-jingle";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX } from "lucide-react";

const SPLASH_MS = 5200;
const SKIP_AFTER_MS = 900;
const INTRO_SESSION_KEY = "ramen_anime_intro_played";

export function hasPlayedIntroThisSession(): boolean {
  try {
    return sessionStorage.getItem(INTRO_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

type BrandSplashProps = {
  onComplete: () => void;
};

export default function BrandSplash({ onComplete }: BrandSplashProps) {
  const { t, i18n } = useTranslation();
  const isJa = i18n.language?.startsWith("ja");
  const [progress, setProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [muted, setMuted] = useState(false);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    cleanupRef.current?.();
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, "true");
    } catch {
      /* ignore */
    }
    onComplete();
  }, [onComplete]);

  const tryPlayAudio = useCallback(() => {
    if (muted) return;
    try {
      cleanupRef.current?.();
      cleanupRef.current = playSplashJingle();
      setAudioBlocked(false);
    } catch {
      setAudioBlocked(true);
    }
  }, [muted]);

  useEffect(() => {
    const skipTimer = window.setTimeout(() => setCanSkip(true), SKIP_AFTER_MS);
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / SPLASH_MS);
      setProgress(p * 100);
      if (p >= 1) {
        finish();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    tryPlayAudio();

    return () => {
      window.clearTimeout(skipTimer);
      cancelAnimationFrame(raf);
      cleanupRef.current?.();
    };
  }, [finish, tryPlayAudio]);

  return (
    <div
      className="brand-splash fixed inset-0 z-[200] flex flex-col items-center justify-center overflow-hidden bg-[#0a0612] text-white"
      role="dialog"
      aria-label={t("splash.welcome")}
    >
      <div className="brand-splash-cinema-bar brand-splash-cinema-bar-top" />
      <div className="brand-splash-cinema-bar brand-splash-cinema-bar-bottom" />
      <div className="brand-splash-glow" aria-hidden />
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={i}
          className="brand-splash-petal"
          style={{
            left: `${(i * 17 + 5) % 100}%`,
            animationDelay: `${(i % 7) * 0.35}s`,
            animationDuration: `${3.2 + (i % 4) * 0.4}s`,
          }}
          aria-hidden
        />
      ))}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center">
        <div className="brand-splash-logo-wrap">
          <svg className="brand-splash-bowl" viewBox="0 0 120 88" width="140" height="102" aria-hidden>
            <ellipse cx="60" cy="72" rx="48" ry="10" fill="#1a1028" opacity="0.6" />
            <path d="M18 52 Q60 78 102 52 L96 38 Q60 58 24 38 Z" fill="#c9a227" stroke="#f5d76e" strokeWidth="2" />
            <path d="M28 42 Q60 28 92 42" fill="none" stroke="#f5d76e" strokeWidth="3" strokeLinecap="round" />
            <circle cx="44" cy="48" r="5" fill="#e85d4c" />
            <circle cx="60" cy="46" r="5" fill="#7cb342" />
            <circle cx="76" cy="48" r="5" fill="#f9a825" />
            <path d="M52 22 Q56 8 60 18 Q64 8 68 22" fill="none" stroke="#fff8" strokeWidth="2" opacity="0.5" className="brand-splash-steam" />
            <path d="M44 18 Q48 4 52 14" fill="none" stroke="#fff6" strokeWidth="1.5" opacity="0.4" className="brand-splash-steam brand-splash-steam-delay" />
          </svg>
        </div>
        <div className="space-y-2 brand-splash-title-in">
          <p className="text-xs uppercase tracking-[0.35em] text-amber-200/80">{isJa ? "京都より" : "Ramen Anime"}</p>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-amber-200 via-rose-200 to-amber-300 bg-clip-text text-transparent">
            ラーメンアニメ
          </h1>
          <p className="text-sm sm:text-base text-rose-100/90 font-medium">{t("splash.tagline")}</p>
          <p className="text-xs text-white/55 max-w-xs mx-auto">{t("splash.subtagline")}</p>
        </div>
        <div className="w-48 sm:w-56 h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 via-rose-400 to-amber-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center gap-2">
          {audioBlocked && !muted && (
            <Button type="button" variant="outline" size="sm" className="border-white/20 text-white/90 bg-white/5" onClick={tryPlayAudio}>
              {t("splash.soundOn")}
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-white/70 hover:text-white hover:bg-white/10"
            onClick={() => {
              setMuted((m) => !m);
              if (!muted) cleanupRef.current?.();
              else tryPlayAudio();
            }}
            aria-label={muted ? t("splash.soundOn") : t("splash.soundOff")}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
          {canSkip && (
            <Button type="button" variant="secondary" size="sm" className="bg-white/10 text-white border-white/20" onClick={finish}>
              {t("splash.skip")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}