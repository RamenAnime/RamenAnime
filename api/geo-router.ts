import { z } from "zod";
  import { createRouter, publicQuery, adminQuery } from "./middleware";
  import { getDb } from "./queries/connection";
  import { geoVerifications, idVerifications } from "@db/schema";
  import { eq } from "drizzle-orm";

  const NORTH_AMERICA = ["US", "CA"];

  // All 27 European Union member states. United Kingdom is NOT included.
  const EU_COUNTRIES = [
    "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR",
    "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL",
    "PL", "PT", "RO", "SK", "SI", "ES", "SE",
  ];

  // All Asian countries except North Korea (KP).
  // OFAC-sanctioned countries (IR, SY, CU, MM) are blocked at the server level
  // in boot.ts regardless of this allowlist.
  const ASIAN_COUNTRIES = [
    // East Asia
    "JP", "CN", "KR", "TW", "HK", "MO", "MN",
    // Southeast Asia
    "SG", "MY", "TH", "VN", "PH", "ID", "BN", "KH", "LA", "MM", "TL",
    // South Asia
    "IN", "BD", "PK", "LK", "NP", "BT", "MV", "AF",
    // Central Asia
    "KZ", "UZ", "TM", "TJ", "KG",
    // West Asia and the Middle East
    "TR", "GE", "AM", "AZ", "IL", "JO", "LB", "IQ", "KW", "SA",
    "AE", "QA", "BH", "OM", "YE", "PS", "IR", "SY",
  ];

  const ALLOWED_COUNTRIES = [...new Set([...NORTH_AMERICA, ...EU_COUNTRIES, ...ASIAN_COUNTRIES])];
  const ALLOWED_SET = new Set(ALLOWED_COUNTRIES);

  export const geoRouter = createRouter({
    checkAccess: publicQuery
      .input(z.object({ countryCode: z.string() }))
      .query(async ({ input }) => {
        const code = input.countryCode.toUpperCase();
        const allowed = ALLOWED_SET.has(code);
        return {
          allowed,
          countryCode: code,
          message: allowed ? "Access granted" : "This service is not available in your region.",
        };
      }),

    getMyGeoStatus: publicQuery.query(async ({ ctx }) => {
      const db = getDb();
      if (!ctx.user) return null;
      const record = await db.query.geoVerifications.findFirst({
        where: eq(geoVerifications.userId, ctx.user.id),
      });
      return record ?? null;
    }),

    registerGeo: publicQuery
      .input(
        z.object({
          countryCode: z.string().min(2).max(10),
          countryName: z.string().min(1).max(100),
          ipAddress: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const code = input.countryCode.toUpperCase();
        const allowed = ALLOWED_SET.has(code);
        return { allowed, message: allowed ? "Country verified" : "Country not supported" };
      }),

    getAgeStatus: publicQuery.query(async () => {
      return { ageVerified: false, idVerified: false, selfieVerified: false, allVerified: false };
    }),

    submitAgeVerification: publicQuery
      .input(z.object({ age: z.number().min(18).max(120), ipAddress: z.string().optional() }))
      .mutation(async ({ input }) => {
        return { success: true, age: input.age };
      }),

    submitIdVerification: publicQuery
      .input(
        z.object({
          idDocumentUrl: z.string().url(),
          selfieUrl: z.string().url(),
          idNumberHash: z.string().optional(),
          fullName: z.string().optional(),
          dateOfBirth: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const db = getDb();
        const [{ id }] = await db
          .insert(idVerifications)
          .values({ userId: 0, ...input, status: "pending" })
          .$returningId();
        return { success: true, status: "pending", id };
      }),

    listPendingVerifications: adminQuery.query(async () => {
      const db = getDb();
      return db.query.idVerifications.findMany({
        where: eq(idVerifications.status, "pending"),
        with: { user: true },
      });
    }),

    reviewVerification: adminQuery
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["approved", "rejected"]),
          rejectionReason: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = getDb();
        const record = await db.query.idVerifications.findFirst({
          where: eq(idVerifications.id, input.id),
        });
        if (!record) throw new Error("Verification record not found");
        await db
          .update(idVerifications)
          .set({
            status: input.status,
            rejectionReason: input.rejectionReason ?? null,
            reviewedBy: ctx.user.id,
            reviewedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(idVerifications.id, input.id));
        return { success: true };
      }),
  });
  