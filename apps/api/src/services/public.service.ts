import * as publicRepo from "../repositories/public.repository.js";
import * as tripRepo from "../repositories/trip.repository.js";

// Generate a URL-safe slug: "<trip-name-kebab>-<6 random chars>"
function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${base}-${rand}`;
}

function assertOwner(tripId: string, userId: string) {
  const trip = tripRepo.findTripById(tripId);
  if (!trip || trip.userId !== userId) {
    throw Object.assign(new Error("Trip not found"), { code: "NOT_FOUND" });
  }
  return trip;
}

// ==================== PUBLISH ====================

export function publish(tripId: string, userId: string) {
  const trip = assertOwner(tripId, userId);

  // Already published? Return existing slug
  const existing = publicRepo.findPublicByTripId(tripId);
  if (existing) return existing;

  const slug = slugify(trip.name);
  tripRepo.updateTrip(tripId, { isPublic: true });
  return publicRepo.createPublicEntry(tripId, slug);
}

export function unpublish(tripId: string, userId: string) {
  assertOwner(tripId, userId);
  publicRepo.deletePublicEntry(tripId);
  tripRepo.updateTrip(tripId, { isPublic: false });
}

// ==================== PUBLIC VIEW ====================

export function getPublicTrip(slug: string) {
  const data = publicRepo.getPublicTripData(slug);
  if (!data) throw Object.assign(new Error("Itinerary not found"), { code: "NOT_FOUND" });
  publicRepo.incrementViewCount(slug);
  return data;
}

// ==================== CLONE ====================

export function cloneTrip(slug: string, userId: string) {
  const data = publicRepo.getPublicTripData(slug);
  if (!data) throw Object.assign(new Error("Itinerary not found"), { code: "NOT_FOUND" });

  const { trip } = data;
  const newId = crypto.randomUUID();
  tripRepo.createTrip({
    id: newId,
    userId,
    name: `${trip.name} (copy)`,
    description: trip.description ?? undefined,
    startDate: trip.startDate,
    endDate: trip.endDate,
    budgetLimit: trip.budgetLimit ?? undefined,
    currencyCode: trip.currencyCode ?? "USD",
    status: "planning",
  });

  publicRepo.incrementCloneCount(slug);
  return tripRepo.findTripById(newId)!;
}

// ==================== ADMIN ====================

export function getStats() {
  return publicRepo.getAdminStats();
}
