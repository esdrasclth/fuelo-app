import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Station } from "@/lib/types";

const KEY = ["stations"];

export function useStations() {
  return useQuery<Station[]>({ queryKey: KEY, queryFn: () => api.get("/api/stations") });
}

export function useStationMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const create = useMutation({
    mutationFn: (body: unknown) => api.post("/api/stations", body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) =>
      api.patch(`/api/stations/${id}`, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.del(`/api/stations/${id}`),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
