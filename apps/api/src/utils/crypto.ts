import { createHash, randomBytes } from "crypto";

/** SHA-256 hash a token for storage (never store raw refresh tokens) */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Generate a cryptographically random token string */
export function generateToken(bytes = 32): string {
  return randomBytes(bytes).toString("hex");
}

/** Add N days to a date */
export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
