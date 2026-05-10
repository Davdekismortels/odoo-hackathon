import type { Request, Response, NextFunction } from "express";
import * as packingService from "../services/packing.service.js";

function handleError(err: unknown, res: Response, next: NextFunction) {
  const e = err as NodeJS.ErrnoException;
  if (e.code === "NOT_FOUND") { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: e.message } }); return; }
  next(err);
}

// GET /api/v1/trips/:tripId/packing
export function listItems(req: Request, res: Response, next: NextFunction) {
  try {
    const result = packingService.listItems(String(req.params.tripId), req.user!.id);
    res.json({ success: true, data: result });
  } catch (err) { handleError(err, res, next); }
}

// POST /api/v1/trips/:tripId/packing
export function addItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, category = "misc", quantity = 1 } = req.body as { name: string; category?: string; quantity?: number };
    const item = packingService.addItem(String(req.params.tripId), req.user!.id, name, category, quantity);
    res.status(201).json({ success: true, data: { item } });
  } catch (err) { handleError(err, res, next); }
}

// PATCH /api/v1/trips/:tripId/packing/:itemId/toggle
export function toggleItem(req: Request, res: Response, next: NextFunction) {
  try {
    const { isPacked } = req.body as { isPacked: boolean };
    const item = packingService.toggleItem(String(req.params.tripId), req.user!.id, String(req.params.itemId), isPacked);
    res.json({ success: true, data: { item } });
  } catch (err) { handleError(err, res, next); }
}

// PATCH /api/v1/trips/:tripId/packing/:itemId
export function editItem(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.body as { name?: string; quantity?: number; category?: string };
    const item = packingService.editItem(String(req.params.tripId), req.user!.id, String(req.params.itemId), data);
    res.json({ success: true, data: { item } });
  } catch (err) { handleError(err, res, next); }
}

// DELETE /api/v1/trips/:tripId/packing/:itemId
export function removeItem(req: Request, res: Response, next: NextFunction) {
  try {
    packingService.removeItem(String(req.params.tripId), req.user!.id, String(req.params.itemId));
    res.json({ success: true, data: { message: "Deleted" } });
  } catch (err) { handleError(err, res, next); }
}

// POST /api/v1/trips/:tripId/packing/reset
export function resetItems(req: Request, res: Response, next: NextFunction) {
  try {
    const result = packingService.resetItems(String(req.params.tripId), req.user!.id);
    res.json({ success: true, data: result });
  } catch (err) { handleError(err, res, next); }
}
