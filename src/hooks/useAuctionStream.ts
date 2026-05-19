import { useEffect, useRef, useState, useCallback } from "react";

export type AuctionStreamState = {
  currentBid?: string | null;
  bidCount?: number;
  auctionEnd?: string | Date | null;
  isActive?: boolean;
  connected: boolean;
};

export function useAuctionStream(listingId: number, enabled: boolean) {
  const [state, setState] = useState<AuctionStreamState>({ connected: false });
  const esRef = useRef<EventSource | null>(null);

  const disconnect = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
    setState((s) => ({ ...s, connected: false }));
  }, []);

  useEffect(() => {
    if (!enabled || listingId <= 0) return;

    const url = `/api/auctions/${listingId}/stream`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => setState((s) => ({ ...s, connected: true }));

    const onSnapshot = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data);
        setState((s) => ({ ...s, connected: true, ...data }));
      } catch {
        /* ignore */
      }
    };

    const onUpdate = (ev: MessageEvent) => {
      try {
        const data = JSON.parse(ev.data);
        setState((s) => ({
          ...s,
          connected: true,
          currentBid: data.currentBid ?? s.currentBid,
          bidCount: data.bidCount ?? s.bidCount,
          auctionEnd: data.auctionEnd ?? s.auctionEnd,
          isActive: data.type === "ended" ? false : s.isActive,
        }));
      } catch {
        /* ignore */
      }
    };

    es.addEventListener("snapshot", onSnapshot);
    es.addEventListener("update", onUpdate);
    es.addEventListener("tick", onSnapshot);

    es.onerror = () => {
      setState((s) => ({ ...s, connected: false }));
    };

    return () => {
      es.removeEventListener("snapshot", onSnapshot);
      es.removeEventListener("update", onUpdate);
      es.removeEventListener("tick", onSnapshot);
      es.close();
    };
  }, [listingId, enabled, disconnect]);

  return { ...state, disconnect };
}
