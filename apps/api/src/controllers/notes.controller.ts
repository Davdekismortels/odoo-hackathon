import type { Request, Response, NextFunction } from "express";
import * as notesService from "../services/notes.service.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

// GET /api/v1/trips/:tripId/notes
export const listNotes = asyncHandler(async (req: Request, res: Response) => {
  const notes = notesService.listNotes(String(req.params.tripId), req.user!.id);
  res.json({ success: true, data: { notes } });
});

// POST /api/v1/trips/:tripId/notes
export const addNote = asyncHandler(async (req: Request, res: Response) => {
  const { title, body, stopId } = req.body as { title?: string; body: string; stopId?: string };
  const note = notesService.addNote(String(req.params.tripId), req.user!.id, { title, body, stopId });
  res.status(201).json({ success: true, data: { note } });
});

// PATCH /api/v1/trips/:tripId/notes/:noteId
export const editNote = asyncHandler(async (req: Request, res: Response) => {
  const data = req.body as { title?: string; body?: string };
  const note = notesService.editNote(String(req.params.tripId), req.user!.id, String(req.params.noteId), data);
  res.json({ success: true, data: { note } });
});

// DELETE /api/v1/trips/:tripId/notes/:noteId
export const removeNote = asyncHandler(async (req: Request, res: Response) => {
  notesService.removeNote(String(req.params.tripId), req.user!.id, String(req.params.noteId));
  res.json({ success: true, data: { message: "Deleted" } });
});
