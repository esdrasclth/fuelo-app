import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Trip } from "@/lib/types";

const KEY = ["trips"];

export function useTrips() {
  return useQuery<Trip[]>({ queryKey: KEY, queryFn: () => api.get("/api/trips") });
}

export function useTripMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const create = useMutation({
    mutationFn: (body: unknown) => api.post("/api/trips", body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.del(`/api/trips/${id}`),
    onSuccess: invalidate,
  });

  return { create, remove };
}
