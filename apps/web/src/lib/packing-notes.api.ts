import { api } from "./api";

// ==================== PACKING ====================

export interface PackingItem {
  id: string;
  tripId: string;
  name: string;
  category: "clothing" | "documents" | "electronics" | "toiletries" | "medication" | "misc";
  quantity: number;
  isPacked: boolean;
  createdAt: string | null;
}

export interface PackingStats {
  total: number;
  packed: number;
  percent: number;
}

export const packingApi = {
  list: (tripId: string) =>
    api.get<{ success: true; data: { items: PackingItem[]; stats: PackingStats } }>(`/trips/${tripId}/packing`)
      .then((r) => r.data.data),

  add: (tripId: string, name: string, category = "misc", quantity = 1) =>
    api.post<{ success: true; data: { item: PackingItem } }>(`/trips/${tripId}/packing`, { name, category, quantity })
      .then((r) => r.data.data.item),

  toggle: (tripId: string, itemId: string, isPacked: boolean) =>
    api.patch<{ success: true; data: { item: PackingItem } }>(`/trips/${tripId}/packing/${itemId}/toggle`, { isPacked })
      .then((r) => r.data.data.item),

  remove: (tripId: string, itemId: string) =>
    api.delete(`/trips/${tripId}/packing/${itemId}`),

  reset: (tripId: string) =>
    api.post(`/trips/${tripId}/packing/reset`),
};

// ==================== NOTES ====================

export interface TripNote {
  id: string;
  tripId: string;
  userId: string;
  stopId: string | null;
  title: string | null;
  body: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export const notesApi = {
  list: (tripId: string) =>
    api.get<{ success: true; data: { notes: TripNote[] } }>(`/trips/${tripId}/notes`)
      .then((r) => r.data.data.notes),

  add: (tripId: string, data: { title?: string; body: string; stopId?: string }) =>
    api.post<{ success: true; data: { note: TripNote } }>(`/trips/${tripId}/notes`, data)
      .then((r) => r.data.data.note),

  edit: (tripId: string, noteId: string, data: { title?: string; body?: string }) =>
    api.patch<{ success: true; data: { note: TripNote } }>(`/trips/${tripId}/notes/${noteId}`, data)
      .then((r) => r.data.data.note),

  remove: (tripId: string, noteId: string) =>
    api.delete(`/trips/${tripId}/notes/${noteId}`),
};
