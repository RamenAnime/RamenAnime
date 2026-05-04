import { z } from "zod";
import { createRouter, authedQuery, publicQuery } from "./middleware";
import { generateRegistrationOpts, verifyReg, generateAuthOpts, verifyAuth } from "./lib/webauthn";

export const webAuthnRouter = createRouter({
  registerOptions: authedQuery.query(async ({ ctx }) => ({
    options: await generateRegistrationOpts(ctx.user.id, ctx.user.username || ctx.user.name || "user")
  })),
  verifyRegistration: authedQuery
    .input(z.object({ response: z.any(), challenge: z.string() }))
    .mutation(async ({ input }) => {
      const v = await verifyReg(input.response, input.challenge);
      return { success: v.verified, info: v.registrationInfo };
    }),
  authOptions: publicQuery.query(async () => ({ options: await generateAuthOpts() })),
  verifyAuth: publicQuery
    .input(z.object({ response: z.any(), challenge: z.string() }))
    .mutation(async ({ input }) => {
      const auth = { credentialID: Buffer.from(""), credentialPublicKey: Buffer.from(""), counter: 0 };
      const v = await verifyAuth(input.response, input.challenge, auth);
      return { success: v.verified };
    }),
});
