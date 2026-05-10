import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tripsApi, stopsApi, type CreateTripPayload, type CreateStopPayload } from "../lib/trips.api";
import toast from "react-hot-toast";

const KEYS = {
  trips: ["trips"] as const,
  trip: (id: string) => ["trips", id] as const,
  stops: (tripId: string) => ["trips", tripId, "stops"] as const,
};

// ── Trip hooks ──────────────────────────────────────────────────────────────

export function useTrips() {
  return useQuery({ queryKey: KEYS.trips, queryFn: tripsApi.list });
}

export function useTrip(id: string) {
  return useQuery({ queryKey: KEYS.trip(id), queryFn: () => tripsApi.get(id), enabled: !!id });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTripPayload) => tripsApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.trips });
      toast.success("Trip created! 🎉");
    },
    onError: () => toast.error("Failed to create trip"),
  });
}

export function useUpdateTrip(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CreateTripPayload>) => tripsApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.trips });
      qc.invalidateQueries({ queryKey: KEYS.trip(id) });
      toast.success("Trip updated");
    },
    onError: () => toast.error("Failed to update trip"),
  });
}

export function useDeleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tripsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.trips });
      toast.success("Trip deleted");
    },
    onError: () => toast.error("Failed to delete trip"),
  });
}

// ── Stop hooks ──────────────────────────────────────────────────────────────

export function useAddStop(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStopPayload) => stopsApi.add(tripId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.trip(tripId) });
      toast.success("Stop added 📍");
    },
    onError: () => toast.error("Failed to add stop"),
  });
}

export function useRemoveStop(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (stopId: string) => stopsApi.remove(tripId, stopId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.trip(tripId) });
      toast.success("Stop removed");
    },
    onError: () => toast.error("Failed to remove stop"),
  });
}
