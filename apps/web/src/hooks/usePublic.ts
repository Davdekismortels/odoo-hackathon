import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { publicApi } from "../lib/public.api";

export function usePublishTrip(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => publicApi.publish(tripId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trip", tripId] }),
  });
}

export function useUnpublishTrip(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => publicApi.unpublish(tripId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trip", tripId] }),
  });
}

export function usePublicTrip(slug: string) {
  return useQuery({
    queryKey: ["public-trip", slug],
    queryFn: () => publicApi.getPublic(slug),
    enabled: !!slug,
    retry: false,
  });
}

export function useCloneTrip(slug: string) {
  return useMutation({
    mutationFn: () => publicApi.clone(slug),
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => publicApi.adminStats(),
    retry: false,
  });
}

export function useTrending(limit = 8) {
  return useQuery({
    queryKey: ["trending", limit],
    queryFn: () => publicApi.trending(limit),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useAdminUsers(search?: string) {
  return useQuery({
    queryKey: ["admin-users", search],
    queryFn: () => publicApi.adminUsers(search),
    retry: false,
    enabled: true,
  });
}
