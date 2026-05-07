import { useState, useEffect, useCallback, useRef } from "react";
import { trpc } from "@/providers/trpc";

export interface SwarmDigest {
  pagePath: string;
  currentListingId?: number;
  searchQuery?: string;
  category?: string;
  embedding?: number[];
  errorPattern?: string;
}

export interface SwarmState {
  activeUsers: number;
  totalSharedInsights: number;
  topListings: [string, number][];
  topSearches: [string, number][];
  topCategories: [string, number][];
  anomalies: any[];
  collectiveInterests: { interests: [string, number][]; confidence: number };
}

export function useSwarm() {
  const [sessionId] = useState(() => {
    let sid = sessionStorage.getItem("ramen_swarm_session");
    if (!sid) {
      sid = "swarm_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem("ramen_swarm_session", sid);
    }
    return sid;
  });

  const [swarmData, setSwarmData] = useState<SwarmState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const digestRef = useRef<SwarmDigest>({ pagePath: window.location.pathname });

  const pulse = trpc.swarm.pulse.useMutation();
  const snapshotQuery = trpc.swarm.snapshot.useQuery(undefined, {
    refetchInterval: 5000, // Poll every 5 seconds
    enabled: true,
  });

  // Update local digest
  const updateDigest = useCallback((partial: Partial<SwarmDigest>) => {
    digestRef.current = { ...digestRef.current, ...partial };
  }, []);

  // Send pulse to swarm
  const sendPulse = useCallback(async () => {
    try {
      const digest = digestRef.current;
      await pulse.mutateAsync({
        sessionId,
        pagePath: digest.pagePath,
        currentListingId: digest.currentListingId,
        searchQuery: digest.searchQuery,
        category: digest.category,
        embedding: digest.embedding,
        errorPattern: digest.errorPattern,
      });
    } catch {
      // Silently fail - swarm is best-effort
    }
  }, [pulse, sessionId]);

  // Track page changes
  useEffect(() => {
    const handleRouteChange = () => {
      digestRef.current.pagePath = window.location.pathname;
      updateDigest({ pagePath: window.location.pathname });
      sendPulse();
    };

    // Listen for navigation
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(this, args);
      handleRouteChange();
    };
    history.replaceState = function(...args) {
      originalReplaceState.apply(this, args);
      handleRouteChange();
    };
    window.addEventListener("popstate", handleRouteChange);

    return () => {
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, [updateDigest, sendPulse]);

  // Initial pulse + interval
  useEffect(() => {
    sendPulse();
    setIsConnected(true);
    
    const interval = setInterval(sendPulse, 5000);
    return () => clearInterval(interval);
  }, [sendPulse]);

  // Update swarm data from query
  useEffect(() => {
    if (snapshotQuery.data) {
      setSwarmData({
        activeUsers: snapshotQuery.data.activeUsers,
        totalSharedInsights: snapshotQuery.data.totalSharedInsights,
        topListings: snapshotQuery.data.topListings,
        topSearches: snapshotQuery.data.topSearches,
        topCategories: snapshotQuery.data.topCategories,
        anomalies: snapshotQuery.data.anomalies || [],
        collectiveInterests: snapshotQuery.data.collectiveInterests || { interests: [], confidence: 0 },
      });
    }
  }, [snapshotQuery.data]);

  return {
    sessionId,
    swarmData,
    isConnected,
    updateDigest,
    sendPulse,
    activeUsers: swarmData?.activeUsers || 0,
    topListings: swarmData?.topListings || [],
    topSearches: swarmData?.topSearches || [],
    anomalies: swarmData?.anomalies || [],
  };
}
