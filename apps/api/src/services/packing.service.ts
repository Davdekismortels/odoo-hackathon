import * as packingRepo from "../repositories/packing.repository.js";
import * as tripRepo from "../repositories/trip.repository.js";

function assertTripOwner(tripId: string, userId: string) {
  const trip = tripRepo.findTripById(tripId);
  if (!trip || trip.userId !== userId) {
    throw Object.assign(new Error("Trip not found"), { code: "NOT_FOUND" });
  }
}

export function listItems(tripId: string, userId: string) {
  assertTripOwner(tripId, userId);
  const items = packingRepo.findPackingItems(tripId);
  const total = items.length;
  const packed = items.filter((i) => i.isPacked).length;
  return { items, stats: { total, packed, percent: total ? Math.round((packed / total) * 100) : 0 } };
}

export function addItem(
  tripId: string,
  userId: string,
  name: string,
  category: string,
  quantity: number
) {
  assertTripOwner(tripId, userId);
  return packingRepo.createPackingItem({ tripId, name, category, quantity });
}

export function toggleItem(tripId: string, userId: string, itemId: string, isPacked: boolean) {
  assertTripOwner(tripId, userId);
  return packingRepo.updatePackingItem(itemId, tripId, { isPacked });
}

export function editItem(
  tripId: string,
  userId: string,
  itemId: string,
  data: { name?: string; quantity?: number; category?: string }
) {
  assertTripOwner(tripId, userId);
  return packingRepo.updatePackingItem(itemId, tripId, data);
}

export function removeItem(tripId: string, userId: string, itemId: string) {
  assertTripOwner(tripId, userId);
  packingRepo.deletePackingItem(itemId, tripId);
}

// Reset — unpack all items for a trip
export function resetItems(tripId: string, userId: string) {
  assertTripOwner(tripId, userId);
  const items = packingRepo.findPackingItems(tripId);
  for (const item of items) {
    packingRepo.updatePackingItem(item.id, tripId, { isPacked: false });
  }
  return listItems(tripId, userId);
}
