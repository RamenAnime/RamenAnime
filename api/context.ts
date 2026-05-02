import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import type { User } from "@db/schema";
import { authenticateRequest } from "./session/auth";
import { logger } from "./lib/logger";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: User;
};

function isValidOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  if (!origin && !referer) {
    const secFetchSite = req.headers.get("sec-fetch-site");
    if (secFetchSite === "same-origin" || secFetchSite === "none") return true;
    if (req.headers.get("x-requested-with")) return true;
    return false;
  }
  const allowed = [
    process.env.SITE_URL ?? "",
    "https://ramen-anime-denj.onrender.com",
    "http://localhost:5173",
    "http://localhost:3000",
  ].filter(Boolean);
  if (origin) {
    return allowed.some((host) => origin.startsWith(host));
  }
  if (referer) {
    return allowed.some((host) => referer.startsWith(host));
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
