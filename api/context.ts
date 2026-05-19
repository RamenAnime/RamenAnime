import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./session/auth";
import { logger } from "./lib/logger";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

function collectAllowedOrigins(): string[] {
  const origins = new Set<string>([
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "https://ramenanime.com",
    "https://www.ramenanime.com",
  ]);
  for (const raw of [
    process.env.SITE_URL,
    process.env.VITE_SITE_URL,
    process.env.RENDER_EXTERNAL_URL,
  ]) {
    if (!raw) continue;
    try {
      const u = new URL(raw);
      origins.add(u.origin);
      if (u.hostname.startsWith("www.")) {
        origins.add(`${u.protocol}//${u.hostname.slice(4)}`);
      } else {
        origins.add(`${u.protocol}//www.${u.hostname}`);
      }
    } catch {
      origins.add(raw.replace(/\/$/, ""));
    }
  }
  return [...origins];
}

function matchesAllowedOrigin(value: string, allowed: string[]): boolean {
  return allowed.some((host) => value === host || value.startsWith(`${host}/`));
}

function isValidOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  if (!origin && !referer) {
    const secFetchSite = req.headers.get("sec-fetch-site");
    if (secFetchSite === "same-origin" || secFetchSite === "none") return true;
    if (req.headers.get("x-requested-with")) return true;
    return false;
  }
  const allowed = collectAllowedOrigins();
  if (origin) return matchesAllowedOrigin(origin, allowed);
  if (referer) {
    try {
      return matchesAllowedOrigin(new URL(referer).origin, allowed);
    } catch {
      return matchesAllowedOrigin(referer, allowed);
    }
  }
  return false;
}

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  if (opts.req.method !== "GET" && opts.req.method !== "HEAD") {
    if (!isValidOrigin(opts.req)) {
      logger.warn("CSRF blocked: invalid origin", {
        origin: opts.req.headers.get("origin"),
        referer: opts.req.headers.get("referer"),
        method: opts.req.method,
        path: opts.req.url,
      });
      return ctx;
    }
  }
  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // Authentication is optional here
  }
  return ctx;
}
