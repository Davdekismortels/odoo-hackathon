import { api } from "./api";

export interface Trip {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  startDate: string;
  endDate: string;
  coverImageUrl?: string | null;
  budgetLimit?: number | null;
  currencyCode: string;
  isPublic: boolean;
  status: "planning" | "booked" | "completed" | "archived";
  createdAt?: string | null;
  updatedAt?: string | null;
  stopCount?: number;
}

export interface Stop {
  id: string;
  tripId: string;
  cityId: string;
  arrivalDate: string;
  departureDate: string;
  orderIndex: number;
  accommodation?: string | null;
  accommodationCost?: number | null;
  transportCost?: number | null;
  mealCostPerDay?: number | null;
  notes?: string | null;
  city: { name: string; countryCode: string | null };
}

export interface CreateTripPayload {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  budgetLimit?: number;
  currencyCode?: string;
}

export interface CreateStopPayload {
  cityId: string;
  arrivalDate: string;
  departureDate: string;
  accommodation?: string;
  accommodationCost?: number;
  transportCost?: number;
  mealCostPerDay?: number;
  notes?: string;
}

export interface City {
  id: string;
  name: string;
  countryCode: string | null;
  latitude: number;
  longitude: number;
  description?: string | null;
  imageUrl?: string | null;
  popularity?: number | null;
}

// ── Trips ──────────────────────────────────────────────────────────────────
export const tripsApi = {
  list: () => api.get<{ success: true; data: { trips: Trip[] } }>("/trips").then((r) => r.data.data.trips),
  get: (id: string) => api.get<{ success: true; data: { trip: Trip; stops: Stop[] } }>(`/trips/${id}`).then((r) => r.data.data),
  create: (payload: CreateTripPayload) => api.post<{ success: true; data: { trip: Trip } }>("/trips", payload).then((r) => r.data.data.trip),
  update: (id: string, payload: Partial<CreateTripPayload>) => api.patch<{ success: true; data: { trip: Trip } }>(`/trips/${id}`, payload).then((r) => r.data.data.trip),
  delete: (id: string) => api.delete(`/trips/${id}`),
};

// ── Stops ──────────────────────────────────────────────────────────────────
export const stopsApi = {
  list: (tripId: string) => api.get<{ success: true; data: { stops: Stop[] } }>(`/trips/${tripId}/stops`).then((r) => r.data.data.stops),
  add: (tripId: string, payload: CreateStopPayload) => api.post<{ success: true; data: { stop: Stop } }>(`/trips/${tripId}/stops`, payload).then((r) => r.data.data.stop),
  update: (tripId: string, stopId: string, payload: Partial<CreateStopPayload>) => api.patch<{ success: true; data: { stop: Stop } }>(`/trips/${tripId}/stops/${stopId}`, payload).then((r) => r.data.data.stop),
  remove: (tripId: string, stopId: string) => api.delete(`/trips/${tripId}/stops/${stopId}`),
};

// ── Explore ────────────────────────────────────────────────────────────────
export const exploreApi = {
  cities: (q?: string) => api.get<{ success: true; data: { cities: City[] } }>("/explore/cities", { params: { q } }).then((r) => r.data.data.cities),
  countries: () => api.get<{ success: true; data: { countries: unknown[] } }>("/explore/countries").then((r) => r.data.data.countries),
};
