import { useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

function getOrCreateSessionId(): string {
  let sid = sessionStorage.getItem("ramen_analytics_session");
  if (!sid) {
    sid = "sess_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    sessionStorage.setItem("ramen_analytics_session", sid);
  }
  return sid;
}

function parseListingId(pathname: string): number | undefined {
  const m = pathname.match(/^\/marketplace\/(\d+)\/?$/);
  if (!m) return undefined;
  const id = parseInt(m[1], 10);
  return Number.isNaN(id) ? undefined : id;
}

/** Unified page views, visits, product views, and live swarm presence. */
export function useBehaviorTracking() {
  const location = useLocation();
  const { user } = useAuth();
  const path = location.pathname + location.search;
  const listingId = parseListingId(location.pathname);

  const sessionIdRef = useRef(getOrCreateSessionId());
  const pageStartRef = useRef(Date.now());

  const trackPageView = trpc.analytics.trackPageView.useMutation();
  const trackVisit = trpc.visit.track.useMutation();
  const trackProduct = trpc.analytics.trackProductView.useMutation();
  const trackEvent = trpc.analytics.trackEvent.useMutation();
  const trackSearch = trpc.analytics.trackSearch.useMutation();
  const trackListingView = trpc.marketplace.trackView.useMutation();
  const swarmPulse = trpc.swarm.pulse.useMutation();

  useEffect(() => {
    sessionIdRef.current = getOrCreateSessionId();
    pageStartRef.current = Date.now();
  }, [path]);

  useEffect(() => {
    const country = localStorage.getItem("ramen_anime_country") || undefined;
    trackVisit.mutate({
      path: location.pathname,
      referrer: document.referrer || undefined,
      country,
    });
  }, [location.pathname]);

  useEffect(() => {
    const sessionId = sessionIdRef.current;
    trackPageView.mutate({
      path,
      referrer: document.referrer || undefined,
      sessionId,
    });
    trackEvent.mutate({ eventType: "page_view", pagePath: path });
    swarmPulse.mutate({
      sessionId,
      pagePath: path,
      currentListingId: listingId,
      userId: user?.id,
    });
    if (listingId) {
      trackProduct.mutate({ listingId });
      trackListingView.mutate({ listingId });
    }

    return () => {
      const duration = Math.floor((Date.now() - pageStartRef.current) / 1000);
      if (duration > 1) {
        trackPageView.mutate({ path, duration, sessionId });
      }
    };
  }, [path, listingId, user?.id]);

  useEffect(() => {
    const sessionId = sessionIdRef.current;
    const interval = setInterval(() => {
      swarmPulse.mutate({
        sessionId,
        pagePath: path,
        currentListingId: listingId,
        userId: user?.id,
      });
    }, 15_000);
    return () => clearInterval(interval);
  }, [path, listingId, user?.id]);

  const trackSearchQuery = useCallback(
    (query: string, category?: string, resultsCount?: number) => {
      const q = query.trim();
      if (q.length < 2) return;
      trackSearch.mutate({ query: q, category, resultsCount });
      swarmPulse.mutate({
        sessionId: sessionIdRef.current,
        pagePath: path,
        searchQuery: q,
        category,
        userId: user?.id,
      });
    },
    [path, user?.id, trackSearch, swarmPulse]
  );

  const trackUserEvent = useCallback(
    (eventType: string, eventData?: string, pagePath?: string) => {
      trackEvent.mutate({
        eventType,
        eventData,
        pagePath: pagePath || location.pathname,
      });
    },
    [location.pathname, trackEvent]
  );

  const trackClick = useCallback(
    (elementName: string) => {
      trackUserEvent("click", elementName);
    },
    [trackUserEvent]
  );

  const trackProductView = useCallback(
    (id: number) => {
      trackProduct.mutate({ listingId: id });
      swarmPulse.mutate({
        sessionId: sessionIdRef.current,
        pagePath: path,
        currentListingId: id,
        userId: user?.id,
      });
    },
    [path, user?.id, trackProduct, swarmPulse]
  );

  return {
    trackSearchQuery,
    trackUserEvent,
    trackProductView,
    trackClick,
    sessionId: sessionIdRef.current,
  };
}

/** @deprecated Use useBehaviorTracking - kept for existing imports */
export function useAnalytics() {
  return useBehaviorTracking();
}
