import "stripe";

declare module "stripe" {
  namespace Stripe {
    type LatestApiVersion =
      | "2025-02-24.acacia"
      | "2025-04-30.basil"
      | (string & {});
  }
}
