import { z } from "zod";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { packageTracking, orders } from "@db/schema";
import { eq, desc } from "drizzle-orm";

const CARRIERS = [
  { code: "japan_post", name: "Japan Post / EMS", region: "JP", trackingUrl: "https://trackings.post.japanpost.jp/services/srv/search/" },
  { code: "yamato", name: "Kuroneko Yamato", region: "JP", trackingUrl: "https://toi.kuronekoyamato.co.jp/bs/bs" },
  { code: "sagawa", name: "Sagawa Express", region: "JP", trackingUrl: "https://k2.sagawa-exp.co.jp/p/sagawa/web/okurijosearcheng.jsp" },
  { code: "dhl", name: "DHL Express", region: "global", trackingUrl: "https://www.dhl.com/en/express/tracking.html" },
  { code: "fedex", name: "FedEx", region: "global", trackingUrl: "https://www.fedex.com/apps/fedextrack/" },
  { code: "ups", name: "UPS", region: "global", trackingUrl: "https://www.ups.com/track" },
  { code: "usps", name: "USPS", region: "US", trackingUrl: "https://tools.usps.com/go/TrackConfirmAction" },
  { code: "sf_express", name: "SF Express", region: "CN", trackingUrl: "https://www.sf-express.com/us/en/dynamic_function/waybill/" },
];

export const shippingRouter = createRouter({
  getCarriers: publicQuery.query(async () => CARRIERS),
  getTracking: authedQuery.input(z.object({ orderId: z.number() })).query(async ({ ctx, input }) => {
    const db = getDb();
    const order = await db.query.orders.findFirst({ where: eq(orders.id, input.orderId) });
    if (!order || (order.buyerId !== ctx.user.id && order.sellerId !== ctx.user.id)) throw new Error("Unauthorized");
    const tracking = await db.query.packageTracking.findMany({ where: eq(packageTracking.orderId, input.orderId), orderBy: desc(packageTracking.createdAt) });
    return { order, tracking, carriers: CARRIERS };
  }),
  refreshTracking: authedQuery.input(z.object({ orderId: z.number() })).mutation(async ({ ctx, input }) => {
    const db = getDb();
    const order = await db.query.orders.findFirst({ where: eq(orders.id, input.orderId) });
    if (!order || (order.buyerId !== ctx.user.id && order.sellerId !== ctx.user.id)) throw new Error("Unauthorized");
    const tracking = await db.query.packageTracking.findFirst({ where: eq(packageTracking.orderId, input.orderId) });
    if (!tracking) return { success: false, error: "No tracking found" };
    const statuses: Array<"pre_transit" | "in_transit" | "out_for_delivery" | "delivered"> = ["pre_transit", "in_transit", "out_for_delivery", "delivered"];
    const next = statuses[Math.min(statuses.indexOf(tracking.status as any) + 1, statuses.length - 1)];
    await db.update(packageTracking).set({ status: next, lastCheckedAt: new Date(), lastEvent: `Package ${next.replace("_", " ")}` }).where(eq(packageTracking.id, tracking.id));
    if (next === "delivered") await db.update(orders).set({ status: "delivered" }).where(eq(orders.id, input.orderId));
    return { success: true, status: next };
  }),
});
