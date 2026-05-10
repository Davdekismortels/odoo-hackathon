import { eq, and, isNull, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { trips, stops, cities, countries } from "../db/schema.js";

export type TripRow = typeof trips.$inferSelect;
export type NewTrip = typeof trips.$inferInsert;

// ==================== TRIPS ====================

export function findTripsByUser(userId: string): TripRow[] {
  return db
    .select()
    .from(trips)
    .where(and(eq(trips.userId, userId), isNull(trips.deletedAt)))
    .orderBy(desc(trips.createdAt))
    .all();
}

export function findTripById(id: string): TripRow | undefined {
  return db
    .select()
    .from(trips)
    .where(and(eq(trips.id, id), isNull(trips.deletedAt)))
    .limit(1)
    .all()[0];
}

export function createTrip(data: NewTrip): TripRow {
  db.insert(trips).values(data).run();
  return findTripById(data.id as string)!;
}

export function updateTrip(id: string, data: Partial<NewTrip>): TripRow | undefined {
  db.update(trips)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(trips.id, id))
    .run();
  return findTripById(id);
}

export function softDeleteTrip(id: string): void {
  db.update(trips)
    .set({ deletedAt: new Date().toISOString() })
    .where(eq(trips.id, id))
    .run();
}

// ==================== STOPS ====================

export type StopRow = typeof stops.$inferSelect;
export type NewStop = typeof stops.$inferInsert;

export function findStopsByTrip(tripId: string): (StopRow & { city: { name: string; countryCode: string | null } })[] {
  return db
    .select({
      id: stops.id,
      tripId: stops.tripId,
      cityId: stops.cityId,
      arrivalDate: stops.arrivalDate,
      departureDate: stops.departureDate,
      orderIndex: stops.orderIndex,
      accommodation: stops.accommodation,
      accommodationCost: stops.accommodationCost,
      transportCost: stops.transportCost,
      mealCostPerDay: stops.mealCostPerDay,
      notes: stops.notes,
      createdAt: stops.createdAt,
      city: { name: cities.name, countryCode: cities.countryCode },
    })
    .from(stops)
    .leftJoin(cities, eq(stops.cityId, cities.id))
    .where(eq(stops.tripId, tripId))
    .orderBy(stops.orderIndex)
    .all() as (StopRow & { city: { name: string; countryCode: string | null } })[];
}

export function findStopById(id: string): StopRow | undefined {
  return db.select().from(stops).where(eq(stops.id, id)).limit(1).all()[0];
}

export function createStop(data: NewStop): StopRow {
  db.insert(stops).values(data).run();
  return findStopById(data.id as string)!;
}

export function updateStop(id: string, data: Partial<NewStop>): StopRow | undefined {
  db.update(stops).set(data).where(eq(stops.id, id)).run();
  return findStopById(id);
}

export function deleteStop(id: string): void {
  db.delete(stops).where(eq(stops.id, id)).run();
}

export function countTripStops(tripId: string): number {
  const result = db.select().from(stops).where(eq(stops.tripId, tripId)).all();
  return result.length;
}
