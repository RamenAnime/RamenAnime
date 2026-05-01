#!/bin/bash
set -e

echo "Removing reCAPTCHA from all files..."

# 1. Remove reCAPTCHA script from index.html
cat << 'HTMLEOF' > index.html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#0a0a0a" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="ラーメンアニメ" />
    <meta name="description" content="ラーメンアニメ - Your one-stop shop for custom 3D printed anime goods and trading cards." />
    <link rel="manifest" href="/manifest.json" />
    <link rel="apple-touch-icon" href="/icon-192.png" />
    <title>ラーメンアニメ</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').catch(console.error);
        });
      }
    </script>
  </body>
</html>
HTMLEOF

# 2. Disable reCAPTCHA in auth router (always returns true)
cat << 'AUTHEOF' > api/auth-router.ts
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
import { signSessionToken } from "./kimi/session";
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
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:20px 0;"><table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#1a1a1a;border-radius:12px;overflow:hidden;"><tr><td style="background:linear-gradient(135deg,#d4a853,#b8860b);padding:30px;text-align:center;"><h1 style="color:#1a1a1a;margin:0;font-size:32px;font-weight:bold;">ラーメンアニメ</h1><p style="color:#1a1a1a;margin:8px 0 0;font-size:14px;font-weight:500;">Anime Collectibles & Social Community</p></td></tr><tr><td style="padding:30px;background:#ffffff;"><p style="font-size:16px;color:#333;line-height:1.6;">Hi <strong>${username}</strong>,</p><p style="font-size:16px;color:#333;line-height:1.6;">Welcome to <strong style="color:#b8860b;">ラーメンアニメ</strong>! We are thrilled to have you join our community of anime enthusiasts.</p><p style="font-size:16px;color:#333;line-height:1.6;">Your account has been successfully created. Here is what you can do now:</p><ul style="font-size:15px;color:#333;line-height:1.8;padding-left:20px;"><li>Shop — Browse our exclusive collection of custom 3D prints and trading cards</li><li>Forum — Connect with fellow fans in our MySpace-style social forum</li><li>Marketplace — Buy and sell anime collectibles from other community members</li><li>Friends — Build your anime network and make new friends</li></ul><p style="font-size:14px;color:#555;line-height:1.5;margin-top:20px;">If you have any questions, reply to this email or visit our <a href="${baseUrl}/contact" style="color:#b8860b;">Contact page</a>.</p></td></tr><tr><td style="background:#1a1a1a;padding:20px;text-align:center;font-size:12px;color:#888;"><p style="margin:0;">ラーメンアニメ | Anime Collectibles & Social Community</p><p style="margin:8px 0 0;font-size:11px;"><a href="${baseUrl}/terms" style="color:#aaa;">Terms of Service</a> | <a href="${baseUrl}/privacy" style="color:#aaa;">Privacy Policy</a></p></td></tr></table></td></tr></table></body></html>`;
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
      if (!userId) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user — could not retrieve user ID from database." });

      const user = await findUserById(userId);
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user — user not found after insert." });

      const token = await signSessionToken({ userId: user.id, clientId: env.appId });
      const cookieOpts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append("set-cookie", cookie.serialize(Session.cookieName, token, {
        httpOnly: cookieOpts.httpOnly, path: cookieOpts.path, sameSite: cookieOpts.sameSite?.toLowerCase() as "lax" | "none", secure: cookieOpts.secure, maxAge: Session.maxAgeMs / 1000,
      }));

      await sendEmail(input.email ?? "", `Welcome to ラーメンアニメ — Your Anime Journey Begins!`, welcomeEmailHtml(user.username ?? "User", baseUrl()));

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
AUTHEOF

# 3. Remove reCAPTCHA from Login.tsx
cat << 'LOGINEOF' > src/pages/Login.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, Shield, ArrowLeft, UserPlus, LogIn, Eye, EyeOff, AlertCircle, Check, X, KeyRound } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";

function PasswordRequirements({ password }: { password: string }) {
  const reqs = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "One uppercase letter", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter", met: /[a-z]/.test(password) },
    { label: "One number", met: /\d/.test(password) },
    { label: "One special character (!@#$% etc.)", met: /[@$!%*?&]/.test(password) },
  ];
  return (
    <div className="space-y-1 text-xs">
      {reqs.map((r) => (
        <div key={r.label} className={`flex items-center gap-1.5 ${r.met ? "text-emerald-400" : "text-muted-foreground"}`}>
          {r.met ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
          {r.label}
        </div>
      ))}
    </div>
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => { toast.success("Welcome back!"); navigate("/"); },
    onError: (err) => setError(err.message),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => { toast.success("Account created! Welcome to ラーメンアニメ."); navigate("/"); },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "login") {
      loginMutation.mutate({ username, password });
    } else {
      registerMutation.mutate({ username, password, email: email || undefined });
    }
  };

  const isLoading = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Home
        </Link>
        <Card className="bg-card/90 border-border/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-black font-bold text-xl mx-auto mb-3">
              ラ
            </div>
            <CardTitle className="text-2xl font-bold">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {mode === "login" ? "Sign in to your ラーメンアニメ account" : "Join the anime community today"}
            </p>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <div className="mb-4 flex items-start gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={username} onChange={(e) => { setUsername(e.target.value); setError(""); }} placeholder="your_username" required className="bg-muted/50" />
              </div>
              {mode === "register" && (
                <div className="space-y-2">
                  <Label htmlFor="email">Email (optional, needed for password recovery)</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} placeholder="you@example.com" className="bg-muted/50" />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} placeholder="Enter password" required className="bg-muted/50 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {mode === "register" && password && <PasswordRequirements password={password} />}
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? (mode === "login" ? "Signing in..." : "Creating account...") : (
                  <>{mode === "login" ? <LogIn className="mr-2 h-4 w-4" /> : <UserPlus className="mr-2 h-4 w-4" />}{mode === "login" ? "Sign In" : "Create Account"}</>
                )}
              </Button>
            </form>
            <div className="mt-4 text-center">
              {mode === "login" ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    No account?{" "}
                    <button onClick={() => { setMode("register"); setError(""); }} className="text-primary hover:underline font-medium">Create one</button>
                  </p>
                  <Link to="/forgot-password" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                    <KeyRound className="mr-1 h-3 w-3" /> Forgot password?
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button onClick={() => { setMode("login"); setError(""); }} className="text-primary hover:underline font-medium">Sign in</button>
                </p>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>512-bit scrypt password hashing</span>
              <span>|</span>
              <MessageCircle className="h-3 w-3" />
              <span>Secure session cookies</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
LOGINEOF

echo ""
echo "Done. Committing and pushing..."
git add -A
git commit -m "fix: remove reCAPTCHA for now, keep 512-bit hash + password reqs" && git push origin main || echo "Push failed or nothing to commit"

echo ""
echo "Now deploy on Render:"
echo "  1. Go to https://dashboard.render.com"
echo "  2. Click your ramen-anime service"
echo "  3. Click 'Manual Deploy' > 'Clear Build Cache & Deploy'"
