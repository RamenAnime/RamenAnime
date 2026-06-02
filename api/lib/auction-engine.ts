import { getDb } from "../queries/connection";
import {
  marketplaceListings,
  auctionBids,
  orders,
  transactions,
  watchlistItems,
  auctionDeposits,
} from "@db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { publishAuctionEvent } from "./auction-events";
import { createNotification } from "./notify";

export function getMinBidIncrement(currentBid: number): number {
  if (currentBid < 1000) return 10;
  if (currentBid < 5000) return 100;
  if (currentBid < 10000) return 250;
  if (currentBid < 50000) return 500;
  return 1000;
}

export function getRequiredDeposit(startPrice: number): number {
  return Math.min(Math.max(Math.round(startPrice * 0.05), 500), 10000);
}

export function isValidBid(currentBid: number, newBid: number): boolean {
  return newBid >= currentBid + getMinBidIncrement(currentBid);
}

function generateOrderNumber() {
  return "ORD-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

function generateTransactionNumber() {
  return "TXN-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
}

export type ProxyBidder = { bidderId: number; maxAmount: number };

/** Collect each bidder's highest auto-bid ceiling on this listing. */
export async function getProxyCeilings(listingId: number): Promise<ProxyBidder[]> {
  const db = getDb();
  const bids = await db.query.auctionBids.findMany({
    where: eq(auctionBids.listingId, listingId),
    orderBy: desc(auctionBids.createdAt),
  });
  const map = new Map<number, number>();
  for (const b of bids) {
    const amount = parseFloat(String(b.amount));
    const proxy = b.proxyMax != null ? parseFloat(String(b.proxyMax)) : amount;
    const ceiling = Math.max(amount, proxy);
    const prev = map.get(b.bidderId) ?? 0;
    if (ceiling > prev) map.set(b.bidderId, ceiling);
  }
  return [...map.entries()].map(([bidderId, maxAmount]) => ({ bidderId, maxAmount }));
}

/** Second-price proxy resolution among bidder ceilings. */
export function resolveProxyPrice(
  ceilings: ProxyBidder[],
  startPrice: number
): { currentBid: number; leaderId: number | null } {
  if (ceilings.length === 0) {
    return { currentBid: startPrice, leaderId: null };
  }
  const sorted = [...ceilings].sort((a, b) => b.maxAmount - a.maxAmount);
  const leader = sorted[0];
  if (sorted.length === 1) {
    const inc = getMinBidIncrement(startPrice);
    const currentBid = Math.min(leader.maxAmount, Math.max(startPrice, startPrice + inc));
    return { currentBid, leaderId: leader.bidderId };
  }
  const second = sorted[1];
  const inc = getMinBidIncrement(second.maxAmount);
  let currentBid = Math.min(leader.maxAmount, second.maxAmount + inc);
  currentBid = Math.max(currentBid, startPrice + getMinBidIncrement(startPrice));
  return { currentBid, leaderId: leader.bidderId };
}

export function applyAntiSnipe(auctionEnd: Date | null, now = new Date()): Date | null {
  if (!auctionEnd) return null;
  const end = new Date(auctionEnd);
  if (end.getTime() - now.getTime() < 5 * 60 * 1000) {
    return new Date(end.getTime() + 5 * 60 * 1000);
  }
  return auctionEnd;
}

async function notifyOutbid(listingId: number, listingTitle: string, newLeaderId: number, previousLeaderId: number | null) {
  if (!previousLeaderId || previousLeaderId === newLeaderId) return;
  await createNotification({
    userId: previousLeaderId,
    type: "outbid",
    title: "You were outbid",
    message: `Someone placed a higher bid on "${listingTitle}".`,
    link: `/marketplace/${listingId}`,
  });
  const db = getDb();
  const watchers = await db.query.watchlistItems.findMany({
    where: and(eq(watchlistItems.listingId, listingId), eq(watchlistItems.notifyOutbid, true)),
  });
  for (const w of watchers) {
    if (w.userId === newLeaderId) continue;
    await createNotification({
      userId: w.userId,
      type: "auction_activity",
      title: "Auction activity",
      message: `New bid on "${listingTitle}" you're watching.`,
      link: `/marketplace/${listingId}`,
    });
  }
}

export async function createWinningOrder(
  listingId: number,
  buyerId: number,
  sellerId: number,
  winAmount: number,
  shippingCost = 0
) {
  const db = getDb();
  const existing = await db.query.orders.findFirst({
    where: and(eq(orders.listingId, listingId), eq(orders.status, "pending")),
  });
  if (existing) return { orderId: existing.id, orderNumber: existing.orderNumber };

  const orderNumber = generateOrderNumber();
  const paymentDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const total = winAmount + shippingCost;
  const [{ id: orderId }] = await db.insert(orders).values({
    orderNumber,
    buyerId,
    sellerId,
    listingId,
    totalAmount: total.toFixed(2),
    shippingCost: shippingCost.toFixed(2),
    currency: "USD",
    status: "pending",
    escrowStatus: "held",
    notes: JSON.stringify({ paymentDeadline: paymentDeadline.toISOString() }),
  }).$returningId();

  await db.insert(transactions).values({
    transactionNumber: generateTransactionNumber(),
    orderId,
    payerId: buyerId,
    payeeId: sellerId,
    amount: total.toFixed(2),
    currency: "USD",
    paymentMethod: "stripe",
    status: "pending",
  });

  await createNotification({
    userId: buyerId,
    type: "auction_won",
    title: "You won the auction",
    message: `Pay within 48 hours for order ${orderNumber}.`,
    link: `/marketplace/${listingId}?payment=success`,
  });

  return { orderId, orderNumber };
}

export type PlaceBidResult = {
  success: boolean;
  won: boolean;
  currentBid: string;
  orderId?: number;
  orderNumber?: string;
  message?: string;
  leaderId?: number | null;
};

export async function processBid(input: {
  listingId: number;
  bidderId: number;
  amount: string;
  proxyMax?: string;
}): Promise<PlaceBidResult> {
  const db = getDb();
  const listing = await db.query.marketplaceListings.findFirst({
    where: eq(marketplaceListings.id, input.listingId),
  });
  if (!listing) throw new Error("Listing not found");
  if (listing.listingType !== "auction") throw new Error("Not an auction");
  if (listing.sellerId === input.bidderId) throw new Error("Cannot bid on own listing");
  if (listing.auctionEnd && new Date(listing.auctionEnd) < new Date()) throw new Error("Auction ended");

  const bidAmount = parseFloat(input.amount);
  const manualMax = input.proxyMax ? parseFloat(input.proxyMax) : bidAmount;
  const userCeiling = Math.max(bidAmount, manualMax);

  const currentBid = parseFloat(listing.currentBid || listing.startPrice || "0");
  const minBid = currentBid + getMinBidIncrement(currentBid);
  if (bidAmount < minBid) {
    throw new Error(`Minimum bid is $${minBid} (+$${getMinBidIncrement(currentBid)})`);
  }

  const depositRequired = parseFloat(listing.startPrice || "0") >= 5000;
  if (depositRequired) {
    const deposit = await db.query.auctionDeposits.findFirst({
      where: and(
        eq(auctionDeposits.listingId, input.listingId),
        eq(auctionDeposits.bidderId, input.bidderId),
        eq(auctionDeposits.status, "held")
      ),
    });
    if (!deposit) {
      throw new Error(
        `Deposit required: $${getRequiredDeposit(parseFloat(listing.startPrice || "0"))}. Use the deposit endpoint first.`
      );
    }
  }

  const previousLeader = (await getProxyCeilings(input.listingId))[0]?.bidderId ?? null;

  await db.insert(auctionBids).values({
    listingId: input.listingId,
    bidderId: input.bidderId,
    amount: bidAmount.toFixed(2),
    proxyMax: userCeiling.toFixed(2),
    isProxy: userCeiling > bidAmount,
    isAutoBid: false,
  });

  let ceilings = await getProxyCeilings(input.listingId);
  const hasBidder = ceilings.some((c) => c.bidderId === input.bidderId);
  if (!hasBidder) ceilings.push({ bidderId: input.bidderId, maxAmount: userCeiling });
  else {
    ceilings = ceilings.map((c) =>
      c.bidderId === input.bidderId ? { ...c, maxAmount: Math.max(c.maxAmount, userCeiling) } : c
    );
  }

  const startPrice = parseFloat(listing.startPrice || listing.price || "0");
  const { currentBid: resolved, leaderId } = resolveProxyPrice(ceilings, startPrice);
  const newAuctionEnd = applyAntiSnipe(listing.auctionEnd ? new Date(listing.auctionEnd) : null);

  const buyNow = listing.buyNowPrice ? parseFloat(listing.buyNowPrice) : null;
  if (buyNow != null && resolved >= buyNow) {
    await db
      .update(marketplaceListings)
      .set({
        isActive: false,
        currentBid: buyNow.toFixed(2),
        bidCount: sql`${marketplaceListings.bidCount} + 1`,
        auctionEnd: newAuctionEnd,
      })
      .where(eq(marketplaceListings.id, input.listingId));

    const { orderId, orderNumber } = await createWinningOrder(
      input.listingId,
      input.bidderId,
      listing.sellerId,
      buyNow,
      parseFloat(listing.shippingCost || "0")
    );

    publishAuctionEvent(input.listingId, {
      type: "ended",
      currentBid: buyNow.toFixed(2),
      bidCount: (listing.bidCount || 0) + 1,
      auctionEnd: newAuctionEnd?.toISOString() ?? null,
      won: true,
    });

    return {
      success: true,
      won: true,
      currentBid: buyNow.toFixed(2),
      orderId,
      orderNumber,
      message: "Buy-now price met! You won!",
      leaderId: input.bidderId,
    };
  }

  await db
    .update(marketplaceListings)
    .set({
      currentBid: resolved.toFixed(2),
      bidCount: sql`${marketplaceListings.bidCount} + 1`,
      auctionEnd: newAuctionEnd,
    })
    .where(eq(marketplaceListings.id, input.listingId));

  if (leaderId) await notifyOutbid(input.listingId, listing.title, leaderId, previousLeader ?? null);

  publishAuctionEvent(input.listingId, {
    type: "bid",
    currentBid: resolved.toFixed(2),
    bidCount: (listing.bidCount || 0) + 1,
    auctionEnd: newAuctionEnd?.toISOString() ?? null,
    leaderId,
  });

  return {
    success: true,
    won: false,
    currentBid: resolved.toFixed(2),
    leaderId,
  };
}

/** Set auto-bid max only (proxy bidding ceiling). */
export async function setAutoBidMax(input: {
  listingId: number;
  bidderId: number;
  maxAmount: string;
}): Promise<PlaceBidResult> {
  const max = parseFloat(input.maxAmount);
  const db = getDb();
  const listing = await db.query.marketplaceListings.findFirst({
    where: eq(marketplaceListings.id, input.listingId),
  });
  if (!listing) throw new Error("Listing not found");
  const current = parseFloat(listing.currentBid || listing.startPrice || "0");
  const minBid = current + getMinBidIncrement(current);
  const amount = Math.max(minBid, max);
  return processBid({
    listingId: input.listingId,
    bidderId: input.bidderId,
    amount: amount.toFixed(2),
    proxyMax: max.toFixed(2),
  });
}
