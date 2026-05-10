import type { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service.js";
import { findUserById } from "../repositories/user.repository.js";
import type { ApiResponse, User } from "@traveloop/shared";

function getMeta(req: Request) {
  return {
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  };
}

// POST /api/v1/auth/signup
export async function signup(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.signup(req.body, getMeta(req));
    const response: ApiResponse = {
      success: true,
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      },
    };
    res.status(201).json(response);
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "CONFLICT") {
      res.status(409).json({ success: false, error: { code: "CONFLICT", message: e.message } });
      return;
    }
    next(err);
  }
}

// POST /api/v1/auth/login
export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body, getMeta(req));
    const response: ApiResponse = {
      success: true,
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
      },
    };
    res.json(response);
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "UNAUTHORIZED") {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: e.message } });
      return;
    }
    next(err);
  }
}

// POST /api/v1/auth/refresh
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "refreshToken required" } });
      return;
    }
    const tokens = await authService.refresh(refreshToken, getMeta(req));
    res.json({ success: true, data: tokens });
  } catch (err) {
    const e = err as NodeJS.ErrnoException;
    if (e.code === "UNAUTHORIZED") {
      res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: e.message } });
      return;
    }
    next(err);
  }
}

// POST /api/v1/auth/logout
export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    await authService.logout(req.user!.id);
    res.json({ success: true, data: { message: "Logged out successfully" } });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/auth/me
export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await findUserById(req.user!.id);
    if (!user) {
      res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } });
      return;
    }
    const safeUser: Partial<User> = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      language: user.language ?? "en",
      role: user.role as "user" | "admin",
      createdAt: user.createdAt ?? undefined,
    };
    res.json({ success: true, data: { user: safeUser } });
  } catch (err) {
    next(err);
  }
}
