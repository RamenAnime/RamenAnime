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
  if (!origin) return true; // Allow same-origin / no-origin requests
  const allowed = [
    process.env.SITE_URL ?? "",
    "http://localhost:5173",
    "http://localhost:3000",
  ].filter(Boolean);
  return allowed.some((host) => origin.startsWith(host));
}

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };

  // CSRF origin check for mutation requests
  if (opts.req.method !== "GET" && opts.req.method !== "HEAD") {
    if (!isValidOrigin(opts.req)) {
      logger.warn("CSRF blocked: invalid origin", {
        origin: opts.req.headers.get("origin"),
        path: opts.req.url,
      });
      return ctx; // Return unauthenticated context
    }
  }

  try {
    ctx.user = await authenticateRequest(opts.req.headers);
  } catch {
    // Authentication is optional here
  }
  return ctx;
}

