import * as jose from "jose";
import { env } from "../lib/env";
import type { SessionPayload } from "./types";

const JWT_ALG = "HS512";
const SESSION_TTL = "1y";

export async function signSessionToken(
  payload: SessionPayload,
): Promise<string> {
  if (!env.appSecret || env.appSecret.length < 32) {
    throw new Error("APP_SECRET must be at least 32 characters for secure JWT signing");
  }
  const secret = new TextEncoder().encode(env.appSecret);
  return new jose.SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALG, typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .setAudience(env.appId)
    .setIssuer(env.appId)
    .sign(secret);
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  if (!token || typeof token !== "string") {
    console.warn("[session] No token provided for verification");
    return null;
  }
  try {
    const secret = new TextEncoder().encode(env.appSecret);
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: [JWT_ALG],
      audience: env.appId,
      issuer: env.appId,
      clockTolerance: 60,
    });
    const { unionId, userId, clientId } = payload;
    if (!clientId) {
      console.warn("[session] JWT payload missing clientId");
      return null;
    }
    if (!unionId && !userId) {
      console.warn("[session] JWT payload missing unionId or userId");
      return null;
    }
    return {
      unionId: unionId as string | undefined,
      userId: userId as number | undefined,
      clientId: clientId as string,
    };
  } catch (err) {
    console.warn("[session] JWT verification failed:", (err as Error).message);
    return null;
  }
}
