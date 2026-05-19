type AuctionEventPayload = {
  type: "bid" | "ended" | "tick";
  currentBid?: string;
  bidCount?: number;
  auctionEnd?: string | null;
  leaderId?: number | null;
  won?: boolean;
};

type Listener = (data: AuctionEventPayload) => void;

const channels = new Map<number, Set<Listener>>();

export function subscribeAuction(listingId: number, listener: Listener): () => void {
  let set = channels.get(listingId);
  if (!set) {
    set = new Set();
    channels.set(listingId, set);
  }
  set.add(listener);
  return () => {
    set?.delete(listener);
    if (set?.size === 0) channels.delete(listingId);
  };
}

export function publishAuctionEvent(listingId: number, payload: AuctionEventPayload) {
  const set = channels.get(listingId);
  if (!set) return;
  for (const fn of set) {
    try {
      fn(payload);
    } catch {
      /* ignore listener errors */
    }
  }
}

export type { AuctionEventPayload };
