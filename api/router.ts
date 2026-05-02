import { authRouter } from "./auth-router";
import { socialRouter } from "./social-router";
import { adminRouter } from "./admin-router";
import { marketplaceRouter } from "./marketplace-router";
import { tosRouter } from "./tos-router";
import { geoRouter } from "./geo-router";
import { donationRouter } from "./donation-router";
import { taxRouter } from "./tax-router";
import { notificationRouter } from "./notification-router";
import { messageRouter } from "./message-router";
import { moderationRouter } from "./moderation-router";
import { createRouter } from "./middleware";

export const appRouter = createRouter({
  auth: authRouter,
  social: socialRouter,
  admin: adminRouter,
  marketplace: marketplaceRouter,
  tos: tosRouter,
  geo: geoRouter,
  donation: donationRouter,
  tax: taxRouter,
  notification: notificationRouter,
  message: messageRouter,
  moderation: moderationRouter,
});

export type AppRouter = typeof appRouter;
