import * as notesRepo from "../repositories/notes.repository.js";
import * as tripRepo from "../repositories/trip.repository.js";

function assertTripOwner(tripId: string, userId: string) {
  const trip = tripRepo.findTripById(tripId);
  if (!trip || trip.userId !== userId) {
    throw Object.assign(new Error("Trip not found"), { code: "NOT_FOUND" });
  }
}

export function listNotes(tripId: string, userId: string) {
  assertTripOwner(tripId, userId);
  return notesRepo.findNotes(tripId);
}

export function addNote(
  tripId: string,
  userId: string,
  data: { title?: string; body: string; stopId?: string }
) {
  assertTripOwner(tripId, userId);
  return notesRepo.createNote({ tripId, ...data });
}

export function editNote(
  tripId: string,
  userId: string,
  noteId: string,
  data: { title?: string; body?: string }
) {
  assertTripOwner(tripId, userId);
  const note = notesRepo.findNoteById(noteId, tripId);
  if (!note) throw Object.assign(new Error("Note not found"), { code: "NOT_FOUND" });
  return notesRepo.updateNote(noteId, tripId, data);
}

export function removeNote(tripId: string, userId: string, noteId: string) {
  assertTripOwner(tripId, userId);
  const note = notesRepo.findNoteById(noteId, tripId);
  if (!note) throw Object.assign(new Error("Note not found"), { code: "NOT_FOUND" });
  notesRepo.deleteNote(noteId, tripId);
}
