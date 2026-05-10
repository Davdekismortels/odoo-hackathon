import { api } from "./api";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";

// ==================== TYPES ====================

export interface PublicEntry {
  id: string;
  tripId: string;
  slug: string;
  viewCount: number | null;
  cloneCount: number | null;
  publishedAt: string | null;
}

export interface PublicActivity {
  id: string;
  activityId: string | null;
  scheduledDate: string | null;
  customCost: number | null;
  activityName: string | null;
  activityCategory: string | null;
  estimatedCost: number | null;
  durationMin: number | null;
}

export interface PublicStop {
  id: string;
  arrivalDate: string;
  departureDate: string;
  orderIndex: number;
  accommodation: string | null;
  notes: string | null;
  cityName: string | null;
  cityCountryCode: string | null;
  activities: PublicActivity[];
}

export interface PublicTrip {
  pub: PublicEntry;
  trip: {
    id: string;
    name: string;
    description: string | null;
    startDate: string;
    endDate: string;
    currencyCode: string | null;
    budgetLimit: number | null;
    status: string | null;
  };
  stops: PublicStop[];
}

export interface AdminStats {
  totalUsers: number;
  totalTrips: number;
  totalPublic: number;
  topCities: { name: string | null; count: number }[];
  recentTrips: { id: string; name: string; createdAt: string | null; status: string | null }[];
}

// ==================== API CALLS ====================

export const publicApi = {
  // Authenticated publish / unpublish
  publish: (tripId: string) =>
    api.post<{ success: true; data: { public: PublicEntry } }>(`/trips/${tripId}/publish`)
      .then((r) => r.data.data.public),

  unpublish: (tripId: string) =>
    api.delete(`/trips/${tripId}/publish`),

  // Public (no auth)
  getPublic: (slug: string) =>
    axios.get<{ success: true; data: PublicTrip }>(`${BASE_URL}/public/${slug}`)
      .then((r) => r.data.data),

  // Clone (auth required)
  clone: (slug: string) =>
    api.post<{ success: true; data: { trip: { id: string; name: string } } }>(`/public/${slug}/clone`)
      .then((r) => r.data.data.trip),

  // Admin
  adminStats: () =>
    api.get<{ success: true; data: AdminStats }>("/admin/stats")
      .then((r) => r.data.data),
};
