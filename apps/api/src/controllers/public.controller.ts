import type { Request, Response, NextFunction } from "express";
import * as publicService from "../services/public.service.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// POST /api/v1/trips/:tripId/publish  (auth required)
export const publish = asyncHandler(async (req: Request, res: Response) => {
  const pub = publicService.publish(String(req.params.tripId), req.user!.id);
  res.json({ success: true, data: { public: pub } });
});

// DELETE /api/v1/trips/:tripId/publish  (auth required)
export const unpublish = asyncHandler(async (req: Request, res: Response) => {
  publicService.unpublish(String(req.params.tripId), req.user!.id);
  res.json({ success: true, data: { message: "Unpublished" } });
});

// GET /api/v1/public/:slug  (no auth)
export const getPublic = asyncHandler(async (req: Request, res: Response) => {
  const data = publicService.getPublicTrip(String(req.params.slug));
  res.json({ success: true, data });
});

// POST /api/v1/public/:slug/clone  (auth required)
export const clone = asyncHandler(async (req: Request, res: Response) => {
  const trip = publicService.cloneTrip(String(req.params.slug), req.user!.id);
  res.status(201).json({ success: true, data: { trip } });
});

// GET /api/v1/admin/stats  (auth required, admin role)
export const adminStats = asyncHandler(async (req: Request, res: Response) => {
  if (req.user!.role !== "admin") {
    res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Admin only" } });
    return;
  }
  const stats = publicService.getStats();
  res.json({ success: true, data: stats });
});

// GET /api/v1/admin/users  (auth required, admin role)
export const adminUsers = asyncHandler(async (req: Request, res: Response) => {
  if (req.user!.role !== "admin") {
    res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Admin only" } });
    return;
  }
  const search = req.query.q as string | undefined;
  const users = publicService.getAdminUsers(search);
  res.json({ success: true, data: { users } });
});

// GET /api/v1/public  (no auth) — trending itineraries
export const getTrending = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(20, Number(req.query.limit ?? 8) || 8);
  const items = publicService.getTrending(limit);
  res.json({ success: true, data: { items } });
});
