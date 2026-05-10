import { api } from "./api";

export interface PackingItem {
  id: string;
  tripId: string;
  name: string;
  category: string;
  isPacked: boolean;
  createdAt: string;
}

export const packingApi = {
  list: (tripId: string) => api.get<{ success: true; data: { items: PackingItem[] } }>(`/trips/${tripId}/packing`).then((r) => r.data.data.items),
  add: (tripId: string, itemName: string, category: string) => api.post<{ success: true; data: { item: PackingItem } }>(`/trips/${tripId}/packing`, { itemName, category }).then((r) => r.data.data.item),
  update: (tripId: string, itemId: string, isPacked?: boolean, itemName?: string) => api.patch<{ success: true }>(`/trips/${tripId}/packing/${itemId}`, { isPacked, itemName }).then((r) => r.data),
  remove: (tripId: string, itemId: string) => api.delete<{ success: true }>(`/trips/${tripId}/packing/${itemId}`).then((r) => r.data),
};
