import { z } from "zod";
import { createRouter, publicQuery, authedQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { geoVerifications, idVerifications } from "@db/schema";
import { eq } from "drizzle-orm";

// Allowed countries: USA, Canada, Japan, South Korea, China, France
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

  getMyGeoStatus: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const record = await db.query.geoVerifications.findFirst({
      where: eq(geoVerifications.userId, ctx.user.id),
    });
    return record ?? null;
  }),

  registerGeo: authedQuery
    .input(
      z.object({
        countryCode: z.string().min(2).max(10),
        countryName: z.string().min(1).max(100),
        ipAddress: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const allowed = ALLOWED_COUNTRIES.includes(input.countryCode.toUpperCase());
      
      if (!allowed) {
        await db.insert(geoVerifications).values({
          userId: ctx.user.id,
          countryCode: input.countryCode.toUpperCase(),
          countryName: input.countryName,
          ipAddress: input.ipAddress ?? null,
          blocked: true,
          blockReason: "Country not in allowed list",
        }).onDuplicateKeyUpdate({
          set: {
            countryCode: input.countryCode.toUpperCase(),
            countryName: input.countryName,
            ipAddress: input.ipAddress ?? null,
            blocked: true,
            blockReason: "Country not in allowed list",
            updatedAt: new Date(),
          },
        });
        return { allowed: false, message: "Country not allowed" };
      }

      const existing = await db.query.geoVerifications.findFirst({
        where: eq(geoVerifications.userId, ctx.user.id),
      });

      if (existing) {
        await db.update(geoVerifications).set({
          countryCode: input.countryCode.toUpperCase(),
          countryName: input.countryName,
          ipAddress: input.ipAddress ?? null,
          updatedAt: new Date(),
        }).where(eq(geoVerifications.id, existing.id));
      } else {
        await db.insert(geoVerifications).values({
          userId: ctx.user.id,
          countryCode: input.countryCode.toUpperCase(),
          countryName: input.countryName,
          ipAddress: input.ipAddress ?? null,
          ageVerified: false,
          idVerified: false,
          selfieVerified: false,
          blocked: false,
        });
      }

      return { allowed: true, message: "Country verified" };
    }),

  // ─── Age Verification ───
  getAgeStatus: authedQuery.query(async ({ ctx }) => {
    const db = getDb();
    const record = await db.query.geoVerifications.findFirst({
      where: eq(geoVerifications.userId, ctx.user.id),
    });
    return {
      ageVerified: record?.ageVerified ?? false,
      idVerified: record?.idVerified ?? false,
      selfieVerified: record?.selfieVerified ?? false,
      allVerified: (record?.ageVerified ?? false) && (record?.idVerified ?? false) && (record?.selfieVerified ?? false),
    };
  }),

  submitAgeVerification: authedQuery
    .input(
      z.object({
        age: z.number().min(18).max(120),
        ipAddress: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db.query.geoVerifications.findFirst({
        where: eq(geoVerifications.userId, ctx.user.id),
      });
      if (existing) {
        await db.update(geoVerifications).set({
          ageVerified: true,
          ipAddress: input.ipAddress ?? existing.ipAddress,
          verifiedAt: new Date(),
          updatedAt: new Date(),
        }).where(eq(geoVerifications.id, existing.id));
      } else {
        await db.insert(geoVerifications).values({
          userId: ctx.user.id,
          countryCode: "UNKNOWN",
          countryName: "Unknown",
          ageVerified: true,
          ipAddress: input.ipAddress ?? null,
          verifiedAt: new Date(),
        });
      }
      return { success: true };
    }),

  // ─── ID Document Upload ───
  submitIdVerification: authedQuery
    .input(
      z.object({
        idDocumentUrl: z.string().url(),
        selfieUrl: z.string().url(),
        idNumberHash: z.string().optional(),
        fullName: z.string().optional(),
        dateOfBirth: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = getDb();
      const existing = await db.query.idVerifications.findFirst({
        where: eq(idVerifications.userId, ctx.user.id),
      });
      if (existing) {
        await db.update(idVerifications).set({
          ...input,
          status: "pending",
          updatedAt: new Date(),
        }).where(eq(idVerifications.id, existing.id));
      } else {
        await db.insert(idVerifications).values({
          userId: ctx.user.id,
          ...input,
          status: "pending",
        });
      }
      // Also update geo verification
      const geo = await db.query.geoVerifications.findFirst({
        where: eq(geoVerifications.userId, ctx.user.id),
      });
      if (geo) {
        await db.update(geoVerifications).set({
          idVerified: true,
          updatedAt: new Date(),
        }).where(eq(geoVerifications.id, geo.id));
      }
      return { success: true, status: "pending" };
    }),

  // ─── Admin Review ───
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
