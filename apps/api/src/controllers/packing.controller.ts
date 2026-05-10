import type { Request, Response, NextFunction } from "express";
import * as packingService from "../services/packing.service.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// GET /api/v1/trips/:tripId/packing
export const listItems = asyncHandler(async (req: Request, res: Response) => {
  const result = packingService.listItems(String(req.params.tripId), req.user!.id);
  res.json({ success: true, data: result });
});

// POST /api/v1/trips/:tripId/packing
export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const { name, category = "misc", quantity = 1 } = req.body as { name: string; category?: string; quantity?: number };
  const item = packingService.addItem(String(req.params.tripId), req.user!.id, name, category, quantity);
  res.status(201).json({ success: true, data: { item } });
});

// PATCH /api/v1/trips/:tripId/packing/:itemId/toggle
export const toggleItem = asyncHandler(async (req: Request, res: Response) => {
  const { isPacked } = req.body as { isPacked: boolean };
  const item = packingService.toggleItem(String(req.params.tripId), req.user!.id, String(req.params.itemId), isPacked);
  res.json({ success: true, data: { item } });
});

// PATCH /api/v1/trips/:tripId/packing/:itemId
export const editItem = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body as { name?: string; quantity?: number; category?: string };
  const item = packingService.editItem(String(req.params.tripId), req.user!.id, String(req.params.itemId), data);
  res.json({ success: true, data: { item } });
});

// DELETE /api/v1/trips/:tripId/packing/:itemId
export const removeItem = asyncHandler(async (req: Request, res: Response) => {
  packingService.removeItem(String(req.params.tripId), req.user!.id, String(req.params.itemId));
  res.json({ success: true, data: { message: "Deleted" } });
});

// POST /api/v1/trips/:tripId/packing/reset
export const resetItems = asyncHandler(async (req: Request, res: Response) => {
  const result = packingService.resetItems(String(req.params.tripId), req.user!.id);
  res.json({ success: true, data: result });
});
