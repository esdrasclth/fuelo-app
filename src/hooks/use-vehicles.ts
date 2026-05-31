import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Vehicle } from "@/lib/types";

const KEY = ["vehicles"];

export function useVehicles() {
  return useQuery<Vehicle[]>({ queryKey: KEY, queryFn: () => api.get("/api/vehicles") });
}

export function useVehicleMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const create = useMutation({
    mutationFn: (body: unknown) => api.post("/api/vehicles", body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) =>
      api.patch(`/api/vehicles/${id}`, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.del(`/api/vehicles/${id}`),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
