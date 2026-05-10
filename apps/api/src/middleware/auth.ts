import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import type { ApiResponse } from "@traveloop/shared";

// Extend Express Request with user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: "user" | "admin";
      };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    const response: ApiResponse = {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication required" },
    };
    res.status(401).json(response);
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch {
    const response: ApiResponse = {
      success: false,
      error: { code: "UNAUTHORIZED", message: "Invalid or expired token" },
    };
    res.status(401).json(response);
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    const response: ApiResponse = {
      success: false,
      error: { code: "FORBIDDEN", message: "Admin access required" },
    };
    res.status(403).json(response);
    return;
  }
  next();
}
