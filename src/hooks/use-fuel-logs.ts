import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { enqueueFuelLog } from "@/lib/offline/sync";
import type { FuelLog } from "@/lib/types";

export type CreateResult = { offline: boolean };

const KEY = ["fuel-logs"];

export function useFuelLogs(vehicleId?: string) {
  const url = vehicleId
    ? `/api/fuel-logs?vehicleId=${vehicleId}`
    : "/api/fuel-logs";
  return useQuery<FuelLog[]>({
    queryKey: [...KEY, vehicleId ?? "all"],
    queryFn: () => api.get(url),
  });
}

export function useFuelLogMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const create = useMutation<CreateResult, Error, Record<string, unknown>>({
    mutationFn: async (body) => {
      const offline =
        typeof navigator !== "undefined" && navigator.onLine === false;

      if (offline) {
        await enqueueFuelLog({ ...body, clientId: crypto.randomUUID() });
        return { offline: true };
      }
      try {
        await api.post("/api/fuel-logs", body);
        return { offline: false };
      } catch (err) {
        // Network failure (request never reached server): queue it for later.
        if (err instanceof TypeError) {
          await enqueueFuelLog({ ...body, clientId: crypto.randomUUID() });
          return { offline: true };
        }
        throw err;
      }
    },
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) =>
      api.patch(`/api/fuel-logs/${id}`, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.del(`/api/fuel-logs/${id}`),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
