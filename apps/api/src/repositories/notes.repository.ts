import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { tripNotes } from "../db/schema.js";

export function findNotes(tripId: string) {
  return db
    .select()
    .from(tripNotes)
    .where(eq(tripNotes.tripId, tripId))
    .all();
}

export function findNoteById(id: string, tripId: string) {
  return db
    .select()
    .from(tripNotes)
    .where(and(eq(tripNotes.id, id), eq(tripNotes.tripId, tripId)))
    .get();
}

export function createNote(data: {
  tripId: string;
  stopId?: string;
  title?: string;
  body: string;
}) {
  db.insert(tripNotes).values({
    tripId: data.tripId,
    stopId: data.stopId,
    title: data.title,
    body: data.body,
  }).run();
  const all = findNotes(data.tripId);
  return all[all.length - 1];
}

export function updateNote(
  id: string,
  tripId: string,
  data: { title?: string; body?: string }
) {
  db.update(tripNotes)
    .set({ ...data })
    .where(and(eq(tripNotes.id, id), eq(tripNotes.tripId, tripId)))
    .run();
  return findNoteById(id, tripId);
}

export function deleteNote(id: string, tripId: string): void {
  db.delete(tripNotes)
    .where(and(eq(tripNotes.id, id), eq(tripNotes.tripId, tripId)))
    .run();
}
