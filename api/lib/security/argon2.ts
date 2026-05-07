// Argon2id password hashing - falls back to bcrypt placeholder if not installed
let argon2: any;

try {
  argon2 = require("argon2");
} catch {
  console.warn("[argon2] Package not installed. Password hashing will fail.");
}

export async function hashPassword(password: string): Promise<string> {
  if (!argon2) throw new Error("argon2 not installed. Run: npm install argon2");
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
    hashLength: 64,
    saltLength: 32,
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  if (!argon2) throw new Error("argon2 not installed. Run: npm install argon2");
  return argon2.verify(hash, password);
}
