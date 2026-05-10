import { hashPassword, verifyPassword } from "../utils/password.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { hashToken, generateToken, addDays } from "../utils/crypto.js";
import * as userRepo from "../repositories/user.repository.js";
import type { SignupInput, LoginInput } from "@traveloop/shared";

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResult {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: "user" | "admin";
  };
  tokens: AuthTokens;
}

// ==================== SIGNUP ====================

export async function signup(
  input: SignupInput,
  meta: { ipAddress?: string; userAgent?: string }
): Promise<AuthResult> {
  // Check if email is taken
  const existing = await userRepo.findUserByEmail(input.email);
  if (existing) {
    const err = new Error("Email already in use");
    (err as NodeJS.ErrnoException).code = "CONFLICT";
    throw err;
  }

  const passwordHash = await hashPassword(input.password);
  const id = crypto.randomUUID();

  await userRepo.createUser({
    id,
    email: input.email,
    passwordHash,
    fullName: input.fullName,
  });

  const user = await userRepo.findUserById(id);
  if (!user) throw new Error("Failed to create user");

  const tokens = await createSessionTokens(user.id, meta);

  return {
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role as "user" | "admin" },
    tokens,
  };
}

// ==================== LOGIN ====================

export async function login(
  input: LoginInput,
  meta: { ipAddress?: string; userAgent?: string }
): Promise<AuthResult> {
  const user = await userRepo.findUserByEmail(input.email);

  // Use same error for wrong email or password (prevents email enumeration)
  if (!user) {
    throw Object.assign(new Error("Invalid email or password"), { code: "UNAUTHORIZED" });
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw Object.assign(new Error("Invalid email or password"), { code: "UNAUTHORIZED" });
  }

  const tokens = await createSessionTokens(user.id, meta);

  return {
    user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role as "user" | "admin" },
    tokens,
  };
}

// ==================== REFRESH ====================

export async function refresh(
  refreshToken: string,
  meta: { ipAddress?: string; userAgent?: string }
): Promise<AuthTokens> {
  let userId: string;
  try {
    const { verifyRefreshToken } = await import("../utils/jwt.js");
    const payload = verifyRefreshToken(refreshToken);
    userId = payload.sub;
  } catch {
    throw Object.assign(new Error("Invalid refresh token"), { code: "UNAUTHORIZED" });
  }

  const tokenHash = hashToken(refreshToken);
  const session = await userRepo.findValidSession(userId, tokenHash);
  if (!session) {
    throw Object.assign(new Error("Session not found or expired"), { code: "UNAUTHORIZED" });
  }

  // Rotate: revoke old session, issue new tokens
  await userRepo.revokeSession(session.id);
  const user = await userRepo.findUserById(userId);
  if (!user) throw Object.assign(new Error("User not found"), { code: "UNAUTHORIZED" });

  return createSessionTokens(user.id, meta);
}

// ==================== LOGOUT ====================

export async function logout(userId: string): Promise<void> {
  await userRepo.revokeAllUserSessions(userId);
}

// ==================== HELPERS ====================

async function createSessionTokens(
  userId: string,
  meta: { ipAddress?: string; userAgent?: string }
): Promise<AuthTokens> {
  const user = await userRepo.findUserById(userId);
  if (!user) throw new Error("User not found");

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role as "user" | "admin",
  });

  const refreshToken = generateToken(32);
  const refreshTokenHash = hashToken(refreshToken);
  const expiresAt = addDays(new Date(), 7).toISOString();

  await userRepo.createSession({
    id: crypto.randomUUID(),
    userId: user.id,
    refreshTokenHash,
    expiresAt,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });

  return { accessToken, refreshToken };
}
