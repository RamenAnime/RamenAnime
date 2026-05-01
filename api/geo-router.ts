import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { geoVerifications, idVerifications } from "@db/schema";
import { eq } from "drizzle-orm";

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
          : "This service is not available in your country. We only operate in the United States, Canada, Japan, South Korea, China, and France.",
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
      const allowed = ALLOWED_COUNTRIES.includes(input.countryCode.toUpperCase());
      return { allowed, message: allowed ? "Country verified" : "Country not allowed" };
    }),

  getAgeStatus: publicQuery.query(async () => {
    return { ageVerified: false, idVerified: false, selfieVerified: false, allVerified: false };
  }),

  submitAgeVerification: publicQuery
    .input(
      z.object({
        age: z.number().min(18).max(120),
        ipAddress: z.string().optional(),
      })
    )
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
      const [{ id }] = await db.insert(idVerifications).values({
        userId: 0,
        ...input,
        status: "pending",
      }).$returningId();
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
      if (!record) throw new Error("Not found");
      await db.update(idVerifications).set({
        status: input.status,
        rejectionReason: input.rejectionReason ?? null,
        reviewedBy: ctx.user.id,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(idVerifications.id, input.id));
      return { success: true };
    }),
});
