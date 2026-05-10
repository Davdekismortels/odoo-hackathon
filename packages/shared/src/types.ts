// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

// ==================== USER ====================

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  language: string;
  role: "user" | "admin";
  createdAt: string;
}

// ==================== TRIP ====================

export interface Trip {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  coverImageUrl: string | null;
  budgetLimit: number | null;
  currencyCode: string;
  isPublic: boolean;
  status: "planning" | "booked" | "completed" | "archived";
  createdAt: string;
  updatedAt: string;
}

export interface TripWithDetails extends Trip {
  stops: Stop[];
  budgetSummary?: BudgetSummary;
}

// ==================== STOP ====================

export interface Stop {
  id: string;
  tripId: string;
  cityId: string;
  city?: City;
  arrivalDate: string;
  departureDate: string;
  orderIndex: number;
  accommodation: string | null;
  accommodationCost: number;
  transportCost: number;
  mealCostPerDay: number;
  notes: string | null;
  activities?: StopActivity[];
}

// ==================== CITY ====================

export interface City {
  id: string;
  name: string;
  countryCode: string;
  latitude: number;
  longitude: number;
  osmId: number | null;
  population: number | null;
  popularity: number;
  costIndex: number | null;
  description: string | null;
  imageUrl: string | null;
}

// ==================== ACTIVITY ====================

export interface Activity {
  id: string;
  cityId: string;
  name: string;
  category: "sightseeing" | "food" | "adventure" | "culture" | "nightlife" | "shopping" | "nature" | "other";
  description: string | null;
  estimatedCost: number;
  durationMin: number;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
  source: "osm" | "user" | "seed";
}

export interface StopActivity {
  id: string;
  stopId: string;
  activityId: string;
  activity?: Activity;
  scheduledDate: string | null;
  scheduledTime: string | null;
  customCost: number | null;
  notes: string | null;
  orderIndex: number;
}

// ==================== BUDGET ====================

export interface BudgetEntry {
  id: string;
  tripId: string;
  stopId: string | null;
  category: "transport" | "stay" | "meals" | "activity" | "shopping" | "misc";
  amount: number;
  currencyCode: string;
  description: string | null;
  entryDate: string | null;
}

export interface BudgetSummary {
  total: number;
  byCategory: Record<string, number>;
  byDay: Record<string, number>;
  dailyAvg: number;
  overBudgetDays: string[];
  pctOfLimit: number | null;
}

// ==================== PACKING ====================

export interface PackingItem {
  id: string;
  tripId: string;
  name: string;
  category: "clothing" | "documents" | "electronics" | "toiletries" | "medication" | "misc";
  isPacked: boolean;
  quantity: number;
}

// ==================== NOTES ====================

export interface TripNote {
  id: string;
  tripId: string;
  stopId: string | null;
  title: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== PUBLIC ====================

export interface PublicItinerary {
  id: string;
  tripId: string;
  slug: string;
  viewCount: number;
  cloneCount: number;
  publishedAt: string;
  trip?: TripWithDetails;
}

// ==================== COUNTRY ====================

export interface Country {
  code: string;
  name: string;
  currencyCode: string;
  currencySymbol: string | null;
  flagEmoji: string | null;
  region: string | null;
  costIndex: number | null;
}
