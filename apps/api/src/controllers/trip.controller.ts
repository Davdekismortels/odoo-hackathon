import type { Request, Response, NextFunction } from "express";
import * as tripService from "../services/trip.service.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// ── TRIPS ─────────────────────────────────────────────────────────────────

// GET /api/v1/trips
export const listTrips = asyncHandler(async (req: Request, res: Response) => {
  const trips = tripService.getTripsByUser(req.user!.id);
  res.json({ success: true, data: { trips } });
});

// GET /api/v1/trips/:id
export const getTrip = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const trip = tripService.getTripById(id, req.user!.id);
  const stops = tripService.getStopsForTrip(id, req.user!.id);
  res.json({ success: true, data: { trip, stops } });
});

// POST /api/v1/trips
export const createTrip = asyncHandler(async (req: Request, res: Response) => {
  const trip = tripService.createTrip(req.user!.id, req.body);
  res.status(201).json({ success: true, data: { trip } });
});

// PATCH /api/v1/trips/:id
export const updateTrip = asyncHandler(async (req: Request, res: Response) => {
  const trip = tripService.updateTrip(String(req.params.id), req.user!.id, req.body);
  res.json({ success: true, data: { trip } });
});

// DELETE /api/v1/trips/:id
export const deleteTrip = asyncHandler(async (req: Request, res: Response) => {
  tripService.deleteTrip(String(req.params.id), req.user!.id);
  res.json({ success: true, data: { message: "Trip deleted" } });
});

// ── STOPS ─────────────────────────────────────────────────────────────────

// GET /api/v1/trips/:id/stops
export const listStops = asyncHandler(async (req: Request, res: Response) => {
  const stops = tripService.getStopsForTrip(String(req.params.id), req.user!.id);
  res.json({ success: true, data: { stops } });
});

// POST /api/v1/trips/:id/stops
export const addStop = asyncHandler(async (req: Request, res: Response) => {
  const stop = tripService.addStop(String(req.params.id), req.user!.id, req.body);
  res.status(201).json({ success: true, data: { stop } });
});

// PATCH /api/v1/trips/:tripId/stops/:stopId
export const updateStop = asyncHandler(async (req: Request, res: Response) => {
  const stop = tripService.updateStop(String(req.params.stopId), String(req.params.tripId), req.user!.id, req.body);
  res.json({ success: true, data: { stop } });
});

// DELETE /api/v1/trips/:tripId/stops/:stopId
export const removeStop = asyncHandler(async (req: Request, res: Response) => {
  tripService.removeStop(String(req.params.stopId), String(req.params.tripId), req.user!.id);
  res.json({ success: true, data: { message: "Stop removed" } });
});
