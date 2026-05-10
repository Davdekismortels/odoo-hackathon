import type { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service.js";
import { findUserById, updateUser, softDeleteUser } from "../repositories/user.repository.js";
import type { ApiResponse, User } from "@traveloop/shared";
import { asyncHandler } from "../middleware/asyncHandler.js";

function getMeta(req: Request) {
  return {
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  };
}

// POST /api/v1/auth/signup
export const signup = asyncHandler(async (req: Request, res: Response) => {
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
});

// POST /api/v1/auth/login
export const login = asyncHandler(async (req: Request, res: Response) => {
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
});

// POST /api/v1/auth/refresh
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body as { refreshToken: string };
  if (!refreshToken) {
    res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "refreshToken required" } });
    return;
  }
  const tokens = await authService.refresh(refreshToken, getMeta(req));
  res.json({ success: true, data: tokens });
});

// POST /api/v1/auth/logout
export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.user!.id);
  res.json({ success: true, data: { message: "Logged out successfully" } });
});

// GET /api/v1/auth/me
export const me = asyncHandler(async (req: Request, res: Response) => {
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
});

// PATCH /api/v1/auth/profile
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { fullName, avatarUrl, language } = req.body as {
    fullName?: string;
    avatarUrl?: string;
    language?: string;
  };
  const updated = await updateUser(req.user!.id, { fullName, avatarUrl, language });
  if (!updated) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "User not found" } });
    return;
  }
  res.json({
    success: true,
    data: {
      user: {
        id: updated.id,
        email: updated.email,
        fullName: updated.fullName,
        avatarUrl: updated.avatarUrl,
        language: updated.language ?? "en",
        role: updated.role,
      },
    },
  });
});

// DELETE /api/v1/auth/account
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  await softDeleteUser(req.user!.id);
  await authService.logout(req.user!.id);
  res.json({ success: true, data: { message: "Account deleted" } });
});
