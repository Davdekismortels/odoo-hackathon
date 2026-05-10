import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { packingItems } from "../db/schema.js";

export function findPackingItems(tripId: string) {
  return db
    .select()
    .from(packingItems)
    .where(eq(packingItems.tripId, tripId))
    .all();
}

export function createPackingItem(data: {
  tripId: string;
  name: string;
  category: string;
  quantity: number;
}) {
  const row = {
    tripId: data.tripId,
    name: data.name,
    category: data.category as typeof packingItems.$inferInsert["category"],
    quantity: data.quantity,
  };
  db.insert(packingItems).values(row).run();
  return db
    .select()
    .from(packingItems)
    .where(eq(packingItems.tripId, data.tripId))
    .all()
    .slice(-1)[0];
}

export function updatePackingItem(
  id: string,
  tripId: string,
  data: { isPacked?: boolean; name?: string; quantity?: number; category?: string }
) {
  db.update(packingItems)
    .set({
      ...(data.isPacked !== undefined ? { isPacked: !!data.isPacked } : {}),
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.quantity !== undefined ? { quantity: data.quantity } : {}),
      ...(data.category !== undefined ? { category: data.category as typeof packingItems.$inferInsert["category"] } : {}),
    })
    .where(and(eq(packingItems.id, id), eq(packingItems.tripId, tripId)))
    .run();
  return db.select().from(packingItems).where(eq(packingItems.id, id)).get();
}

export function deletePackingItem(id: string, tripId: string): void {
  db.delete(packingItems)
    .where(and(eq(packingItems.id, id), eq(packingItems.tripId, tripId)))
    .run();
}

/** Bulk reset: mark ALL items for a trip as unpacked in a single SQL UPDATE */
export function resetAllPackingItems(tripId: string): void {
  db.update(packingItems)
    .set({ isPacked: false })
    .where(eq(packingItems.tripId, tripId))
    .run();
}
