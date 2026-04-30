import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";

const ALLOWED_COUNTRIES = ["US", "CA", "JP", "KR", "CN", "FR"];

export const geoRouter = createRouter({
  checkAccess: publicQuery
    .input(z.object({ countryCode: z.string() }))
    .query(async ({ input }) => {
      const allowed = ALLOWED_COUNTRIES.includes(input.countryCode.toUpperCase());
      return {
        allowed,
        countryCode: input.countryCode.toUpperCase(),
        message: allowed
          ? "Access granted"
          : "This service is not available in your country.",
      };
    }),

  submitAgeVerification: publicQuery
    .input(z.object({ age: z.number().min(18).max(120) }))
    .mutation(async () => {
      return { success: true };
    }),
});
