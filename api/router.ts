import { authRouter } from "./auth-router";
import { socialRouter } from "./social-router";
import { tosRouter } from "./tos-router";
import { marketplaceRouter } from "./marketplace-router";
import { geoRouter } from "./geo-router";
import { donationRouter } from "./donation-router";
import { adminRouter } from "./admin-router";
import { taxRouter } from "./tax-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  social: socialRouter,
  tos: tosRouter,
  marketplace: marketplaceRouter,
  geo: geoRouter,
  donation: donationRouter,
  admin: adminRouter,
  tax: taxRouter,
});

export type AppRouter = typeof appRouter;
