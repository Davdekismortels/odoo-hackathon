import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { packingApi, notesApi } from "../lib/packing-notes.api";

// ==================== PACKING HOOKS ====================

const PACKING_KEY = (tripId: string) => ["packing", tripId];
const NOTES_KEY = (tripId: string) => ["notes", tripId];

export function usePacking(tripId: string) {
  return useQuery({
    queryKey: PACKING_KEY(tripId),
    queryFn: () => packingApi.list(tripId),
    enabled: !!tripId,
  });
}

export function useAddPackingItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ name, category, quantity }: { name: string; category?: string; quantity?: number }) =>
      packingApi.add(tripId, name, category, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: PACKING_KEY(tripId) }),
  });
}

export function useTogglePackingItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, isPacked }: { itemId: string; isPacked: boolean }) =>
      packingApi.toggle(tripId, itemId, isPacked),
    onSuccess: () => qc.invalidateQueries({ queryKey: PACKING_KEY(tripId) }),
  });
}

export function useRemovePackingItem(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => packingApi.remove(tripId, itemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: PACKING_KEY(tripId) }),
  });
}

// ==================== NOTES HOOKS ====================

export function useNotes(tripId: string) {
  return useQuery({
    queryKey: NOTES_KEY(tripId),
    queryFn: () => notesApi.list(tripId),
    enabled: !!tripId,
  });
}

export function useAddNote(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title?: string; body: string }) => notesApi.add(tripId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTES_KEY(tripId) }),
  });
}

export function useEditNote(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ noteId, data }: { noteId: string; data: { title?: string; body?: string } }) =>
      notesApi.edit(tripId, noteId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTES_KEY(tripId) }),
  });
}

export function useRemoveNote(tripId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) => notesApi.remove(tripId, noteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTES_KEY(tripId) }),
  });
}
