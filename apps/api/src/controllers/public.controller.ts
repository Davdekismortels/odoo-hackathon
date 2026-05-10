import type { Request, Response, NextFunction } from "express";
import * as publicService from "../services/public.service.js";

function handleError(err: unknown, res: Response, next: NextFunction) {
  const e = err as NodeJS.ErrnoException;
  if (e.code === "NOT_FOUND") {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: e.message } });
    return;
  }
  if (e.code === "FORBIDDEN") {
    res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: e.message } });
    return;
  }
  next(err);
}

// POST /api/v1/trips/:tripId/publish  (auth required)
export function publish(req: Request, res: Response, next: NextFunction) {
  try {
    const pub = publicService.publish(String(req.params.tripId), req.user!.id);
    res.json({ success: true, data: { public: pub } });
  } catch (err) { handleError(err, res, next); }
}

// DELETE /api/v1/trips/:tripId/publish  (auth required)
export function unpublish(req: Request, res: Response, next: NextFunction) {
  try {
    publicService.unpublish(String(req.params.tripId), req.user!.id);
    res.json({ success: true, data: { message: "Unpublished" } });
  } catch (err) { handleError(err, res, next); }
}

// GET /api/v1/public/:slug  (no auth)
export function getPublic(req: Request, res: Response, next: NextFunction) {
  try {
    const data = publicService.getPublicTrip(String(req.params.slug));
    res.json({ success: true, data });
  } catch (err) { handleError(err, res, next); }
}

// POST /api/v1/public/:slug/clone  (auth required)
export function clone(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = publicService.cloneTrip(String(req.params.slug), req.user!.id);
    res.status(201).json({ success: true, data: { trip } });
  } catch (err) { handleError(err, res, next); }
}

// GET /api/v1/admin/stats  (auth required, admin role)
export function adminStats(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user!.role !== "admin") {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Admin only" } });
      return;
    }
    const stats = publicService.getStats();
    res.json({ success: true, data: stats });
  } catch (err) { handleError(err, res, next); }
}

// GET /api/v1/admin/users  (auth required, admin role)
export function adminUsers(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.user!.role !== "admin") {
      res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Admin only" } });
      return;
    }
    const search = req.query.q as string | undefined;
    const users = publicService.getAdminUsers(search);
    res.json({ success: true, data: { users } });
  } catch (err) { handleError(err, res, next); }
}

// GET /api/v1/public  (no auth) — trending itineraries
export function getTrending(req: Request, res: Response, next: NextFunction) {
  try {
    const limit = Math.min(20, Number(req.query.limit ?? 8) || 8);
    const items = publicService.getTrending(limit);
    res.json({ success: true, data: { items } });
  } catch (err) { handleError(err, res, next); }
}
