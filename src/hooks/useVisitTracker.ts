import { useEffect } from "react";
import { trpc } from "@/providers/trpc";

export function useVisitTracker() {
  const track = trpc.visit.track.useMutation();

  useEffect(() => {
    // Get country from localStorage if available
    const country = localStorage.getItem("ramen_anime_country") || undefined;
    // Track this page view
    track.mutate({
      path: window.location.pathname,
      referrer: document.referrer || undefined,
      country,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
