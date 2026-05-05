import { getDb } from "../queries/connection";
import { moderationLogs, forumPosts, forumComments, users } from "@db/schema";
import { eq } from "drizzle-orm";
import { createNotification, banUser } from "../queries/users";
import { logger } from "./logger";

async function isAdmin(userId: number): Promise<boolean> {
  try {
    const db = getDb();
    const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const user = rows[0];
    return user?.role === "admin" || false;
  } catch {
    return false;
  }
}

const BLOCKED_WORDS = [
  "fuck", "shit", "bitch", "asshole", "cunt", "damn",
  "nigger", "faggot", "chink", "kike", "wetback",
  "click here", "buy now", "limited time", "act now",
  "free money", "make money fast", "earn extra cash",
  "whatsapp me", "telegram", "dm me on",
  "kill yourself", "kys", "die in a fire",
];

const SPAM_PATTERNS = [
  /\b(?:viagra|cialis|xxx|porn|casino|lottery)\b/i,
  /(https?:\/\/){2,}/,
  /\b[A-Z]{10,}\b/,
];

function hasExcessiveRepetition(text: string): boolean {
  return /(.)\1{15,}/.test(text);
}

function hasExcessiveCaps(text: string): boolean {
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 10) return false;
  const caps = letters.replace(/[^A-Z]/g, "");
  return caps.length / letters.length > 0.8;
}

interface ModerationResult {
  action: "allow" | "flag" | "remove" | "ban";
  rule: string;
  reason: string;
  confidence: number;
}

export function scanContent(content: string, _username?: string): ModerationResult {
  const lower = content.toLowerCase();

  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word)) {
      return {
        action: "remove",
        rule: "PROFANITY_FILTER",
        reason: `Content contains prohibited language: "${word}"`,
        confidence: 0.95,
      };
    }
  }

  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(content)) {
      return {
        action: "remove",
        rule: "SPAM_DETECTION",
        reason: `Content matches spam pattern: ${pattern.source}`,
        confidence: 0.9,
      };
    }
  }

  if (hasExcessiveRepetition(content)) {
    return {
      action: "flag",
      rule: "REPETITIVE_CONTENT",
      reason: "Content contains excessive character repetition (likely spam)",
      confidence: 0.85,
    };
  }

  if (hasExcessiveCaps(content)) {
    return {
      action: "flag",
      rule: "EXCESSIVE_CAPS",
      reason: "Content is predominantly ALL CAPS",
      confidence: 0.7,
    };
  }

  const linkMatches = content.match(/https?:\/\//g);
  if (linkMatches && linkMatches.length > 3) {
    return {
      action: "flag",
      rule: "EXCESSIVE_LINKS",
      reason: `Content contains ${linkMatches.length} external links`,
      confidence: 0.75,
    };
  }

  return { action: "allow", rule: "NONE", reason: "Content passed all checks", confidence: 1 };
}

async function getUserRecentViolations(userId: number, hours: number = 24): Promise<number> {
  const db = getDb();
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const logs = await db.select().from(moderationLogs).where(eq(moderationLogs.userId, userId));
  return logs.filter((l: any) => new Date(l.createdAt) > since && l.action !== "allow").length;
}

export async function moderateContent(
  userId: number,
  targetType: "post" | "comment" | "listing",
  targetId: number,
  content: string,
  username?: string,
): Promise<ModerationResult> {
  if (await isAdmin(userId)) {
    return { action: "allow", rule: "ADMIN_SHIELD", reason: "Admin content exempt from auto-moderation", confidence: 1 };
  }

  const result = scanContent(content, username);

  const db = getDb();
  await db.insert(moderationLogs).values({
    userId,
    targetType,
    targetId,
    action: result.action,
    rule: result.rule,
    reason: result.reason,
    contentSnapshot: content.substring(0, 500),
    autoModerated: true,
  });

  if (result.action === "remove") {
    if (targetType === "post") {
      await db.delete(forumPosts).where(eq(forumPosts.id, targetId));
    } else if (targetType === "comment") {
      await db.delete(forumComments).where(eq(forumComments.id, targetId));
    }

    await createNotification({
      userId,
      type: "system",
      title: "Content removed by auto-moderator",
      message: result.reason,
      link: "/messages",
    });
  }

  if (result.action === "remove" || result.action === "flag") {
    const violations = await getUserRecentViolations(userId, 24);
    if (violations >= 3) {
      await banUser(userId, true);
      await db.insert(moderationLogs).values({
        userId,
        targetType: "user",
        targetId: userId,
        action: "ban",
        rule: "REPEAT_OFFENDER",
        reason: `Auto-banned after ${violations} violations in 24 hours`,
        autoModerated: true,
      });

      await createNotification({
        userId,
        type: "system",
        title: "Account suspended",
        message: `Your account has been automatically suspended due to repeated TOS violations (${violations} in 24h). Contact support for appeal.`,
      });

      logger.warn("Auto-ban triggered", { userId, violations, rule: result.rule });

      return { action: "ban", rule: "REPEAT_OFFENDER", reason: `Auto-banned: ${violations} violations in 24h`, confidence: 1 };
    }
  }

  logger.info("Content moderated", { userId, targetType, targetId, action: result.action, rule: result.rule });
  return result;
}

export async function moderateListing(userId: number, listingId: number, title: string, description: string): Promise<ModerationResult> {
  if (await isAdmin(userId)) {
    return { action: "allow", rule: "ADMIN_SHIELD", reason: "Admin content exempt from auto-moderation", confidence: 1 };
  }

  const combined = `${title} ${description}`;
  const result = scanContent(combined);

  const db = getDb();
  await db.insert(moderationLogs).values({
    userId,
    targetType: "listing",
    targetId: listingId,
    action: result.action,
    rule: result.rule,
    reason: result.reason,
    contentSnapshot: combined.substring(0, 500),
    autoModerated: true,
  });

  if (result.action === "remove") {
    const { marketplaceListings } = await import("@db/schema");
    await db.update(marketplaceListings).set({ isActive: false }).where(eq(marketplaceListings.id, listingId));

    await createNotification({
      userId,
      type: "system",
      title: "Listing removed by auto-moderator",
      message: result.reason,
    });
  }

  if (result.action === "remove" || result.action === "flag") {
    const violations = await getUserRecentViolations(userId, 24);
    if (violations >= 3) {
      await banUser(userId, true);
      await db.insert(moderationLogs).values({
        userId,
        targetType: "user",
        targetId: userId,
        action: "ban",
        rule: "REPEAT_OFFENDER",
        reason: `Auto-banned after ${violations} violations in 24 hours`,
        autoModerated: true,
      });
      await createNotification({
        userId,
        type: "system",
        title: "Account suspended",
        message: `Your account has been automatically suspended due to repeated TOS violations (${violations} in 24h).`,
      });
      return { action: "ban", rule: "REPEAT_OFFENDER", reason: `Auto-banned: ${violations} violations in 24h`, confidence: 1 };
    }
  }

  return result;
}
