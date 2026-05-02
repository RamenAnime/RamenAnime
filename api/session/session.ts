import * as jose from "jose";
import { env } from "../lib/env";
import type { SessionPayload } from "./types";

const JWT_ALG = "HS256";

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  const secret = new TextEncoder().encode(env.appSecret);
  return new jose.SignJWT(payload).setProtectedHeader({ alg: JWT_ALG }).setIssuedAt().setExpirationTime("1 year").sign(secret);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (token == null) { console.warn("[session] No token provided."); return null; }
  try {
    const secret = new TextEncoder().encode(env.appSecret);
    const { payload } = await jose.jwtVerify(token, secret, { algorithms: [JWT_ALG] });
    const { unionId, userId, clientId } = payload;
    if (clientId == null) { console.warn("[session] Missing clientId."); return null; }
    if (unionId == null && userId == null) { console.warn("[session] Missing unionId or userId."); return null; }
    return { unionId: unionId as string | undefined, userId: userId as number | undefined, clientId: clientId as string } as SessionPayload;
  } catch (error) {
    console.warn("[session] JWT verification failed:", error);
    return null;
  }
}
