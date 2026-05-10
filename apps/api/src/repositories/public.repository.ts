import { eq, desc, isNull, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { publicItineraries, trips, stops, cities, stopActivities, activities, users } from "../db/schema.js";

// ==================== PUBLISH ====================

export function findPublicByTripId(tripId: string) {
  return db.select().from(publicItineraries).where(eq(publicItineraries.tripId, tripId)).get();
}

export function findPublicBySlug(slug: string) {
  return db.select().from(publicItineraries).where(eq(publicItineraries.slug, slug)).get();
}

export function createPublicEntry(tripId: string, slug: string) {
  db.insert(publicItineraries).values({ tripId, slug }).run();
  return findPublicBySlug(slug)!;
}

export function deletePublicEntry(tripId: string): void {
  db.delete(publicItineraries).where(eq(publicItineraries.tripId, tripId)).run();
}

export function incrementViewCount(slug: string): void {
  db.update(publicItineraries)
    .set({ viewCount: sql`${publicItineraries.viewCount} + 1` })
    .where(eq(publicItineraries.slug, slug))
    .run();
}

export function incrementCloneCount(slug: string): void {
  db.update(publicItineraries)
    .set({ cloneCount: sql`${publicItineraries.cloneCount} + 1` })
    .where(eq(publicItineraries.slug, slug))
    .run();
}

// ==================== PUBLIC TRIP DATA ====================

export function getPublicTripData(slug: string) {
  const pub = findPublicBySlug(slug);
  if (!pub) return null;

  const trip = db.select().from(trips).where(eq(trips.id, pub.tripId)).get();
  if (!trip) return null;

  const tripStops = db
    .select({
      id: stops.id,
      tripId: stops.tripId,
      cityId: stops.cityId,
      arrivalDate: stops.arrivalDate,
      departureDate: stops.departureDate,
      orderIndex: stops.orderIndex,
      accommodation: stops.accommodation,
      notes: stops.notes,
      cityName: cities.name,
      cityCountryCode: cities.countryCode,
    })
    .from(stops)
    .leftJoin(cities, eq(stops.cityId, cities.id))
    .where(eq(stops.tripId, pub.tripId))
    .orderBy(stops.orderIndex)
    .all();

  const stopsWithActivities = tripStops.map((stop) => {
    const acts = db
      .select({
        id: stopActivities.id,
        activityId: stopActivities.activityId,
        scheduledDate: stopActivities.scheduledDate,
        customCost: stopActivities.customCost,
        activityName: activities.name,
        activityCategory: activities.category,
        estimatedCost: activities.estimatedCost,
        durationMin: activities.durationMin,
      })
      .from(stopActivities)
      .leftJoin(activities, eq(stopActivities.activityId, activities.id))
      .where(eq(stopActivities.stopId, stop.id))
      .all();
    return { ...stop, activities: acts };
  });

  return { pub, trip, stops: stopsWithActivities };
}

// ==================== ADMIN STATS ====================

export function getAdminStats() {
  const totalUsers = db.select({ count: sql<number>`count(*)` }).from(users).get()?.count ?? 0;
  const totalTrips = db.select({ count: sql<number>`count(*)` }).from(trips).where(isNull(trips.deletedAt)).get()?.count ?? 0;
  const totalPublic = db.select({ count: sql<number>`count(*)` }).from(publicItineraries).get()?.count ?? 0;

  const topCities = db
    .select({ name: cities.name, count: sql<number>`count(${stops.id})` })
    .from(stops)
    .leftJoin(cities, eq(stops.cityId, cities.id))
    .groupBy(stops.cityId)
    .orderBy(desc(sql`count(${stops.id})`))
    .limit(10)
    .all();

  const recentTrips = db
    .select({ id: trips.id, name: trips.name, createdAt: trips.createdAt, status: trips.status })
    .from(trips)
    .where(isNull(trips.deletedAt))
    .orderBy(desc(trips.createdAt))
    .limit(5)
    .all();

  return { totalUsers, totalTrips, totalPublic, topCities, recentTrips };
}

// ==================== TRENDING PUBLIC ITINERARIES ====================

export function getTrendingPublic(limit = 8) {
  return db
    .select({
      slug: publicItineraries.slug,
      viewCount: publicItineraries.viewCount,
      cloneCount: publicItineraries.cloneCount,
      publishedAt: publicItineraries.publishedAt,
      tripId: trips.id,
      tripName: trips.name,
      tripDescription: trips.description,
      startDate: trips.startDate,
      endDate: trips.endDate,
      currencyCode: trips.currencyCode,
      budgetLimit: trips.budgetLimit,
    })
    .from(publicItineraries)
    .leftJoin(trips, eq(publicItineraries.tripId, trips.id))
    .orderBy(desc(publicItineraries.viewCount))
    .limit(limit)
    .all();
}

// ==================== ADMIN USERS ====================

export function getAdminUsers(search?: string, limit = 50) {
  const rows = db
    .select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      createdAt: users.createdAt,
      deletedAt: users.deletedAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit)
    .all();
  if (!search) return rows;
  const s = search.toLowerCase();
  return rows.filter((u) =>
    u.email?.toLowerCase().includes(s) || u.fullName?.toLowerCase().includes(s)
  );
}
