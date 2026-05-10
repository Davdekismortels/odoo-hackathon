import type { Request, Response, NextFunction } from "express";
import * as itineraryService from "../services/itinerary.service.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// GET /api/v1/trips/:tripId/stops/:stopId/activities
export const listStopActivities = asyncHandler(async (req: Request, res: Response) => {
  const data = itineraryService.getStopActivities(
    String(req.params.tripId), String(req.params.stopId), req.user!.id
  );
  res.json({ success: true, data: { activities: data } });
});

// POST /api/v1/trips/:tripId/stops/:stopId/activities
export const addStopActivity = asyncHandler(async (req: Request, res: Response) => {
  const { activityId, customCost, notes } = req.body as { activityId: string; customCost?: number; notes?: string };
  const entry = itineraryService.addActivity(
    String(req.params.tripId), String(req.params.stopId), req.user!.id, activityId, customCost, notes
  );
  res.status(201).json({ success: true, data: { entry } });
});

// DELETE /api/v1/trips/:tripId/stops/:stopId/activities/:entryId
export const removeStopActivity = asyncHandler(async (req: Request, res: Response) => {
  itineraryService.removeActivity(
    String(req.params.tripId), String(req.params.stopId), String(req.params.entryId), req.user!.id
  );
  res.json({ success: true, data: { message: "Activity removed" } });
});

// PATCH /api/v1/trips/:tripId/stops/reorder
export const reorderStops = asyncHandler(async (req: Request, res: Response) => {
  const { stopIds } = req.body as { stopIds: string[] };
  const stops = itineraryService.reorderStops(String(req.params.tripId), req.user!.id, stopIds);
  res.json({ success: true, data: { stops } });
});

// GET /api/v1/trips/:tripId/budget
export const getBudget = asyncHandler(async (req: Request, res: Response) => {
  const summary = itineraryService.getBudgetSummary(String(req.params.tripId), req.user!.id);
  res.json({ success: true, data: summary });
});
