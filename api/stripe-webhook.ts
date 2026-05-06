import { Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil",
});

export function stripeWebhookHandler(c: any) {
  // This needs raw body, handled separately from tRPC
  return { message: "Stripe webhook should be added to Hono app directly with raw body parser" };
}
