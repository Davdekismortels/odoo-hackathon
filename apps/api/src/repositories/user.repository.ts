import { eq, and, gt } from "drizzle-orm";
import { db } from "../db/index.js";
import { users, sessions } from "../db/schema.js";

export type NewUser = typeof users.$inferInsert;
export type UserRow = typeof users.$inferSelect;

// ==================== USER QUERIES ====================

export async function findUserByEmail(email: string): Promise<UserRow | undefined> {
  const results = db.select().from(users).where(eq(users.email, email)).limit(1).all();
  return results[0];
}

export async function findUserById(id: string): Promise<UserRow | undefined> {
  const results = db.select().from(users).where(eq(users.id, id)).limit(1).all();
  return results[0];
}

export async function createUser(data: NewUser): Promise<UserRow> {
  db.insert(users).values(data).run();
  return findUserById(data.id as string) as Promise<UserRow>;
}

// ==================== SESSION QUERIES ====================

export type NewSession = typeof sessions.$inferInsert;
export type SessionRow = typeof sessions.$inferSelect;

export async function createSession(data: NewSession): Promise<void> {
  db.insert(sessions).values(data).run();
}

export async function findValidSession(
  userId: string,
  tokenHash: string
): Promise<SessionRow | undefined> {
  const now = new Date().toISOString();
  const results = db
    .select()
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        eq(sessions.refreshTokenHash, tokenHash),
        eq(sessions.revoked, false),
        gt(sessions.expiresAt, now)
      )
    )
    .limit(1)
    .all();
  return results[0];
}

export async function revokeSession(id: string): Promise<void> {
  db.update(sessions).set({ revoked: true }).where(eq(sessions.id, id)).run();
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  db.update(sessions).set({ revoked: true }).where(eq(sessions.userId, userId)).run();
}
