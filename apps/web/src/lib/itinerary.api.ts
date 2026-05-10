import { api } from "./api";

export interface BudgetSummary {
  currencyCode: string;
  budgetLimit: number | null;
  grandTotal: number;
  remaining: number | null;
  isOverBudget: boolean;
  breakdown: {
    accommodation: number;
    transport: number;
    meals: number;
    activities: number;
  };
  stops: Array<{
    stopId: string;
    city: string;
    nights: number;
    accommodation: number;
    transport: number;
    meals: number;
    activities: number;
    subtotal: number;
  }>;
}

export interface StopActivity {
  id: string;
  stopId: string;
  activityId: string;
  customCost?: number | null;
  notes?: string | null;
  activity: {
    name: string;
    category: string | null;
    durationMin: number | null;
    estimatedCost: number | null;
    description: string | null;
    imageUrl: string | null;
  } | null;
}

export const itineraryApi = {
  getBudget: (tripId: string) =>
    api.get<{ success: true; data: BudgetSummary }>(`/trips/${tripId}/budget`).then((r) => r.data.data),

  reorderStops: (tripId: string, stopIds: string[]) =>
    api.patch(`/trips/${tripId}/stops/reorder`, { stopIds }),

  listActivities: (tripId: string, stopId: string) =>
    api.get<{ success: true; data: { activities: StopActivity[] } }>(`/trips/${tripId}/stops/${stopId}/activities`).then((r) => r.data.data.activities),

  addActivity: (tripId: string, stopId: string, activityId: string, customCost?: number, notes?: string) =>
    api.post<{ success: true; data: { entry: StopActivity } }>(`/trips/${tripId}/stops/${stopId}/activities`, { activityId, customCost, notes }).then((r) => r.data.data.entry),

  removeActivity: (tripId: string, stopId: string, entryId: string) =>
    api.delete(`/trips/${tripId}/stops/${stopId}/activities/${entryId}`),
};
