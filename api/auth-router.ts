import { randomBytes, scrypt, createHash } from "crypto";
import { createTransport } from "nodemailer";
import { promisify } from "util";
import * as cookie from "cookie";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { checkRateLimit } from "./lib/rate-limit";
import { welcomeEmailHtml, verifyEmailHtml, resetEmailHtml } from "./lib/email-templates";
import { logger } from "./lib/logger";
import {
  findUserByUsername,
  findUserById,
  findUserByEmail,
  findUserByResetTokenHash,
  createLocalUser,
  updateLastSignIn,
  updatePassword,
  setResetTokenHash,
  clearResetToken,
  countAdmins,
  verifyUserEmail,
} from "./queries/users";
import { signSessionToken } from "./session/session";
import { env } from "./lib/env";

const scryptAsync = promisify(scrypt);

// Password hashing with scrypt (64 bytes = 512 bits output).
// Satisfies the "512-bit backend encryption" requirement.
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(32).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function verifyPassword(stored: string, supplied: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) return false;
  const buf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return buf.toString("hex") === hashed;
}

// Hash reset token with SHA-256 for DB storage (raw token only sent to user email)
function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    logger.info("No RESEND_API_KEY set, skipping email", { to, subject });
    return;
  }
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "ラーメンアニメ <noreply@ramenanime.com>", to, subject, html }),
    });
    if (!resp.ok) {
      const text = await resp.text();
      logger.error("Resend email error", { status: resp.status, text, to });
    } else {
      logger.info("Email sent", { to, subject });
    }
  } catch (err) {
    logger.error("Email send failed", { to, subject, error: (err as Error).message });
  }
}

const baseUrl = () => process.env.SITE_URL || "https://ramenanime.com";

function getClientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || req.headers.get("x-real-ip")
    || "unknown";
}

