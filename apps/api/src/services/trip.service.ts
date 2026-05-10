import * as tripRepo from "../repositories/trip.repository.js";
import type { TripRow, StopRow } from "../repositories/trip.repository.js";

// ==================== TRIP BUSINESS LOGIC ====================

export interface CreateTripInput {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  coverImageUrl?: string;
  budgetLimit?: number;
  currencyCode?: string;
}

export interface UpdateTripInput extends Partial<CreateTripInput> {
  isPublic?: boolean;
  status?: "planning" | "booked" | "completed" | "archived";
}

export function getTripsByUser(userId: string) {
  const rows = tripRepo.findTripsByUser(userId);
  return rows.map((t) => ({
    ...t,
    stopCount: tripRepo.countTripStops(t.id),
  }));
}

export function getTripById(id: string, requestingUserId: string): TripRow {
  const trip = tripRepo.findTripById(id);
  if (!trip) throw Object.assign(new Error("Trip not found"), { code: "NOT_FOUND" });
  if (trip.userId !== requestingUserId) {
    throw Object.assign(new Error("Access denied"), { code: "FORBIDDEN" });
  }
  return trip;
}

export function createTrip(userId: string, input: CreateTripInput): TripRow {
  if (new Date(input.startDate) > new Date(input.endDate)) {
    throw Object.assign(new Error("Start date must be before end date"), { code: "VALIDATION_ERROR" });
  }
  return tripRepo.createTrip({
    id: crypto.randomUUID(),
    userId,
    name: input.name,
    description: input.description,
    startDate: input.startDate,
    endDate: input.endDate,
    coverImageUrl: input.coverImageUrl,
    budgetLimit: input.budgetLimit,
    currencyCode: input.currencyCode ?? "USD",
  });
}

export function updateTrip(id: string, userId: string, input: UpdateTripInput): TripRow {
  const trip = tripRepo.findTripById(id);
  if (!trip) throw Object.assign(new Error("Trip not found"), { code: "NOT_FOUND" });
  if (trip.userId !== userId) throw Object.assign(new Error("Access denied"), { code: "FORBIDDEN" });

  if (input.startDate && input.endDate && new Date(input.startDate) > new Date(input.endDate)) {
    throw Object.assign(new Error("Start date must be before end date"), { code: "VALIDATION_ERROR" });
  }

  return tripRepo.updateTrip(id, input) ?? trip;
}

export function deleteTrip(id: string, userId: string): void {
  const trip = tripRepo.findTripById(id);
  if (!trip) throw Object.assign(new Error("Trip not found"), { code: "NOT_FOUND" });
  if (trip.userId !== userId) throw Object.assign(new Error("Access denied"), { code: "FORBIDDEN" });
  tripRepo.softDeleteTrip(id);
}

// ==================== STOP BUSINESS LOGIC ====================

export interface CreateStopInput {
  cityId: string;
  arrivalDate: string;
  departureDate: string;
  accommodation?: string;
  accommodationCost?: number;
  transportCost?: number;
  mealCostPerDay?: number;
  notes?: string;
}

export function getStopsForTrip(tripId: string, userId: string) {
  const trip = tripRepo.findTripById(tripId);
  if (!trip) throw Object.assign(new Error("Trip not found"), { code: "NOT_FOUND" });
  if (trip.userId !== userId) throw Object.assign(new Error("Access denied"), { code: "FORBIDDEN" });
  return tripRepo.findStopsByTrip(tripId);
}

export function addStop(tripId: string, userId: string, input: CreateStopInput): StopRow {
  const trip = tripRepo.findTripById(tripId);
  if (!trip) throw Object.assign(new Error("Trip not found"), { code: "NOT_FOUND" });
  if (trip.userId !== userId) throw Object.assign(new Error("Access denied"), { code: "FORBIDDEN" });

  const existingStops = tripRepo.findStopsByTrip(tripId);
  const orderIndex = existingStops.length; // append to end

  return tripRepo.createStop({
    id: crypto.randomUUID(),
    tripId,
    cityId: input.cityId,
    arrivalDate: input.arrivalDate,
    departureDate: input.departureDate,
    orderIndex,
    accommodation: input.accommodation,
    accommodationCost: input.accommodationCost ?? 0,
    transportCost: input.transportCost ?? 0,
    mealCostPerDay: input.mealCostPerDay ?? 0,
    notes: input.notes,
  });
}

export function updateStop(stopId: string, tripId: string, userId: string, input: Partial<CreateStopInput>): StopRow {
  const trip = tripRepo.findTripById(tripId);
  if (!trip) throw Object.assign(new Error("Trip not found"), { code: "NOT_FOUND" });
  if (trip.userId !== userId) throw Object.assign(new Error("Access denied"), { code: "FORBIDDEN" });

  const stop = tripRepo.findStopById(stopId);
  if (!stop || stop.tripId !== tripId) throw Object.assign(new Error("Stop not found"), { code: "NOT_FOUND" });

  return tripRepo.updateStop(stopId, input) ?? stop;
}

export function removeStop(stopId: string, tripId: string, userId: string): void {
  const trip = tripRepo.findTripById(tripId);
  if (!trip) throw Object.assign(new Error("Trip not found"), { code: "NOT_FOUND" });
  if (trip.userId !== userId) throw Object.assign(new Error("Access denied"), { code: "FORBIDDEN" });

  const stop = tripRepo.findStopById(stopId);
  if (!stop || stop.tripId !== tripId) throw Object.assign(new Error("Stop not found"), { code: "NOT_FOUND" });

  tripRepo.deleteStop(stopId);
}
