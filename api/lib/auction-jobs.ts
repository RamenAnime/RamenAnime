import { getDb } from "../queries/connection";
import { marketplaceListings, orders, watchlistItems } from "@db/schema";
import { eq, and, lte } from "drizzle-orm";
import { getProxyCeilings, resolveProxyPrice, createWinningOrder } from "./auction-engine";
import { createNotification as notify } from "./notify";
import { publishAuctionEvent } from "./auction-events";

const PAYMENT_DEADLINE_MS = 48 * 60 * 60 * 1000;

function parsePaymentDeadline(notes: string | null): Date | null {
  if (!notes) return null;
  try {
    const j = JSON.parse(notes);
    if (j.paymentDeadline) return new Date(j.paymentDeadline);
  } catch {
    /* ignore */
  }
  return null;
}

/** Close auctions past auctionEnd; enforce reserve; create orders for winners. */
export async function processEndedAuctions(): Promise<{ closed: number }> {
  const db = getDb();
  const now = new Date();
  const ended = await db.query.marketplaceListings.findMany({
    where: and(
      eq(marketplaceListings.listingType, "auction"),
      eq(marketplaceListings.isActive, true),
      lte(marketplaceListings.auctionEnd, now)
    ),
  });

  let closed = 0;
  for (const listing of ended) {
    const ceilings = await getProxyCeilings(listing.id);
    const start = parseFloat(listing.startPrice || listing.price || "0");
    const reserve = listing.reservePrice ? parseFloat(listing.reservePrice) : 0;
    const { currentBid, leaderId } = resolveProxyPrice(ceilings, start);

    if (!leaderId || (reserve > 0 && currentBid < reserve)) {
      await db
        .update(marketplaceListings)
        .set({ isActive: false, currentBid: currentBid.toFixed(2) })
        .where(eq(marketplaceListings.id, listing.id));
      await notify({
        userId: listing.sellerId,
        type: "auction_unsold",
        title: "Auction ended - reserve not met",
        message: `"${listing.title}" ended without meeting reserve.`,
        link: `/marketplace/${listing.id}`,
      });
      publishAuctionEvent(listing.id, { type: "ended", currentBid: currentBid.toFixed(2), won: false });
      closed++;
      continue;
    }

    const shipping = parseFloat(listing.shippingCost || "0");
    await createWinningOrder(listing.id, leaderId, listing.sellerId, currentBid, shipping);
    await db
      .update(marketplaceListings)
      .set({ isActive: false, currentBid: currentBid.toFixed(2) })
      .where(eq(marketplaceListings.id, listing.id));

    const watchers = await db.query.watchlistItems.findMany({
      where: and(eq(watchlistItems.listingId, listing.id), eq(watchlistItems.notifyEnding, true)),
    });
    for (const w of watchers) {
      if (w.userId === leaderId) continue;
      await notify({
        userId: w.userId,
        type: "auction_ended",
        title: "Watched auction ended",
        message: `"${listing.title}" has ended.`,
        link: `/marketplace/${listing.id}`,
      });
    }

    publishAuctionEvent(listing.id, {
      type: "ended",
      currentBid: currentBid.toFixed(2),
      leaderId,
      won: true,
    });
    closed++;
  }
  return { closed };
}

/** Cancel unpaid orders past payment deadline. */
export async function processPaymentDeadlines(): Promise<{ cancelled: number }> {
  const db = getDb();
  const pending = await db.query.orders.findMany({
    where: eq(orders.status, "pending"),
    with: { listing: true },
  });

  let cancelled = 0;
  const now = Date.now();
  for (const order of pending) {
    const deadline = parsePaymentDeadline(order.notes);
    if (!deadline || deadline.getTime() > now) continue;

    await db.update(orders).set({ status: "cancelled" }).where(eq(orders.id, order.id));
    if (order.listingId) {
      await db
        .update(marketplaceListings)
        .set({ isActive: true })
        .where(eq(marketplaceListings.id, order.listingId));
    }
    await notify({
      userId: order.buyerId,
      type: "payment_expired",
      title: "Payment deadline passed",
      message: `Order ${order.orderNumber} was cancelled. The listing may be available again.`,
      link: order.listingId ? `/marketplace/${order.listingId}` : "/orders",
    });
    cancelled++;
  }
  return { cancelled };
}

export async function runAuctionMaintenance() {
  const auctions = await processEndedAuctions();
  const payments = await processPaymentDeadlines();
  return { ...auctions, ...payments };
}
