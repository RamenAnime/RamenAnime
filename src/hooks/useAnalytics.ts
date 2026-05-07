import { useEffect, useRef, useCallback } from "react";
import { trpc } from "@/providers/trpc";

export function useAnalytics() {
  const trackView = trpc.analytics.trackPageView.useMutation();
  const trackSearch = trpc.analytics.trackSearch.useMutation();
  const trackEvent = trpc.analytics.trackEvent.useMutation();
  const trackProduct = trpc.analytics.trackProductView.useMutation();

  const sessionIdRef = useRef<string>("");
  const pageStartRef = useRef<number>(Date.now());

  // Initialize/get session ID
  useEffect(() => {
    let sid = sessionStorage.getItem("ramen_analytics_session");
    if (!sid) {
      sid = "sess_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem("ramen_analytics_session", sid);
    }
    sessionIdRef.current = sid;
    pageStartRef.current = Date.now();
  }, []);

  // Track page view on mount
  useEffect(() => {
    const path = window.location.pathname + window.location.search;
    const referrer = document.referrer || undefined;

    trackView.mutate({
      path,
      referrer,
      sessionId: sessionIdRef.current,
    });

    return () => {
      // Track duration when leaving page
      const duration = Math.floor((Date.now() - pageStartRef.current) / 1000);
      if (duration > 0) {
        trackView.mutate({
          path,
          duration,
          sessionId: sessionIdRef.current,
        });
      }
    };
  }, []);

  const trackSearchQuery = useCallback((query: string, category?: string, resultsCount?: number) => {
    trackSearch.mutate({ query, category, resultsCount });
  }, [trackSearch]);

  const trackUserEvent = useCallback((eventType: string, eventData?: string, pagePath?: string) => {
    trackEvent.mutate({
      eventType,
      eventData,
      pagePath: pagePath || window.location.pathname,
    });
  }, [trackEvent]);

  const trackProductView = useCallback((listingId: number) => {
    trackProduct.mutate({ listingId });
  }, [trackProduct]);

  const trackClick = useCallback((elementName: string) => {
    trackEvent.mutate({
      eventType: "click",
      eventData: elementName,
      pagePath: window.location.pathname,
    });
  }, [trackEvent]);

  return {
    trackSearchQuery,
    trackUserEvent,
    trackProductView,
    trackClick,
    sessionId: sessionIdRef.current,
  };
}
