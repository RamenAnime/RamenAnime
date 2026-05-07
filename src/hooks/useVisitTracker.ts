import { useEffect } from "react";
import { trpc } from "@/providers/trpc";

export function useVisitTracker() {
  const track = trpc.visit.track.useMutation();

  useEffect(() => {
    const startTime = Date.now();
    let heartbeat: ReturnType<typeof setInterval>;

    const sendVisit = () => {
      track.mutate({
        path: window.location.pathname,
        referrer: document.referrer || undefined,
        duration: Math.round((Date.now() - startTime) / 1000),
      });
    };

    // Track on mount
    sendVisit();

    // Heartbeat every 30s while active
    heartbeat = setInterval(() => {
      if (!document.hidden) sendVisit();
    }, 30000);

    return () => clearInterval(heartbeat);
  }, []);
}
