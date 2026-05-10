import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { stopActivities, activities } from "../db/schema.js";

export type StopActivityRow = typeof stopActivities.$inferSelect;

/** All activities added to a specific stop, joined with activity details */
export function findActivitiesForStop(stopId: string) {
  return db
    .select({
      id: stopActivities.id,
      stopId: stopActivities.stopId,
      activityId: stopActivities.activityId,
      scheduledDate: stopActivities.scheduledDate,
      customCost: stopActivities.customCost,
      notes: stopActivities.notes,
      activity: {
        name: activities.name,
        category: activities.category,
        durationMin: activities.durationMin,
        estimatedCost: activities.estimatedCost,
        description: activities.description,
        imageUrl: activities.imageUrl,
      },
    })
    .from(stopActivities)
    .leftJoin(activities, eq(stopActivities.activityId, activities.id))
    .where(eq(stopActivities.stopId, stopId))
    .all();
}

export function addActivityToStop(data: {
  stopId: string;
  activityId: string;
  customCost?: number;
  notes?: string;
}) {
  const row = {
    stopId: data.stopId,
    activityId: data.activityId,
    customCost: data.customCost,
    notes: data.notes,
  };
  db.insert(stopActivities).values(row).run();
  // Fetch the last inserted row
  const all = findActivitiesForStop(data.stopId);
  return all[all.length - 1];
}

export function removeActivityFromStop(id: string): void {
  db.delete(stopActivities).where(eq(stopActivities.id, id)).run();
}

/** Update the orderIndex of multiple stops (for drag-drop reorder) */
export function reorderStops(updates: Array<{ id: string; orderIndex: number }>): void {
  const { getRawDb } = require("../db/index.js");
  const raw = getRawDb();
  const stmt = raw.prepare("UPDATE stops SET order_index = ? WHERE id = ?");
  const runAll = raw.transaction((rows: Array<{ id: string; orderIndex: number }>) => {
    for (const row of rows) {
      stmt.run(row.orderIndex, row.id);
    }
  });
  runAll(updates);
}
