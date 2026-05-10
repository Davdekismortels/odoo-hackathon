import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface JwtPayload {
  sub: string;       // user id
  email: string;
  role: "user" | "admin";
}

export function signAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRY } as jwt.SignOptions);
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.JWT_SECRET, { expiresIn: env.REFRESH_TOKEN_EXPIRY } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, env.JWT_SECRET) as { sub: string };
}
