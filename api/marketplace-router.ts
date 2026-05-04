import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  marketplaceListings, auctionBids, watchlistItems, listingQuestions,
  sellerRatings, listingViews, priceOffers, auctionDeposits, sellerProfiles,
  listingMedia, copyrightScans,
} from "@db/schema";
import { eq, and, desc, sql, count, avg, gte } from "drizzle-orm";
import { runCopyrightScan } from "./lib/copyright-bot";

function getMinBidIncrement(currentBid: number): number {
  if (currentBid < 1000) return 10;
  if (currentBid < 5000) return 100;
  if (currentBid < 10000) return 250;
  if (currentBid < 50000) return 500;
  return 1000;
}

function getRequiredDeposit(startPrice: number): number {
  return Math.min(Math.max(Math.round(startPrice * 0.05), 500), 10000);
}

async function ensureSellerProfile(userId: number) {
  const db = getDb();
  let profile = await db.query.sellerProfiles.findFirst({
    where: eq(sellerProfiles.userId, userId),
  });
  if (!profile) {
    await db.insert(sellerProfiles).values({ userId });
    profile = await db.query.sellerProfiles.findFirst({
      where: eq(sellerProfiles.userId, userId),
    });
  }
  return profile;
}

async function recalculateSellerLevel(userId: number) {
  const db = getDb();
  const profile = await ensureSellerProfile(userId);
  const sales = profile?.totalSales || 0;
  const rating = parseFloat(profile?.avgRating || "0");
  let level = "bronze";
  if (sales >= 500 && rating >= 4.8) level = "diamond";
  else if (sales >= 200 && rating >= 4.5) level = "platinum";
  else if (sales >= 50 && rating >= 4.0) level = "gold";
  else if (sales >= 10 && rating >= 3.5) level = "silver";
  await db.update(sellerProfiles).set({ level: level as any }).where(eq(sellerProfiles.userId, userId));
}

