import * as cookie from "cookie";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { findUserByUsername, findUserById, createLocalUser, updateLastSignIn, countAdmins } from "./queries/users";
import { signSessionToken } from "./kimi/session";
import { env } from "./lib/env";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function verifyPassword(stored: string, supplied: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  const buf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return buf.toString("hex") === hashed;
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
      password: z.string().min(6).max(100),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const existing = await findUserByUsername(input.username);
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Username already taken." });
      const passwordHash = await hashPassword(input.password);
      const adminCount = await countAdmins();
      const role = adminCount === 0 ? "admin" : "user";
      const insertResult = await createLocalUser({ username: input.username, passwordHash, name: input.username, email: input.email, role });
      const userId = Number((insertResult as any).insertId);
      const user = await findUserById(userId);
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user." });
      const token = await signSessionToken({ userId: user.id, clientId: env.appId });
      const cookieOpts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append("set-cookie", cookie.serialize(Session.cookieName, token, {
        httpOnly: cookieOpts.httpOnly, path: cookieOpts.path, sameSite: cookieOpts.sameSite?.toLowerCase() as "lax" | "none", secure: cookieOpts.secure, maxAge: Session.maxAgeMs / 1000,
      }));
      return { success: true, user: { id: user.id, username: user.username, name: user.name, role: user.role } };
    }),

  login: publicQuery
    .input(z.object({ username: z.string().min(1), password: z.string().min(1) }))
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
});
