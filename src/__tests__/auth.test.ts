import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, hashResetToken } from "../../api/lib/password-crypto";
import { validatePasswordStrength, validateUsername } from "../../api/lib/auth-validation";

describe("Password Hashing", () => {
  it("hashes and verifies a password", async () => {
    const stored = await hashPassword("SecurePass123!");
    expect(stored).toContain(".");
    expect(await verifyPassword(stored, "SecurePass123!")).toBe(true);
    expect(await verifyPassword(stored, "WrongPassword")).toBe(false);
  });

  it("rejects malformed stored hashes", async () => {
    expect(await verifyPassword("not-a-hash", "password")).toBe(false);
  });
});

describe("Reset Token Hashing", () => {
  it("produces a stable SHA-256 hex digest", () => {
    const a = hashResetToken("abc");
    const b = hashResetToken("abc");
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("Password Strength Validation", () => {
  it("accepts a strong password", () => {
    expect(validatePasswordStrength("Secure123!").valid).toBe(true);
  });

  it("rejects short passwords", () => {
    expect(validatePasswordStrength("Ab1!").valid).toBe(false);
  });

  it("requires mixed case, number, and special char", () => {
    expect(validatePasswordStrength("lowercase123!").valid).toBe(false);
    expect(validatePasswordStrength("NoSpecial123").valid).toBe(false);
  });
});

describe("Username Validation", () => {
  it("accepts valid usernames", () => {
    expect(validateUsername("user123").valid).toBe(true);
    expect(validateUsername("John_Doe").valid).toBe(true);
  });

  it("rejects invalid usernames", () => {
    expect(validateUsername("ab").valid).toBe(false);
    expect(validateUsername("user name").valid).toBe(false);
    expect(validateUsername("user@name").valid).toBe(false);
  });
});