export const marketplaceRouter = createRouter({
  listListings: publicQuery
    .input(z.object({
      category: z.string().optional(),
      condition: z.string().optional(),
      listingType: z.enum(["fixed", "auction", "all"]).default("all"),
      search: z.string().optional(),
      sortBy: z.enum(["newest", "price_asc", "price_desc", "ending_soon", "popular"]).default("newest"),
      limit: z.number().min(1).max(50).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(marketplaceListings.isActive, true)];
      if (input.category) conditions.push(eq(marketplaceListings.category, input.category));
      if (input.condition) conditions.push(eq(marketplaceListings.condition, input.condition as any));
      if (input.listingType !== "all") conditions.push(eq(marketplaceListings.listingType, input.listingType));
      const whereClause = and(...conditions);
      let orderBy;
      switch (input.sortBy) {
        case "price_asc": orderBy = marketplaceListings.price; break;
        case "price_desc": orderBy = desc(marketplaceListings.price); break;
        case "ending_soon": orderBy = marketplaceListings.auctionEnd; break;
        case "popular": orderBy = desc(marketplaceListings.bidCount); break;
        default: orderBy = desc(marketplaceListings.createdAt);
      }
      const items = await db.query.marketplaceListings.findMany({
        where: whereClause, with: { seller: true, media: true },
        orderBy, limit: input.limit, offset: input.offset,
      });
      let result = items;
      if (input.search) {
        const q = input.search.toLowerCase();
        result = items.filter(l => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q));
      }
      return Promise.all(result.map(async (item) => {
        const viewCount = await db.select({ count: count() }).from(listingViews).where(eq(listingViews.listingId, item.id));
        return { ...item, viewCount: viewCount[0]?.count || 0 };
      }));
    }),

  getListing: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const listing = await db.query.marketplaceListings.findFirst({
        where: eq(marketplaceListings.id, input.id),
        with: { seller: true, media: true },
      });
      if (!listing) return null;
      const viewCount = await db.select({ count: count() }).from(listingViews).where(eq(listingViews.listingId, input.id));
      const sellerProfile = await db.query.sellerProfiles.findFirst({
        where: eq(sellerProfiles.userId, listing.sellerId),
      });
      const ratings = await db.select({ avg: avg(sellerRatings.rating), count: count() })
        .from(sellerRatings).where(eq(sellerRatings.sellerId, listing.sellerId));
      return {
        ...listing, viewCount: viewCount[0]?.count || 0, sellerProfile,
        sellerAvgRating: ratings[0]?.avg ? parseFloat(ratings[0].avg).toFixed(1) : "0",
        sellerRatingCount: ratings[0]?.count || 0,
      };
    }),

  createListing: authedQuery
    .input(z.object({
      title: z.string().min(1).max(255),
      description: z.string().min(1),
      price: z.string().min(1).max(50),
      condition: z.enum(["new", "used", "like_new"]).default("new"),
      category: z.string().max(50).default("general"),
      listingType: z.enum(["fixed", "auction"]).default("fixed"),
      startPrice: z.string().optional(),
      reservePrice: z.string().optional(),
      buyNowPrice: z.string().optional(),
      auctionEnd: z.string().optional(),
      images: z.array(z.string()).optional(),
      videos: z.array(z.string()).optional(),
      contactMethod: z.string().max(255).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const values: any = {
        sellerId: ctx.user.id, title: input.title, description: input.description,
        price: input.price, condition: input.condition, category: input.category,
        listingType: input.listingType, contactMethod: input.contactMethod,
        images: input.images ? JSON.stringify(input.images) : null,
        videos: input.videos ? JSON.stringify(input.videos) : null,
      };
      if (input.listingType === "auction") {
        values.startPrice = input.startPrice || input.price;
        values.currentBid = input.startPrice || input.price;
        values.reservePrice = input.reservePrice;
        values.buyNowPrice = input.buyNowPrice;
        values.auctionEnd = input.auctionEnd ? new Date(input.auctionEnd) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      }
      const [{ id }] = await db.insert(marketplaceListings).values(values).$returningId();
      await ensureSellerProfile(ctx.user.id);
      try { runCopyrightScan(id, input.title, input.description, input.images || []); } catch {}
      return db.query.marketplaceListings.findFirst({
        where: eq(marketplaceListings.id, id), with: { seller: true },
      });
    }),

  deleteListing: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const listing = await db.query.marketplaceListings.findFirst({ where: eq(marketplaceListings.id, input.id) });
      if (!listing || listing.sellerId !== ctx.user.id) throw new Error("Unauthorized");
      await db.delete(marketplaceListings).where(eq(marketplaceListings.id, input.id));
      return { success: true };
    }),

  myListings: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.marketplaceListings.findMany({
      where: eq(marketplaceListings.sellerId, ctx.user.id),
      with: { seller: true }, orderBy: desc(marketplaceListings.createdAt),
    });
  }),

  trackView: publicQuery.input(z.object({ listingId: z.number() })).mutation(async ({ input }) => {
    const db = getDb();
    await db.insert(listingViews).values({ listingId: input.listingId });
    return { success: true };
  }),

  getPopularity: publicQuery.input(z.object({ listingId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const views = await db.select({ count: count() }).from(listingViews).where(eq(listingViews.listingId, input.listingId));
    const bids = await db.select({ count: count() }).from(auctionBids).where(eq(auctionBids.listingId, input.listingId));
    const viewCount = views[0]?.count || 0;
    let heat = "low";
    if (viewCount > 100 && (bids[0]?.count || 0) > 5) heat = "hot";
    else if (viewCount > 30 || (bids[0]?.count || 0) > 2) heat = "warm";
    return { views: viewCount, bids: bids[0]?.count || 0, heat };
  }),

  placeBid: authedQuery
    .input(z.object({ listingId: z.number(), amount: z.string().min(1), proxyMax: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const listing = await db.query.marketplaceListings.findFirst({ where: eq(marketplaceListings.id, input.listingId) });
      if (!listing) throw new Error("Listing not found");
      if (listing.listingType !== "auction") throw new Error("Not an auction");
      if (listing.sellerId === ctx.user.id) throw new Error("Cannot bid on own listing");
      if (listing.auctionEnd && new Date(listing.auctionEnd) < new Date()) throw new Error("Auction ended");
      const bidAmount = parseFloat(input.amount);
      const currentBid = parseFloat(listing.currentBid || "0");
      const minIncrement = getMinBidIncrement(currentBid);
      const minBid = currentBid + minIncrement;
      if (bidAmount < minBid) throw new Error(`Minimum bid is $${minBid} (+$${minIncrement})`);

      const depositRequired = parseFloat(listing.startPrice || "0") >= 5000;
      if (depositRequired) {
        const deposit = await db.query.auctionDeposits.findFirst({
          where: and(eq(auctionDeposits.listingId, input.listingId), eq(auctionDeposits.bidderId, ctx.user.id), eq(auctionDeposits.status, "held")),
        });
        if (!deposit) {
          const required = getRequiredDeposit(parseFloat(listing.startPrice || "0"));
          throw new Error(`Deposit required: $${required}. Use the deposit endpoint first.`);
        }
      }

      const now = new Date();
      const auctionEnd = listing.auctionEnd ? new Date(listing.auctionEnd) : null;
      let newAuctionEnd = listing.auctionEnd;
      if (auctionEnd && auctionEnd.getTime() - now.getTime() < 5 * 60 * 1000) {
        newAuctionEnd = new Date(auctionEnd.getTime() + 5 * 60 * 1000);
      }

      if (listing.buyNowPrice && bidAmount >= parseFloat(listing.buyNowPrice)) {
        await db.update(marketplaceListings).set({ isActive: false, currentBid: input.amount, bidCount: sql`${marketplaceListings.bidCount} + 1`, auctionEnd: newAuctionEnd }).where(eq(marketplaceListings.id, input.listingId));
        await db.insert(auctionBids).values({ listingId: input.listingId, bidderId: ctx.user.id, amount: input.amount, proxyMax: input.proxyMax || null, isProxy: !!input.proxyMax, isAutoBid: false });
        return { success: true, won: true, message: "Buy-now price met! You won!" };
      }

      await db.update(marketplaceListings).set({ currentBid: input.amount, bidCount: sql`${marketplaceListings.bidCount} + 1`, auctionEnd: newAuctionEnd }).where(eq(marketplaceListings.id, input.listingId));
      await db.insert(auctionBids).values({ listingId: input.listingId, bidderId: ctx.user.id, amount: input.amount, proxyMax: input.proxyMax || null, isProxy: !!input.proxyMax, isAutoBid: false });
      return { success: true, won: false, currentBid: input.amount };
    }),

  getBidHistory: publicQuery.input(z.object({ listingId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const bids = await db.query.auctionBids.findMany({
      where: eq(auctionBids.listingId, input.listingId),
      with: { bidder: true }, orderBy: desc(auctionBids.amount), limit: 50,
    });
    const priceHistory = bids.slice().reverse().map((b: any, i: number) => ({ bid: i + 1, amount: parseFloat(b.amount), time: new Date(b.createdAt).getTime() }));
    return { bids, priceHistory };
  }),

  getDepositInfo: publicQuery.input(z.object({ listingId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    const listing = await db.query.marketplaceListings.findFirst({ where: eq(marketplaceListings.id, input.listingId) });
    if (!listing) throw new Error("Listing not found");
    const required = getRequiredDeposit(parseFloat(listing.startPrice || "0"));
    return { required, isRequired: parseFloat(listing.startPrice || "0") >= 5000 };
  }),

  payDeposit: authedQuery.input(z.object({ listingId: z.number() })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const listing = await db.query.marketplaceListings.findFirst({ where: eq(marketplaceListings.id, input.listingId) });
    if (!listing) throw new Error("Listing not found");
    const amount = getRequiredDeposit(parseFloat(listing.startPrice || "0"));
    const existing = await db.query.auctionDeposits.findFirst({
      where: and(eq(auctionDeposits.listingId, input.listingId), eq(auctionDeposits.bidderId, ctx.user.id)),
    });
    if (existing) return { success: true, alreadyPaid: true, amount };
    await db.insert(auctionDeposits).values({ listingId: input.listingId, bidderId: ctx.user.id, amount: amount.toString() });
    return { success: true, alreadyPaid: false, amount };
  }),

  makeOffer: authedQuery.input(z.object({ listingId: z.number(), offeredPrice: z.string().min(1), message: z.string().max(500).optional() })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const listing = await db.query.marketplaceListings.findFirst({ where: eq(marketplaceListings.id, input.listingId) });
    if (!listing) throw new Error("Listing not found");
    if (listing.listingType !== "fixed") throw new Error("Offers only on fixed-price items");
    if (listing.sellerId === ctx.user.id) throw new Error("Cannot offer on own listing");
    const [{ id }] = await db.insert(priceOffers).values({ listingId: input.listingId, buyerId: ctx.user.id, offeredPrice: input.offeredPrice, message: input.message, expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000) }).$returningId();
    return { success: true, offerId: id };
  }),

  respondToOffer: authedQuery.input(z.object({ offerId: z.number(), response: z.enum(["accept", "reject", "counter"]), counterPrice: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const offer = await db.query.priceOffers.findFirst({ where: eq(priceOffers.id, input.offerId), with: { listing: true } });
    if (!offer) throw new Error("Offer not found");
    if (offer.listing.sellerId !== ctx.user.id) throw new Error("Only seller can respond");
    if (input.response === "accept") {
      await db.update(priceOffers).set({ status: "accepted" }).where(eq(priceOffers.id, input.offerId));
      await db.update(marketplaceListings).set({ price: offer.offeredPrice }).where(eq(marketplaceListings.id, offer.listingId));
      return { success: true, status: "accepted", newPrice: offer.offeredPrice };
    } else if (input.response === "reject") {
      await db.update(priceOffers).set({ status: "rejected" }).where(eq(priceOffers.id, input.offerId));
      return { success: true, status: "rejected" };
    } else if (input.response === "counter" && input.counterPrice) {
      await db.update(priceOffers).set({ status: "countered", counterPrice: input.counterPrice }).where(eq(priceOffers.id, input.offerId));
      return { success: true, status: "countered", counterPrice: input.counterPrice };
    }
    throw new Error("Invalid response");
  }),

  getOffers: authedQuery.input(z.object({ listingId: z.number().optional() })).query(async ({ ctx, input }) => {
    const db = getDb();
    if (input.listingId) {
      const listing = await db.query.marketplaceListings.findFirst({ where: eq(marketplaceListings.id, input.listingId) });
      if (listing?.sellerId === ctx.user.id) {
        return db.query.priceOffers.findMany({ where: eq(priceOffers.listingId, input.listingId), with: { buyer: true }, orderBy: desc(priceOffers.createdAt) });
      }
    }
    return db.query.priceOffers.findMany({ where: eq(priceOffers.buyerId, ctx.user.id), with: { listing: true }, orderBy: desc(priceOffers.createdAt) });
  }),

  rateSeller: authedQuery.input(z.object({ sellerId: z.number(), listingId: z.number(), rating: z.number().min(1).max(5), comment: z.string().max(1000).optional() })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    if (input.sellerId === ctx.user.id) throw new Error("Cannot rate yourself");
    await db.insert(sellerRatings).values({ sellerId: input.sellerId, raterId: ctx.user.id, listingId: input.listingId, rating: input.rating, comment: input.comment });
    const allRatings = await db.select().from(sellerRatings).where(eq(sellerRatings.sellerId, input.sellerId));
    const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
    await db.update(sellerProfiles).set({ avgRating: avgRating.toFixed(2), ratingCount: allRatings.length }).where(eq(sellerProfiles.userId, input.sellerId));
    await recalculateSellerLevel(input.sellerId);
    return { success: true };
  }),

  getSellerRatings: publicQuery.input(z.object({ sellerId: z.number(), limit: z.number().default(10) })).query(async ({ input }) => {
    const db = getDb();
    const ratings = await db.query.sellerRatings.findMany({ where: eq(sellerRatings.sellerId, input.sellerId), with: { rater: true }, orderBy: desc(sellerRatings.createdAt), limit: input.limit });
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const r of ratings) distribution[r.rating as keyof typeof distribution]++;
    return { ratings, distribution };
  }),

  toggleWatchlist: authedQuery.input(z.object({ listingId: z.number() })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const existing = await db.query.watchlistItems.findFirst({ where: and(eq(watchlistItems.userId, ctx.user.id), eq(watchlistItems.listingId, input.listingId)) });
    if (existing) { await db.delete(watchlistItems).where(eq(watchlistItems.id, existing.id)); return { watching: false }; }
    await db.insert(watchlistItems).values({ userId: ctx.user.id, listingId: input.listingId });
    return { watching: true };
  }),

  isWatching: authedQuery.input(z.object({ listingId: z.number() })).query(async ({ ctx, input }) => {
    const db = getDb();
    const item = await db.query.watchlistItems.findFirst({ where: and(eq(watchlistItems.userId, ctx.user.id), eq(watchlistItems.listingId, input.listingId)) });
    return { watching: !!item };
  }),

  myWatchlist: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    return db.query.watchlistItems.findMany({ where: eq(watchlistItems.userId, ctx.user.id), with: { listing: { with: { seller: true, media: true } } }, orderBy: desc(watchlistItems.createdAt) });
  }),

  askQuestion: authedQuery.input(z.object({ listingId: z.number(), question: z.string().min(1).max(500) })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const [{ id }] = await db.insert(listingQuestions).values({ listingId: input.listingId, askerId: ctx.user.id, question: input.question, isPublic: true }).$returningId();
    return db.query.listingQuestions.findFirst({ where: eq(listingQuestions.id, id), with: { asker: true } });
  }),

  answerQuestion: authedQuery.input(z.object({ questionId: z.number(), answer: z.string().min(1).max(1000) })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const q = await db.query.listingQuestions.findFirst({ where: eq(listingQuestions.id, input.questionId), with: { listing: true } });
    if (!q || q.listing.sellerId !== ctx.user.id) throw new Error("Only seller can answer");
    await db.update(listingQuestions).set({ answer: input.answer, answeredAt: new Date() }).where(eq(listingQuestions.id, input.questionId));
    return { success: true };
  }),

  getQuestions: publicQuery.input(z.object({ listingId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.query.listingQuestions.findMany({ where: eq(listingQuestions.listingId, input.listingId), with: { asker: true }, orderBy: desc(listingQuestions.createdAt) });
  }),

  relatedItems: publicQuery.input(z.object({ listingId: z.number(), limit: z.number().default(6) })).query(async ({ input }) => {
    const db = getDb();
    const current = await db.query.marketplaceListings.findFirst({ where: eq(marketplaceListings.id, input.listingId) });
    if (!current) return [];
    return db.query.marketplaceListings.findMany({ where: and(eq(marketplaceListings.category, current.category), eq(marketplaceListings.isActive, true)), with: { seller: true }, limit: input.limit, orderBy: desc(marketplaceListings.createdAt) });
  }),

  addMedia: authedQuery.input(z.object({ listingId: z.number(), mediaType: z.enum(["image", "video"]), url: z.string(), thumbnailUrl: z.string().optional(), fileSize: z.number().optional() })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const listing = await db.query.marketplaceListings.findFirst({ where: eq(marketplaceListings.id, input.listingId) });
    if (!listing || listing.sellerId !== ctx.user.id) throw new Error("Unauthorized");
    const [{ id }] = await db.insert(listingMedia).values({ listingId: input.listingId, mediaType: input.mediaType, url: input.url, thumbnailUrl: input.thumbnailUrl, fileSize: input.fileSize, compressed: true }).$returningId();
    return { id };
  }),

  scanStatus: publicQuery.input(z.object({ listingId: z.number() })).query(async ({ input }) => {
    const db = getDb();
    return db.query.copyrightScans.findMany({ where: eq(copyrightScans.listingId, input.listingId) });
  }),
});
