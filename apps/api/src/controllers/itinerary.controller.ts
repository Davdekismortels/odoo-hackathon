import type { Request, Response, NextFunction } from "express";
import * as itineraryService from "../services/itinerary.service.js";

function handleError(err: unknown, res: Response, next: NextFunction) {
  const e = err as NodeJS.ErrnoException;
  if (e.code === "NOT_FOUND") return res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: e.message } });
  if (e.code === "FORBIDDEN") return res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: e.message } });
  next(err);
}

// GET /api/v1/trips/:tripId/stops/:stopId/activities
export function listStopActivities(req: Request, res: Response, next: NextFunction) {
  try {
    const data = itineraryService.getStopActivities(
      String(req.params.tripId), String(req.params.stopId), req.user!.id
    );
    res.json({ success: true, data: { activities: data } });
  } catch (err) { handleError(err, res, next); }
}

// POST /api/v1/trips/:tripId/stops/:stopId/activities
export function addStopActivity(req: Request, res: Response, next: NextFunction) {
  try {
    const { activityId, customCost, notes } = req.body as { activityId: string; customCost?: number; notes?: string };
    const entry = itineraryService.addActivity(
      String(req.params.tripId), String(req.params.stopId), req.user!.id, activityId, customCost, notes
    );
    res.status(201).json({ success: true, data: { entry } });
  } catch (err) { handleError(err, res, next); }
}

// DELETE /api/v1/trips/:tripId/stops/:stopId/activities/:entryId
export function removeStopActivity(req: Request, res: Response, next: NextFunction) {
  try {
    itineraryService.removeActivity(
      String(req.params.tripId), String(req.params.stopId), String(req.params.entryId), req.user!.id
    );
    res.json({ success: true, data: { message: "Activity removed" } });
  } catch (err) { handleError(err, res, next); }
}

// PATCH /api/v1/trips/:tripId/stops/reorder
export function reorderStops(req: Request, res: Response, next: NextFunction) {
  try {
    const { stopIds } = req.body as { stopIds: string[] };
    if (!Array.isArray(stopIds)) {
      res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "stopIds must be an array" } });
      return;
    }
    const stops = itineraryService.reorderStops(String(req.params.tripId), req.user!.id, stopIds);
    res.json({ success: true, data: { stops } });
  } catch (err) { handleError(err, res, next); }
}

// GET /api/v1/trips/:tripId/budget
export function getBudget(req: Request, res: Response, next: NextFunction) {
  try {
    const summary = itineraryService.getBudgetSummary(String(req.params.tripId), req.user!.id);
    res.json({ success: true, data: summary });
  } catch (err) { handleError(err, res, next); }
}
