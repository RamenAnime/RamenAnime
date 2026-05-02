import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import * as cookie from "cookie";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import {
  findUserByUsername,
  findUserById,
  findUserByEmail,
  findUserByResetToken,
  createLocalUser,
  updateLastSignIn,
  updatePassword,
  setResetToken,
  clearResetToken,
  countAdmins,
} from "./queries/users";
import { signSessionToken } from "./session/session";
import { env } from "./lib/env";

const scryptAsync = promisify(scrypt);

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

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) { console.log("[email] No RESEND_API_KEY set, skipping email"); return; }
  try {
    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "ラーメンアニメ <noreply@ramenanime.com>", to, subject, html }),
    });
    if (!resp.ok) { const text = await resp.text(); console.error("[email] Resend error:", resp.status, text); }
    else { console.log("[email] Sent to", to); }
  } catch (err) { console.error("[email] Failed:", err); }
}

function welcomeEmailHtml(username: string, baseUrl: string) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:20px 0;"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#1a1a1a;border-radius:12px;overflow:hidden;"><tr><td style="background:linear-gradient(135deg,#d4a853,#b8860b);padding:30px;text-align:center;"><h1 style="color:#1a1a1a;margin:0;font-size:32px;font-weight:bold;">ラーメンアニメ</h1><p style="color:#1a1a1a;margin:8px 0 0;font-size:14px;font-weight:500;">Anime Collectibles & Social Community</p></td></tr><tr><td style="padding:30px;background:#ffffff;"><p style="font-size:16px;color:#333;line-height:1.6;">Hi <strong>${username}</strong>,</p><p style="font-size:16px;color:#333;line-height:1.6;">Welcome to <strong style="color:#b8860b;">ラーメンアニメ</strong>! We are thrilled to have you join our community of anime enthusiasts.</p><p style="font-size:16px;color:#333;line-height:1.6;">Your account has been successfully created. Here is what you can do now:</p><ul style="font-size:15px;color:#333;line-height:1.8;padding-left:20px;"><li>Shop - Browse our exclusive collection of custom 3D prints and trading cards</li><li>Forum - Connect with fellow fans in our MySpace-style social forum</li><li>Marketplace - Buy and sell anime collectibles from other community members</li><li>Friends - Build your anime network and make new friends</li></ul><p style="font-size:14px;color:#555;line-height:1.5;margin-top:20px;">If you have any questions, reply to this email or visit our <a href="${baseUrl}/contact" style="color:#b8860b;">Contact page</a>.</p></td></tr><tr><td style="background:#1a1a1a;padding:20px;text-align:center;font-size:12px;color:#888;"><p style="margin:0;">ラーメンアニメ | Anime Collectibles & Social Community</p><p style="margin:8px 0 0;font-size:11px;"><a href="${baseUrl}/terms" style="color:#aaa;">Terms of Service</a> | <a href="${baseUrl}/privacy" style="color:#aaa;">Privacy Policy</a></p></td></tr></table></td></tr></table></body></html>`;
}

function resetEmailHtml(username: string, token: string, baseUrl: string) {
  const link = `${baseUrl}/reset-password?token=${token}`;
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:20px 0;"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#1a1a1a;border-radius:12px;overflow:hidden;"><tr><td style="background:linear-gradient(135deg,#d4a853,#b8860b);padding:30px;text-align:center;"><h1 style="color:#1a1a1a;margin:0;font-size:32px;font-weight:bold;">ラーメンアニメ</h1><p style="color:#1a1a1a;margin:8px 0 0;font-size:14px;font-weight:500;">Password Reset Request</p></td></tr><tr><td style="padding:30px;background:#ffffff;"><p style="font-size:16px;color:#333;line-height:1.6;">Hi <strong>${username}</strong>,</p><p style="font-size:16px;color:#333;line-height:1.6;">We received a request to reset your password. Click the button below to set a new password:</p><p style="margin:20px 0;text-align:center;"><a href="${link}" style="display:inline-block;background:#d4a853;color:#1a1a1a;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:bold;font-size:14px;">Reset Password</a></p><p style="font-size:14px;color:#555;line-height:1.5;">This link expires in 1 hour. If you did not request a password reset, you can safely ignore this email.</p><p style="font-size:14px;color:#555;line-height:1.5;">If the button doesn't work, copy and paste this link:<br/><code style="background:#f0f0f0;padding:4px 8px;border-radius:4px;word-break:break-all;">${link}</code></p></td></tr><tr><td style="background:#1a1a1a;padding:20px;text-align:center;font-size:12px;color:#888;"><p style="margin:0;">ラーメンアニメ | Anime Collectibles & Social Community</p></td></tr></table></td></tr></table></body></html>`;
}