async function verifyRecaptcha(token: string | undefined): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    logger.debug("No RECAPTCHA_SECRET_KEY set, skipping verification");
    return true;
  }
  if (!token) return false;
  try {
    const resp = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${secret}&response=${token}`,
    });
    const data = await resp.json() as any;
    return data.success === true;
  } catch { return false; }
}

// Type-safe insert result
interface DbInsertResult {
  insertId: number;
}

export const authRouter = createRouter({
  me: authedQuery.query((opts) => {
    const { passwordHash: _ph, ...safeUser } = opts.ctx.user;
    return safeUser;
  }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append("set-cookie", cookie.serialize(Session.cookieName, "", {
      httpOnly: opts.httpOnly, path: opts.path, sameSite: opts.sameSite?.toLowerCase() as "lax" | "none", secure: opts.secure, maxAge: 0,
    }));
    return { success: true };
  }),

  register: publicQuery
    .input(z.object({
      username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
      password: z.string().min(8).max(100).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/),
      email: z.string().email().optional(),
      recaptchaToken: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const ip = getClientIp(ctx.req);
      const rl = checkRateLimit(ip, "register");
      if (!rl.allowed) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Too many registration attempts. Please try again in ${rl.retryAfter} seconds.` });

      const recaptchaOk = await verifyRecaptcha(input.recaptchaToken);
      if (!recaptchaOk) throw new TRPCError({ code: "BAD_REQUEST", message: "CAPTCHA verification failed. Please try again." });

      const existing = await findUserByUsername(input.username);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Username already taken." });

      const passwordHash = await hashPassword(input.password);
      const adminCount = await countAdmins();
      const role = adminCount === 0 ? "admin" : "user";

      const insertResult = await createLocalUser({
        username: input.username,
        passwordHash,
        name: input.username,
        email: input.email ?? null,
        role,
      });

      const result = insertResult as unknown as DbInsertResult;
      const userId = result.insertId ?? 0;
      if (!userId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user - could not retrieve user ID from database." });

      const user = await findUserById(userId);
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user - user not found after insert." });

      // Generate email verification token
      let verifyToken: string | undefined;
      if (input.email) {
        verifyToken = randomBytes(32).toString("hex");
        const verifyHash = hashResetToken(verifyToken);
        await setResetTokenHash(user.id, verifyHash, new Date(Date.now() + 24 * 60 * 60 * 1000));
      }

      const token = await signSessionToken({ userId: user.id, clientId: env.appId });
      const cookieOpts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append("set-cookie", cookie.serialize(Session.cookieName, token, {
        httpOnly: cookieOpts.httpOnly, path: cookieOpts.path, sameSite: cookieOpts.sameSite?.toLowerCase() as "lax" | "none", secure: cookieOpts.secure, maxAge: Session.maxAgeMs / 1000,
      }));

      await sendEmail(input.email ?? "", `Welcome to ラーメンアニメ - Your Anime Journey Begins!`, welcomeEmailHtml(user.username ?? "User", baseUrl(), verifyToken));

      logger.info("User registered", { userId: user.id, username: user.username, ip });
      return { success: true, user: { id: user.id, username: user.username, name: user.name, role: user.role } };
    }),

  login: publicQuery
    .input(z.object({ username: z.string().min(1), password: z.string().min(1), recaptchaToken: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const ip = getClientIp(ctx.req);
      const rl = checkRateLimit(ip, "login");
      if (!rl.allowed) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Too many login attempts. Please try again in ${rl.retryAfter} seconds.` });

      const recaptchaOk = await verifyRecaptcha(input.recaptchaToken);
      if (!recaptchaOk) throw new TRPCError({ code: "BAD_REQUEST", message: "CAPTCHA verification failed. Please try again." });

      const user = await findUserByUsername(input.username);
      if (!user || !user.passwordHash) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password." });

      if (user.isBanned) throw new TRPCError({ code: "FORBIDDEN", message: "Your account has been suspended." });

      const valid = await verifyPassword(user.passwordHash, input.password);
      if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password." });

      await updateLastSignIn(user.id);
      const token = await signSessionToken({ userId: user.id, clientId: env.appId });
      const cookieOpts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append("set-cookie", cookie.serialize(Session.cookieName, token, {
        httpOnly: cookieOpts.httpOnly, path: cookieOpts.path, sameSite: cookieOpts.sameSite?.toLowerCase() as "lax" | "none", secure: cookieOpts.secure, maxAge: Session.maxAgeMs / 1000,
      }));

      logger.info("User logged in", { userId: user.id, username: user.username, ip });
      return { success: true, user: { id: user.id, username: user.username, name: user.name, role: user.role } };
    }),

  forgotPassword: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const ip = getClientIp(ctx.req);
      const rl = checkRateLimit(ip, "forgotPassword");
      if (!rl.allowed) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: `Too many password reset attempts. Please try again in ${rl.retryAfter} seconds.` });

      const user = await findUserByEmail(input.email);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "No account found with that email address." });

      const rawToken = randomBytes(32).toString("hex");
      const tokenHash = hashResetToken(rawToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await setResetTokenHash(user.id, tokenHash, expiresAt);
      await sendEmail(input.email, "Reset your ラーメンアニメ password", resetEmailHtml(user.username ?? user.name ?? "User", rawToken, baseUrl()));

      logger.info("Password reset requested", { userId: user.id, email: input.email, ip });
      return { success: true, message: "Password reset instructions sent to your email." };
    }),

  verifyResetToken: publicQuery
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ input }) => {
      const tokenHash = hashResetToken(input.token);
      const user = await findUserByResetTokenHash(tokenHash);
      if (!user) return { valid: false };
      return { valid: true, username: user.username };
    }),

  resetPassword: publicQuery
    .input(z.object({ token: z.string().min(1), newPassword: z.string().min(8).max(100).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/) }))
    .mutation(async ({ input }) => {
      const tokenHash = hashResetToken(input.token);
      const user = await findUserByResetTokenHash(tokenHash);
      if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired reset token." });

      const newHash = await hashPassword(input.newPassword);
      await updatePassword(user.id, newHash);
      await clearResetToken(user.id);

      logger.info("Password reset completed", { userId: user.id });
      return { success: true, message: "Password updated successfully. You can now log in with your new password." };
    }),

  // Email verification endpoints
  verifyEmail: publicQuery
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ input }) => {
      const tokenHash = hashResetToken(input.token);
      const user = await findUserByResetTokenHash(tokenHash);
      if (!user) return { verified: false, message: "Invalid or expired verification link." };
      await verifyUserEmail(user.id);
      await clearResetToken(user.id);
      logger.info("Email verified", { userId: user.id });
      return { verified: true, message: "Your email has been verified." };
    }),

  resendVerification: authedQuery.mutation(async ({ ctx }) => {
    const user = ctx.user;
    if (!user.email || user.isEmailVerified) throw new TRPCError({ code: "BAD_REQUEST", message: "No email to verify or already verified." });
    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = hashResetToken(rawToken);
    await setResetTokenHash(user.id, tokenHash, new Date(Date.now() + 24 * 60 * 60 * 1000));
    await sendEmail(user.email, "Verify your ラーメンアニメ email", verifyEmailHtml(user.username ?? "User", `${baseUrl()}/verify-email?token=${rawToken}`));
    return { success: true, message: "Verification email sent." };
  }),
});

