// WebAuthn / Passkeys (ECDSA P-256) - falls back to placeholder if not installed
let swa: any;

try {
  swa = require("@simplewebauthn/server");
} catch {
  console.warn("[webauthn] Package not installed. Passkeys disabled.");
}

const RP_NAME = "Ramen Anime";
const RP_ID = process.env.WEBAUTHN_RP_ID || "ramenanime.com";
const ORIGIN = process.env.WEBAUTHN_ORIGIN || "https://ramenanime.com";

export async function generateRegistrationOpts(userId: number, username: string) {
  if (!swa) throw new Error("WebAuthn not installed. Run: npm install @simplewebauthn/server");
  return swa.generateRegistrationOptions({
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

export async function verifyReg(response: any, challenge: string) {
  if (!swa) throw new Error("WebAuthn not installed");
  return swa.verifyRegistrationResponse({
    response,
    expectedChallenge: challenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    requireUserVerification: true,
  });
}

export async function generateAuthOpts() {
  if (!swa) throw new Error("WebAuthn not installed");
  return swa.generateAuthenticationOptions({ rpID: RP_ID, userVerification: "preferred" });
}

export async function verifyAuth(response: any, challenge: string, authenticator: any) {
  if (!swa) throw new Error("WebAuthn not installed");
  return swa.verifyAuthenticationResponse({
    response,
    expectedChallenge: challenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    authenticator,
    requireUserVerification: true,
  });
}