const baseUrl = () => process.env.SITE_URL || "https://ramen-anime-denj.onrender.com";

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

      const userId = Number((insertResult as any).insertId ?? (insertResult as any)[0]?.insertId ?? 0);
      if (!userId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user - could not retrieve user ID from database." });

      const user = await findUserById(userId);
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user - user not found after insert." });

      const token = await signSessionToken({ userId: user.id, clientId: env.appId });
      const cookieOpts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append("set-cookie", cookie.serialize(Session.cookieName, token, {
        httpOnly: cookieOpts.httpOnly, path: cookieOpts.path, sameSite: cookieOpts.sameSite?.toLowerCase() as "lax" | "none", secure: cookieOpts.secure, maxAge: Session.maxAgeMs / 1000,
      }));

      await sendEmail(input.email ?? "", `Welcome to ラーメンアニメ - Your Anime Journey Begins!`, welcomeEmailHtml(user.username ?? "User", baseUrl()));

      return { success: true, user: { id: user.id, username: user.username, name: user.name, role: user.role } };
    }),

  login: publicQuery
    .input(z.object({ username: z.string().min(1), password: z.string().min(1), recaptchaToken: z.string().optional() }))
    .mutation(async ({ input, ctx }) => {
      const user = await findUserByUsername(input.username);
      if (!user || !user.passwordHash) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password." });

      const valid = await verifyPassword(user.passwordHash, input.password);
      if (!valid) throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid username or password." });

      await updateLastSignIn(user.id);
      const token = await signSessionToken({ userId: user.id, clientId: env.appId });
      const cookieOpts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append("set-cookie", cookie.serialize(Session.cookieName, token, {
        httpOnly: cookieOpts.httpOnly, path: cookieOpts.path, sameSite: cookieOpts.sameSite?.toLowerCase() as "lax" | "none", secure: cookieOpts.secure, maxAge: Session.maxAgeMs / 1000,
      }));

      return { success: true, user: { id: user.id, username: user.username, name: user.name, role: user.role } };
    }),

  forgotPassword: publicQuery
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      const user = await findUserByEmail(input.email);
      if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "No account found with that email address." });

      const resetToken = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await setResetToken(user.id, resetToken, expiresAt);
      await sendEmail(input.email, "Reset your ラーメンアニメ password", resetEmailHtml(user.username ?? user.name ?? "User", resetToken, baseUrl()));

      return { success: true, message: "Password reset instructions sent to your email." };
    }),

  verifyResetToken: publicQuery
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ input }) => {
      const user = await findUserByResetToken(input.token);
      if (!user) return { valid: false };
      return { valid: true, username: user.username };
    }),

  resetPassword: publicQuery
    .input(z.object({ token: z.string().min(1), newPassword: z.string().min(8).max(100).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/) }))
    .mutation(async ({ input }) => {
      const user = await findUserByResetToken(input.token);
      if (!user) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid or expired reset token." });

      const newHash = await hashPassword(input.newPassword);
      await updatePassword(user.id, newHash);
      await clearResetToken(user.id);

      return { success: true, message: "Password updated successfully. You can now log in with your new password." };
    }),
});
