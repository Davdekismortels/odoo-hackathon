import * as itineraryRepo from "../repositories/itinerary.repository.js";
import * as tripRepo from "../repositories/trip.repository.js";

function assertTripOwner(tripId: string, userId: string) {
  const trip = tripRepo.findTripById(tripId);
  if (!trip) throw Object.assign(new Error("Trip not found"), { code: "NOT_FOUND" });
  if (trip.userId !== userId) throw Object.assign(new Error("Access denied"), { code: "FORBIDDEN" });
}

function assertStopBelongsToTrip(stopId: string, tripId: string) {
  const stop = tripRepo.findStopById(stopId);
  if (!stop || stop.tripId !== tripId) {
    throw Object.assign(new Error("Stop not found"), { code: "NOT_FOUND" });
  }
  return stop;
}

// ── Activities per stop ───────────────────────────────────────────────────

export function getStopActivities(tripId: string, stopId: string, userId: string) {
  assertTripOwner(tripId, userId);
  assertStopBelongsToTrip(stopId, tripId);
  return itineraryRepo.findActivitiesForStop(stopId);
}

export function addActivity(tripId: string, stopId: string, userId: string, activityId: string, customCost?: number, notes?: string) {
  assertTripOwner(tripId, userId);
  assertStopBelongsToTrip(stopId, tripId);
  return itineraryRepo.addActivityToStop({ stopId, activityId, customCost, notes });
}

export function removeActivity(tripId: string, stopId: string, entryId: string, userId: string) {
  assertTripOwner(tripId, userId);
  assertStopBelongsToTrip(stopId, tripId);
  itineraryRepo.removeActivityFromStop(entryId);
}

// ── Stop reorder ──────────────────────────────────────────────────────────

export function reorderStops(tripId: string, userId: string, orderedStopIds: string[]) {
  assertTripOwner(tripId, userId);
  const updates = orderedStopIds.map((id, index) => ({ id, orderIndex: index }));
  itineraryRepo.reorderStops(updates);
  return tripRepo.findStopsByTrip(tripId);
}

// ── Budget summary ────────────────────────────────────────────────────────

export function getBudgetSummary(tripId: string, userId: string) {
  assertTripOwner(tripId, userId);
  const trip = tripRepo.findTripById(tripId)!;
  const stops = tripRepo.findStopsByTrip(tripId);

  let totalAccommodation = 0;
  let totalTransport = 0;
  let totalMeals = 0;
  let totalActivities = 0;

  const stopBreakdowns = stops.map((stop) => {
    // Parse date-only strings as UTC midnight to avoid DST-caused rounding errors
    const arrivalMs  = stop.arrivalDate   ? Date.UTC(...(stop.arrivalDate.split("-").map(Number)   as [number, number, number])) : 0;
    const departMs   = stop.departureDate ? Date.UTC(...(stop.departureDate.split("-").map(Number)  as [number, number, number])) : 0;
    const nights = stop.arrivalDate && stop.departureDate
      ? Math.max(0, Math.round((departMs - arrivalMs) / 86_400_000))
      : 0;

    const accom = (stop.accommodationCost ?? 0) * nights;
    const transport = stop.transportCost ?? 0;
    const meals = (stop.mealCostPerDay ?? 0) * nights;

    const stopActivities = itineraryRepo.findActivitiesForStop(stop.id);
    const activitiesCost = stopActivities.reduce((sum, a) => sum + (a.customCost ?? a.activity?.estimatedCost ?? 0), 0);

    totalAccommodation += accom;
    totalTransport += transport;
    totalMeals += meals;
    totalActivities += activitiesCost;

    return {
      stopId: stop.id,
      city: stop.city?.name ?? "Unknown",
      nights,
      accommodation: accom,
      transport,
      meals,
      activities: activitiesCost,
      subtotal: accom + transport + meals + activitiesCost,
    };
  });

  const grandTotal = totalAccommodation + totalTransport + totalMeals + totalActivities;
  const budgetLimit = trip.budgetLimit ?? null;
  const remaining = budgetLimit !== null ? budgetLimit - grandTotal : null;

  return {
    currencyCode: trip.currencyCode,
    budgetLimit,
    grandTotal,
    remaining,
    isOverBudget: remaining !== null && remaining < 0,
    breakdown: {
      accommodation: totalAccommodation,
      transport: totalTransport,
      meals: totalMeals,
      activities: totalActivities,
    },
    stops: stopBreakdowns,
  };
}
