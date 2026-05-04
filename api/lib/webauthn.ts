import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/types";

const RP_NAME = "Ramen Anime";
const RP_ID = process.env.WEBAUTHN_RP_ID || "ramen-anime-denj.onrender.com";
const ORIGIN = process.env.WEBAUTHN_ORIGIN || "https://ramen-anime-denj.onrender.com";

export async function generateRegistrationOpts(userId: number, username: string) {
  return generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userID: new TextEncoder().encode(String(userId)),
    userName: username,
    userDisplayName: username,
    attestationType: "indirect",
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
      authenticatorAttachment: "platform",
    },
    supportedAlgorithmIDs: [-7],
  });
}

export async function verifyReg(response: RegistrationResponseJSON, challenge: string) {
  return verifyRegistrationResponse({
    response, expectedChallenge: challenge,
    expectedOrigin: ORIGIN, expectedRPID: RP_ID,
    requireUserVerification: true,
  });
}

export async function generateAuthOpts() {
  return generateAuthenticationOptions({ rpID: RP_ID, userVerification: "preferred" });
}

export async function verifyAuth(response: AuthenticationResponseJSON, challenge: string, authenticator: any) {
  return verifyAuthenticationResponse({
    response, expectedChallenge: challenge,
    expectedOrigin: ORIGIN, expectedRPID: RP_ID,
    authenticator, requireUserVerification: true,
  });
}
