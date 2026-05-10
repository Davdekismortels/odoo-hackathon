import type { Request, Response, NextFunction } from "express";
import * as notesService from "../services/notes.service.js";

function handleError(err: unknown, res: Response, next: NextFunction) {
  const e = err as NodeJS.ErrnoException;
  if (e.code === "NOT_FOUND") { res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: e.message } }); return; }
  next(err);
}

// GET /api/v1/trips/:tripId/notes
export function listNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const notes = notesService.listNotes(String(req.params.tripId), req.user!.id);
    res.json({ success: true, data: { notes } });
  } catch (err) { handleError(err, res, next); }
}

// POST /api/v1/trips/:tripId/notes
export function addNote(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, body, stopId } = req.body as { title?: string; body: string; stopId?: string };
    const note = notesService.addNote(String(req.params.tripId), req.user!.id, { title, body, stopId });
    res.status(201).json({ success: true, data: { note } });
  } catch (err) { handleError(err, res, next); }
}

// PATCH /api/v1/trips/:tripId/notes/:noteId
export function editNote(req: Request, res: Response, next: NextFunction) {
  try {
    const data = req.body as { title?: string; body?: string };
    const note = notesService.editNote(String(req.params.tripId), req.user!.id, String(req.params.noteId), data);
    res.json({ success: true, data: { note } });
  } catch (err) { handleError(err, res, next); }
}

// DELETE /api/v1/trips/:tripId/notes/:noteId
export function removeNote(req: Request, res: Response, next: NextFunction) {
  try {
    notesService.removeNote(String(req.params.tripId), req.user!.id, String(req.params.noteId));
    res.json({ success: true, data: { message: "Deleted" } });
  } catch (err) { handleError(err, res, next); }
}
