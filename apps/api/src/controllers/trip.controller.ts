import type { Request, Response, NextFunction } from "express";
import * as tripService from "../services/trip.service.js";

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
  if (e.code === "VALIDATION_ERROR") {
    res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: e.message } });
    return;
  }
  next(err);
}

// ── TRIPS ─────────────────────────────────────────────────────────────────

// GET /api/v1/trips
export function listTrips(req: Request, res: Response, next: NextFunction) {
  try {
    const trips = tripService.getTripsByUser(req.user!.id);
    res.json({ success: true, data: { trips } });
  } catch (err) { next(err); }
}

// GET /api/v1/trips/:id
export function getTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id);
    const trip = tripService.getTripById(id, req.user!.id);
    const stops = tripService.getStopsForTrip(id, req.user!.id);
    res.json({ success: true, data: { trip, stops } });
  } catch (err) { handleError(err, res, next); }
}

// POST /api/v1/trips
export function createTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = tripService.createTrip(req.user!.id, req.body);
    res.status(201).json({ success: true, data: { trip } });
  } catch (err) { handleError(err, res, next); }
}

// PATCH /api/v1/trips/:id
export function updateTrip(req: Request, res: Response, next: NextFunction) {
  try {
    const trip = tripService.updateTrip(String(req.params.id), req.user!.id, req.body);
    res.json({ success: true, data: { trip } });
  } catch (err) { handleError(err, res, next); }
}

// DELETE /api/v1/trips/:id
export function deleteTrip(req: Request, res: Response, next: NextFunction) {
  try {
    tripService.deleteTrip(String(req.params.id), req.user!.id);
    res.json({ success: true, data: { message: "Trip deleted" } });
  } catch (err) { handleError(err, res, next); }
}

// ── STOPS ─────────────────────────────────────────────────────────────────

// GET /api/v1/trips/:id/stops
export function listStops(req: Request, res: Response, next: NextFunction) {
  try {
    const stops = tripService.getStopsForTrip(String(req.params.id), req.user!.id);
    res.json({ success: true, data: { stops } });
  } catch (err) { handleError(err, res, next); }
}

// POST /api/v1/trips/:id/stops
export function addStop(req: Request, res: Response, next: NextFunction) {
  try {
    const stop = tripService.addStop(String(req.params.id), req.user!.id, req.body);
    res.status(201).json({ success: true, data: { stop } });
  } catch (err) { handleError(err, res, next); }
}

// PATCH /api/v1/trips/:tripId/stops/:stopId
export function updateStop(req: Request, res: Response, next: NextFunction) {
  try {
    const stop = tripService.updateStop(String(req.params.stopId), String(req.params.tripId), req.user!.id, req.body);
    res.json({ success: true, data: { stop } });
  } catch (err) { handleError(err, res, next); }
}

// DELETE /api/v1/trips/:tripId/stops/:stopId
export function removeStop(req: Request, res: Response, next: NextFunction) {
  try {
    tripService.removeStop(String(req.params.stopId), String(req.params.tripId), req.user!.id);
    res.json({ success: true, data: { message: "Stop removed" } });
  } catch (err) { handleError(err, res, next); }
}
