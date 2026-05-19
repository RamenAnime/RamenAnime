import type { Context } from "hono";
import { streamSSE } from "hono/streaming";
import { getDb } from "../queries/connection";
import { marketplaceListings } from "@db/schema";
import { eq } from "drizzle-orm";
import { subscribeAuction } from "../lib/auction-events";

export function auctionStreamHandler(listingId: number) {
  return (c: Context) =>
    streamSSE(c, async (stream) => {
      const db = getDb();
      const listing = await db.query.marketplaceListings.findFirst({
        where: eq(marketplaceListings.id, listingId),
      });
      if (!listing) {
        await stream.writeSSE({ event: "error", data: JSON.stringify({ message: "Not found" }) });
        return;
      }

      const sendSnapshot = async () => {
        const fresh = await db.query.marketplaceListings.findFirst({
          where: eq(marketplaceListings.id, listingId),
        });
        if (!fresh) return;
        await stream.writeSSE({
          event: "snapshot",
          data: JSON.stringify({
            currentBid: fresh.currentBid,
            bidCount: fresh.bidCount,
            auctionEnd: fresh.auctionEnd,
            isActive: fresh.isActive,
          }),
        });
      };

      await sendSnapshot();

      const unsubscribe = subscribeAuction(listingId, async (payload) => {
        await stream.writeSSE({ event: "update", data: JSON.stringify(payload) });
        if (payload.type === "ended") return;
      });

      const heartbeat = setInterval(() => {
        void stream.writeSSE({ event: "tick", data: JSON.stringify({ ts: Date.now() }) });
        void sendSnapshot();
      }, 5000);

      try {
        // Keep connection open until client disconnects
        await new Promise<void>((resolve) => {
          c.req.raw.signal.addEventListener("abort", () => resolve(), { once: true });
        });
      } finally {
        clearInterval(heartbeat);
        unsubscribe();
      }
    });
}
