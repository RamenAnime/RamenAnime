import {
  decimal,
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  boolean,
} from "drizzle-orm/mysql-core";
import {
  relations,
} from "drizzle-orm";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).unique(),
  username: varchar("username", { length: 50 }).unique(),
  passwordHash: varchar("password_hash", { length: 255 }),
  authType: mysqlEnum("auth_type", ["oauth", "local"]).default("oauth").notNull(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  isBanned: boolean("is_banned").default(false).notNull(),
  isEmailVerified: boolean("is_email_verified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const userProfiles = mysqlTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }),
  headline: varchar("headline", { length: 255 }),
  aboutMe: text("about_me"),
  interests: text("interests"),
  favoriteAnime: text("favorite_anime"),
  favoriteGames: text("favorite_games"),
  profileSong: varchar("profile_song", { length: 500 }),
  profileSongUrl: varchar("profile_song_url", { length: 500 }),
  backgroundColor: varchar("background_color", { length: 20 }).default("#0a0a0a"),
  backgroundImage: text("background_image"),
  textColor: varchar("text_color", { length: 20 }).default("#e5e5e5"),
  accentColor: varchar("accent_color", { length: 20 }).default("#d4a853"),
  mood: varchar("mood", { length: 100 }),
  location: varchar("location", { length: 100 }),
  website: varchar("website", { length: 255 }),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

export const forumPosts = mysqlTable("forum_posts", {
  id: serial("id").primaryKey(),
  authorId: bigint("authorId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 50 }).default("general").notNull(),
  likes: int("likes").default(0).notNull(),
  parentId: bigint("parent_id", { mode: "number", unsigned: true }),
  views: int("views").default(0).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isLocked: boolean("is_locked").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type ForumPost = typeof forumPosts.$inferSelect;
export type InsertForumPost = typeof forumPosts.$inferInsert;

export const forumComments = mysqlTable("forum_comments", {
  id: serial("id").primaryKey(),
  postId: bigint("postId", { mode: "number", unsigned: true }).notNull(),
  authorId: bigint("authorId", { mode: "number", unsigned: true }).notNull(),
  content: text("content").notNull(),
  likes: int("likes").default(0).notNull(),
  parentId: bigint("parent_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type ForumComment = typeof forumComments.$inferSelect;
export type InsertForumComment = typeof forumComments.$inferInsert;

export const friends = mysqlTable("friends", {
  id: serial("id").primaryKey(),
  requesterId: bigint("requesterId", { mode: "number", unsigned: true }).notNull(),
  addresseeId: bigint("addresseeId", { mode: "number", unsigned: true }).notNull(),
  status: mysqlEnum("status", ["pending", "accepted", "declined", "blocked"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type Friend = typeof friends.$inferSelect;
export type InsertFriend = typeof friends.$inferInsert;

export const tosAcceptances = mysqlTable("tos_acceptances", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  version: varchar("version", { length: 20 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TosAcceptance = typeof tosAcceptances.$inferSelect;
export type InsertTosAcceptance = typeof tosAcceptances.$inferInsert;

export const marketplaceListings = mysqlTable("marketplace_listings", {
  id: serial("id").primaryKey(),
  sellerId: bigint("sellerId", { mode: "number", unsigned: true }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  price: varchar("price", { length: 50 }).notNull(),
  condition: mysqlEnum("condition", ["new", "used", "like_new"]).default("new").notNull(),
  category: varchar("category", { length: 50 }).default("general").notNull(),
  images: text("images"),
  contactMethod: varchar("contact_method", { length: 255 }),
  isActive: boolean("is_active").default(true).notNull(),
  listingType: mysqlEnum("listing_type", ["fixed", "auction"]).default("fixed").notNull(),
  startPrice: varchar("start_price", { length: 50 }),
  reservePrice: varchar("reserve_price", { length: 50 }),
  buyNowPrice: varchar("buy_now_price", { length: 50 }),
  currentBid: varchar("current_bid", { length: 50 }),
  bidCount: int("bid_count").default(0).notNull(),
  auctionEnd: timestamp("auction_end"),
  videos: text("videos"),
  copyrightStatus: mysqlEnum("copyright_status", ["pending", "clear", "flagged", "rejected"]).default("pending").notNull(),
  scanDetails: text("scan_details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type MarketplaceListing = typeof marketplaceListings.$inferSelect;
export type InsertMarketplaceListing = typeof marketplaceListings.$inferInsert;

// --- Listing Media ---
export const listingMedia = mysqlTable("listing_media", {
  id: serial("id").primaryKey(),
  listingId: bigint("listing_id", { mode: "number", unsigned: true }).notNull(),
  mediaType: mysqlEnum("media_type", ["image", "video", "audio"]).notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  fileSize: int("file_size"),
  compressed: boolean("compressed").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ListingMedia = typeof listingMedia.$inferSelect;
export type InsertListingMedia = typeof listingMedia.$inferInsert;

export const geoVerifications = mysqlTable("geo_verifications", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  countryCode: varchar("country_code", { length: 10 }).notNull(),
  countryName: varchar("country_name", { length: 100 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  ageVerified: boolean("age_verified").default(false).notNull(),
  idVerified: boolean("id_verified").default(false).notNull(),
  selfieVerified: boolean("selfie_verified").default(false).notNull(),
  blocked: boolean("blocked").default(false).notNull(),
  blockReason: text("block_reason"),
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type GeoVerification = typeof geoVerifications.$inferSelect;
export type InsertGeoVerification = typeof geoVerifications.$inferInsert;

export const idVerifications = mysqlTable("id_verifications", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  idDocumentUrl: text("id_document_url"),
  selfieUrl: text("selfie_url"),
  idNumberHash: varchar("id_number_hash", { length: 255 }),
  fullName: varchar("full_name", { length: 255 }),
  dateOfBirth: varchar("date_of_birth", { length: 20 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "needs_review"]).default("pending").notNull(),
  rejectionReason: text("rejection_reason"),
  reviewedBy: bigint("reviewed_by", { mode: "number", unsigned: true }),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

export type IdVerification = typeof idVerifications.$inferSelect;
export type InsertIdVerification = typeof idVerifications.$inferInsert;

export const donations = mysqlTable("donations", {
  id: serial("id").primaryKey(),
  donorName: varchar("donor_name", { length: 255 }),
  donorEmail: varchar("donor_email", { length: 320 }),
  amount: varchar("amount", { length: 50 }).notNull(),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  countryCode: varchar("country_code", { length: 10 }),
  paymentMethod: varchar("payment_method", { length: 50 }).notNull(),
  paymentStatus: mysqlEnum("payment_status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  transactionId: varchar("transaction_id", { length: 255 }),
  message: text("message"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Donation = typeof donations.$inferSelect;
export type InsertDonation = typeof donations.$inferInsert;

export const passwordResetTokens = mysqlTable("password_reset_tokens", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type InsertPasswordResetToken = typeof passwordResetTokens.$inferInsert;

export const taxRates = mysqlTable("tax_rates", {
  id: varchar("id", { length: 128 }).primaryKey(),
  countryCode: varchar("country_code", { length: 2 }).notNull().unique(),
  rate: decimal("rate", { precision: 5, scale: 2 }).notNull(),
  vatName: varchar("vat_name", { length: 50 }).default("VAT"),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type TaxRate = typeof taxRates.$inferSelect;
export type InsertTaxRate = typeof taxRates.$inferInsert;

export const notifications = mysqlTable("notifications", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  link: varchar("link", { length: 500 }),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

export const messages = mysqlTable("messages", {
  id: serial("id").primaryKey(),
  senderId: bigint("sender_id", { mode: "number", unsigned: true }).notNull(),
  recipientId: bigint("recipient_id", { mode: "number", unsigned: true }).notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  body: text("body").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  senderDeleted: boolean("sender_deleted").default(false).notNull(),
  recipientDeleted: boolean("recipient_deleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

export const moderationLogs = mysqlTable("moderation_logs", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  targetType: varchar("target_type", { length: 50 }).notNull(),
  targetId: bigint("target_id", { mode: "number", unsigned: true }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  rule: varchar("rule", { length: 100 }).notNull(),
  reason: text("reason").notNull(),
  contentSnapshot: text("content_snapshot"),
  autoModerated: boolean("auto_moderated").default(true).notNull(),
  reviewedBy: bigint("reviewed_by", { mode: "number", unsigned: true }),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ModerationLog = typeof moderationLogs.$inferSelect;
export type InsertModerationLog = typeof moderationLogs.$inferInsert;

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, { fields: [users.id], references: [userProfiles.userId] }),
  posts: many(forumPosts),
  comments: many(forumComments),
  sentFriendRequests: many(friends, { relationName: "requester" }),
  receivedFriendRequests: many(friends, { relationName: "addressee" }),
  tosAcceptance: one(tosAcceptances, { fields: [users.id], references: [tosAcceptances.userId] }),
  listings: many(marketplaceListings),
  geoVerification: one(geoVerifications, { fields: [users.id], references: [geoVerifications.userId] }),
  idVerification: one(idVerifications, { fields: [users.id], references: [idVerifications.userId] }),
  bids: many(auctionBids),
  watchlist: many(watchlistItems),
  ratingsGiven: many(sellerRatings, { relationName: "rater" }),
  ratingsReceived: many(sellerRatings, { relationName: "seller" }),
  sellerProfile: one(sellerProfiles, { fields: [users.id], references: [sellerProfiles.userId] }),
  questionsAsked: many(listingQuestions),
  deposits: many(auctionDeposits),
  offersMade: many(priceOffers),
}));

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, { fields: [userProfiles.userId], references: [users.id] }),
}));

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  author: one(users, { fields: [forumPosts.authorId], references: [users.id] }),
  comments: many(forumComments),
}));

export const forumCommentsRelations = relations(forumComments, ({ one }) => ({
  author: one(users, { fields: [forumComments.authorId], references: [users.id] }),
  post: one(forumPosts, { fields: [forumComments.postId], references: [forumPosts.id] }),
}));

export const friendsRelations = relations(friends, ({ one }) => ({
  requester: one(users, { fields: [friends.requesterId], references: [users.id], relationName: "requester" }),
  addressee: one(users, { fields: [friends.addresseeId], references: [users.id], relationName: "addressee" }),
}));

export const marketplaceListingsRelations = relations(marketplaceListings, ({ one, many }) => ({
  seller: one(users, { fields: [marketplaceListings.sellerId], references: [users.id] }),
  media: many(listingMedia),
  bids: many(auctionBids),
  questions: many(listingQuestions),
  views: many(listingViews),
  offers: many(priceOffers),
}));

export const listingMediaRelations = relations(listingMedia, ({ one }) => ({
  listing: one(marketplaceListings, { fields: [listingMedia.listingId], references: [marketplaceListings.id] }),
}));


export const geoVerificationsRelations = relations(geoVerifications, ({ one }) => ({
  user: one(users, { fields: [geoVerifications.userId], references: [users.id] }),
}));

export const idVerificationsRelations = relations(idVerifications, ({ one }) => ({
  user: one(users, { fields: [idVerifications.userId], references: [users.id] }),
  reviewer: one(users, { fields: [idVerifications.reviewedBy], references: [users.id] }),
}));

// ─── Auction Bids ───
export const auctionBids = mysqlTable("auction_bids", {
  id: serial("id").primaryKey(),
  listingId: bigint("listing_id", { mode: "number", unsigned: true }).notNull(),
  bidderId: bigint("bidder_id", { mode: "number", unsigned: true }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  isProxy: boolean("is_proxy").default(false).notNull(),
  proxyMax: decimal("proxy_max", { precision: 10, scale: 2 }),
  isAutoBid: boolean("is_auto_bid").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Watchlist ───
export const watchlistItems = mysqlTable("watchlist_items", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  listingId: bigint("listing_id", { mode: "number", unsigned: true }).notNull(),
  notifyOutbid: boolean("notify_outbid").default(true).notNull(),
  notifyEnding: boolean("notify_ending").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Q&A ───
export const listingQuestions = mysqlTable("listing_questions", {
  id: serial("id").primaryKey(),
  listingId: bigint("listing_id", { mode: "number", unsigned: true }).notNull(),
  askerId: bigint("asker_id", { mode: "number", unsigned: true }).notNull(),
  question: text("question").notNull(),
  answer: text("answer"),
  answeredAt: timestamp("answeredAt"),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Seller Ratings ───
export const sellerRatings = mysqlTable("seller_ratings", {
  id: serial("id").primaryKey(),
  sellerId: bigint("seller_id", { mode: "number", unsigned: true }).notNull(),
  raterId: bigint("rater_id", { mode: "number", unsigned: true }).notNull(),
  listingId: bigint("listing_id", { mode: "number", unsigned: true }).notNull(),
  rating: int("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Listing Views ───
export const listingViews = mysqlTable("listing_views", {
  id: serial("id").primaryKey(),
  listingId: bigint("listing_id", { mode: "number", unsigned: true }).notNull(),
  viewerId: bigint("viewer_id", { mode: "number", unsigned: true }),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Price Offers ───
export const priceOffers = mysqlTable("price_offers", {
  id: serial("id").primaryKey(),
  listingId: bigint("listing_id", { mode: "number", unsigned: true }).notNull(),
  buyerId: bigint("buyer_id", { mode: "number", unsigned: true }).notNull(),
  offeredPrice: decimal("offered_price", { precision: 10, scale: 2 }).notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "expired", "countered"]).default("pending").notNull(),
  counterPrice: decimal("counter_price", { precision: 10, scale: 2 }),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Auction Deposits ───
export const auctionDeposits = mysqlTable("auction_deposits", {
  id: serial("id").primaryKey(),
  listingId: bigint("listing_id", { mode: "number", unsigned: true }).notNull(),
  bidderId: bigint("bidder_id", { mode: "number", unsigned: true }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: mysqlEnum("status", ["held", "returned", "forfeited", "applied"]).default("held").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Seller Profiles ───
export const sellerProfiles = mysqlTable("seller_profiles", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().unique(),
  level: mysqlEnum("level", ["bronze", "silver", "gold", "platinum", "diamond"]).default("bronze").notNull(),
  totalSales: int("total_sales").default(0).notNull(),
  totalRevenue: decimal("total_revenue", { precision: 12, scale: 2 }).default("0").notNull(),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default("0"),
  ratingCount: int("rating_count").default(0).notNull(),
  successfulAuctions: int("successful_auctions").default(0).notNull(),
  verifiedSeller: boolean("verified_seller").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ─── Copyright Scans ───
export const copyrightScans = mysqlTable("copyright_scans", {
  id: serial("id").primaryKey(),
  listingId: bigint("listing_id", { mode: "number", unsigned: true }).notNull(),
  scanType: mysqlEnum("scan_type", ["text", "image", "video"]).notNull(),
  status: mysqlEnum("status", ["pending", "clear", "flagged", "rejected"]).default("pending").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  matchedTerms: text("matched_terms"),
  reason: text("reason"),
  scannedAt: timestamp("scannedAt").defaultNow().notNull(),
});
// ── NEW: Sniper/Auto-bid ──
export const sniperBids = mysqlTable("sniper_bids", {
  id: serial("id").primaryKey(),
  listingId: bigint("listing_id", { mode: "number", unsigned: true }).notNull(),
  bidderId: bigint("bidder_id", { mode: "number", unsigned: true }).notNull(),
  maxAmount: decimal("max_amount", { precision: 10, scale: 2 }).notNull(),
  incrementLimit: decimal("increment_limit", { precision: 10, scale: 2 }),
  active: boolean("active").default(true).notNull(),
  totalBidsPlaced: int("total_bids_placed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ── NEW: Category Rules ──
export const categoryRules = mysqlTable("category_rules", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 50 }).notNull().unique(),
  listingFee: decimal("listing_fee", { precision: 10, scale: 2 }).default("0").notNull(),
  sellingFeePercent: decimal("selling_fee_percent", { precision: 5, scale: 2 }).default("5").notNull(),
  auctionFeePercent: decimal("auction_fee_percent", { precision: 5, scale: 2 }).default("3").notNull(),
  requiresDeposit: boolean("requires_deposit").default(false).notNull(),
  minDepositAmount: decimal("min_deposit_amount", { precision: 10, scale: 2 }).default("0"),
  taxCategory: varchar("tax_category", { length: 50 }).default("standard"),
  allowedTypes: mysqlEnum("allowed_types", ["fixed", "auction", "both"]).default("both").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ── NEW: Price History ──
export const priceHistory = mysqlTable("price_history", {
  id: serial("id").primaryKey(),
  listingId: bigint("listing_id", { mode: "number", unsigned: true }).notNull(),
  category: varchar("category", { length: 50 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
  condition: mysqlEnum("condition", ["new", "used", "like_new"]).default("new").notNull(),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
});

// ── NEW: SMS Verifications ──
export const smsVerifications = mysqlTable("sms_verifications", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull().unique(),
  phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
  countryCode: varchar("country_code", { length: 5 }).default("+81").notNull(),
  codeHash: varchar("code_hash", { length: 255 }),
  verified: boolean("verified").default(false).notNull(),
  attempts: int("attempts").default(0).notNull(),
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ── NEW: Orders ──
export const orders = mysqlTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  buyerId: bigint("buyer_id", { mode: "number", unsigned: true }).notNull(),
  sellerId: bigint("seller_id", { mode: "number", unsigned: true }).notNull(),
  listingId: bigint("listing_id", { mode: "number", unsigned: true }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).default("0").notNull(),
  feeAmount: decimal("fee_amount", { precision: 10, scale: 2 }).default("0").notNull(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }).default("0").notNull(),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "shipped", "delivered", "cancelled", "disputed", "refunded"]).default("pending").notNull(),
  escrowStatus: mysqlEnum("escrow_status", ["pending", "held", "released", "refunded"]).default("pending").notNull(),
  shippingCarrier: varchar("shipping_carrier", { length: 50 }),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  shippingAddress: text("shipping_address"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ── NEW: Transactions ──
export const transactions = mysqlTable("transactions", {
  id: serial("id").primaryKey(),
  transactionNumber: varchar("transaction_number", { length: 50 }).notNull().unique(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }).notNull(),
  payerId: bigint("payer_id", { mode: "number", unsigned: true }).notNull(),
  payeeId: bigint("payee_id", { mode: "number", unsigned: true }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  fee: decimal("fee", { precision: 10, scale: 2 }).default("0").notNull(),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  paymentMethod: mysqlEnum("payment_method", ["stripe", "paypay", "konbini", "bank_transfer", "credit_card", "escrow", "deposit"]).default("stripe").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded", "disputed"]).default("pending").notNull(),
  gatewayTransactionId: varchar("gateway_transaction_id", { length: 255 }),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ── NEW: Package Tracking ──
export const packageTracking = mysqlTable("package_tracking", {
  id: serial("id").primaryKey(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }).notNull(),
  trackingNumber: varchar("tracking_number", { length: 100 }).notNull(),
  carrier: varchar("carrier", { length: 50 }).notNull(),
  carrierCode: varchar("carrier_code", { length: 20 }),
  status: mysqlEnum("status", ["pre_transit", "in_transit", "out_for_delivery", "delivered", "exception", "returned"]).default("pre_transit").notNull(),
  estimatedDelivery: timestamp("estimated_delivery"),
  lastEvent: text("last_event"),
  lastLocation: varchar("last_location", { length: 255 }),
  lastCheckedAt: timestamp("last_checked_at"),
  eventsJson: text("events_json"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ── NEW: Warehouse Items ──
export const warehouseItems = mysqlTable("warehouse_items", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  orderId: bigint("order_id", { mode: "number", unsigned: true }).notNull(),
  itemDescription: varchar("item_description", { length: 255 }).notNull(),
  weightGrams: int("weight_grams"),
  dimensions: varchar("dimensions", { length: 50 }),
  receivedAt: timestamp("receivedAt"),
  status: mysqlEnum("status", ["inbound", "stored", "consolidating", "shipped", "returned"]).default("inbound").notNull(),
  consolidationGroupId: bigint("consolidation_group_id", { mode: "number", unsigned: true }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// ── NEW: Prohibited Scans (Anti-Scalping) ──
export const prohibitedScans = mysqlTable("prohibited_scans", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number", unsigned: true }).notNull(),
  listingId: bigint("listing_id", { mode: "number", unsigned: true }),
  scanType: mysqlEnum("scan_type", ["scalper", "bot", "reseller", "suspicious"]).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }),
  triggers: text("triggers"),
  action: mysqlEnum("action", ["flag", "block", "review", "clear"]).default("review").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// Relations for new tables
export const auctionBidsRelations = relations(auctionBids, ({ one }) => ({
  bidder: one(users, { fields: [auctionBids.bidderId], references: [users.id] }),
  listing: one(marketplaceListings, { fields: [auctionBids.listingId], references: [marketplaceListings.id] }),
}));

export const watchlistItemsRelations = relations(watchlistItems, ({ one }) => ({
  user: one(users, { fields: [watchlistItems.userId], references: [users.id] }),
  listing: one(marketplaceListings, { fields: [watchlistItems.listingId], references: [marketplaceListings.id] }),
}));

export const listingQuestionsRelations = relations(listingQuestions, ({ one }) => ({
  asker: one(users, { fields: [listingQuestions.askerId], references: [users.id] }),
  listing: one(marketplaceListings, { fields: [listingQuestions.listingId], references: [marketplaceListings.id] }),
}));

export const sellerRatingsRelations = relations(sellerRatings, ({ one }) => ({
  rater: one(users, { fields: [sellerRatings.raterId], references: [users.id], relationName: "rater" }),
  seller: one(users, { fields: [sellerRatings.sellerId], references: [users.id], relationName: "seller" }),
  listing: one(marketplaceListings, { fields: [sellerRatings.listingId], references: [marketplaceListings.id] }),
}));

export const listingViewsRelations = relations(listingViews, ({ one }) => ({
  viewer: one(users, { fields: [listingViews.viewerId], references: [users.id] }),
  listing: one(marketplaceListings, { fields: [listingViews.listingId], references: [marketplaceListings.id] }),
}));

export const priceOffersRelations = relations(priceOffers, ({ one }) => ({
  buyer: one(users, { fields: [priceOffers.buyerId], references: [users.id] }),
  listing: one(marketplaceListings, { fields: [priceOffers.listingId], references: [marketplaceListings.id] }),
}));

export const auctionDepositsRelations = relations(auctionDeposits, ({ one }) => ({
  bidder: one(users, { fields: [auctionDeposits.bidderId], references: [users.id] }),
  listing: one(marketplaceListings, { fields: [auctionDeposits.listingId], references: [marketplaceListings.id] }),
}));

export const sellerProfilesRelations = relations(sellerProfiles, ({ one }) => ({
  user: one(users, { fields: [sellerProfiles.userId], references: [users.id] }),
}));

export const copyrightScansRelations = relations(copyrightScans, ({ one }) => ({
  listing: one(marketplaceListings, { fields: [copyrightScans.listingId], references: [marketplaceListings.id] }),
}));

export const sniperBidsRelations = relations(sniperBids, ({ one }) => ({
  bidder: one(users, { fields: [sniperBids.bidderId], references: [users.id] }),
  listing: one(marketplaceListings, { fields: [sniperBids.listingId], references: [marketplaceListings.id] }),
}));

export const priceHistoryRelations = relations(priceHistory, ({ one }) => ({
  listing: one(marketplaceListings, { fields: [priceHistory.listingId], references: [marketplaceListings.id] }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  buyer: one(users, { fields: [orders.buyerId], references: [users.id] }),
  seller: one(users, { fields: [orders.sellerId], references: [users.id] }),
  listing: one(marketplaceListings, { fields: [orders.listingId], references: [marketplaceListings.id] }),
  tracking: many(packageTracking),
  transactions: many(transactions),
  warehouseItems: many(warehouseItems),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  order: one(orders, { fields: [transactions.orderId], references: [orders.id] }),
}));

export const packageTrackingRelations = relations(packageTracking, ({ one }) => ({
  order: one(orders, { fields: [packageTracking.orderId], references: [orders.id] }),
}));

export const warehouseItemsRelations = relations(warehouseItems, ({ one }) => ({
  user: one(users, { fields: [warehouseItems.userId], references: [users.id] }),
  order: one(orders, { fields: [warehouseItems.orderId], references: [orders.id] }),
}));

// --- Forum Reactions ---
export const forumReactions = mysqlTable("forum_reactions", {
  id: serial("id").primaryKey(),
  postId: bigint("postId", { mode: "number", unsigned: true }).notNull(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull(),
  emoji: varchar("emoji", { length: 20 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// --- User Signatures ---
export const userSignatures = mysqlTable("user_signatures", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }).notNull().unique(),
  content: text("content"),
  isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull().$onUpdate(() => new Date()),
});

// Relations for forum reactions and signatures
export const forumReactionsRelations = relations(forumReactions, ({ one }) => ({
  user: one(users, { fields: [forumReactions.userId], references: [users.id] }),
  post: one(forumPosts, { fields: [forumReactions.postId], references: [forumPosts.id] }),
}));

export const userSignaturesRelations = relations(userSignatures, ({ one }) => ({
  user: one(users, { fields: [userSignatures.userId], references: [users.id] }),
}));
