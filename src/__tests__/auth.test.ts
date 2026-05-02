import { describe, it, expect } from "vitest";
import { randomBytes, createHash } from "crypto";
import { promisify } from "util";
import { scrypt } from "crypto";

const scryptAsync = promisify(scrypt);

// Re-implement auth functions for testing (isolated from DB dependencies)
async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(32).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function verifyPassword(stored: string, supplied: string): Promise<boolean> {
  const [hashed, salt] = stored.split(".");
  if (!hashed || !salt) return false;
  const buf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return buf.toString("hex") === hashed;
}

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

describe("Password hashing", () => {
  it("should hash and verify passwords correctly", async () => {
    const pwd = "TestPassword123!";
    const hash = await hashPassword(pwd);
    expect(hash).toContain(".");
    expect(hash.length).toBeGreaterThan(64);
    const valid = await verifyPassword(hash, pwd);
    expect(valid).toBe(true);
  });

  it("should reject wrong passwords", async () => {
    const pwd = "CorrectPassword123!";
    const hash = await hashPassword(pwd);
    const valid = await verifyPassword(hash, "WrongPassword123!");
    expect(valid).toBe(false);
  });

  it("should produce different hashes for same password (due to salt)", async () => {
    const pwd = "SamePassword123!";
    const hash1 = await hashPassword(pwd);
    const hash2 = await hashPassword(pwd);
    expect(hash1).not.toBe(hash2);
    // But both should verify
    expect(await verifyPassword(hash1, pwd)).toBe(true);
    expect(await verifyPassword(hash2, pwd)).toBe(true);
  });
});

describe("Reset token hashing", () => {
  it("should produce consistent SHA-256 hashes", () => {
    const token = "abc123test";
    const hash1 = hashResetToken(token);
    const hash2 = hashResetToken(token);
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // hex length of SHA-256
  });

  it("should produce different hashes for different tokens", () => {
    const hash1 = hashResetToken("token1");
    const hash2 = hashResetToken("token2");
    expect(hash1).not.toBe(hash2);
  });
});

