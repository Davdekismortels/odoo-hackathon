import rateLimit from "express-rate-limit";
import type { ApiResponse } from "@traveloop/shared";

const rateLimitResponse: ApiResponse = {
  success: false,
  error: {
    code: "RATE_LIMITED",
    message: "Too many requests, please try again later",
  },
};

/** General API rate limit: 100 req / 15 min per IP */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse,
});

/** Strict auth rate limit: 10 req / 15 min per IP (brute-force protection) */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: rateLimitResponse,
});
