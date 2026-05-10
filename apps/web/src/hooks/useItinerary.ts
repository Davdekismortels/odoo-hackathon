import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { itineraryApi } from "../lib/itinerary.api";

const KEYS = {
  budget: (tripId: string) => ["trips", tripId, "budget"] as const,
  stopActivities: (tripId: string, stopId: string) => ["trips", tripId, "stops", stopId, "activities"] as const,
};

export function useBudget(tripId: string) {
  return useQuery({
    queryKey: KEYS.budget(tripId),
    queryFn: () => itineraryApi.getBudget(tripId),
    enabled: !!tripId,
  });
}

export function useStopActivities(tripId: string, stopId: string) {
  return useQuery({
    queryKey: KEYS.stopActivities(tripId, stopId),
    queryFn: () => itineraryApi.listActivities(tripId, stopId),
    enabled: !!tripId && !!stopId,
  });
}

export function useAddActivity(tripId: string, stopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ activityId, cost, notes }: { activityId: string; cost?: number; notes?: string }) =>
      itineraryApi.addActivity(tripId, stopId, activityId, cost, notes),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.stopActivities(tripId, stopId) });
      qc.invalidateQueries({ queryKey: KEYS.budget(tripId) });
    },
  });
}

export function useRemoveActivity(tripId: string, stopId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => itineraryApi.removeActivity(tripId, stopId, entryId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.stopActivities(tripId, stopId) });
      qc.invalidateQueries({ queryKey: KEYS.budget(tripId) });
    },
  });
}

export function useReorderStops(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stopIds: string[]) => itineraryApi.reorderStops(tripId, stopIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips", tripId] }),
  });
}

export function useUpdateStop(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stopId, data }: {
      stopId: string;
      data: { accommodationCost?: number; transportCost?: number; mealCostPerDay?: number; accommodation?: string; notes?: string };
    }) => itineraryApi.updateStop(tripId, stopId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trips", tripId] });
      qc.invalidateQueries({ queryKey: KEYS.budget(tripId) });
    },
  });
}
