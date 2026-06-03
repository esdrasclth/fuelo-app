import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { DEFAULT_CURRENCY } from "@/lib/currencies";
import type { Settings } from "@/lib/types";

const KEY = ["settings"];

export function useSettings() {
  return useQuery<Settings>({
    queryKey: KEY,
    queryFn: () => api.get("/api/settings"),
  });
}

/** La moneda activa del usuario; usa el lempira mientras carga. */
export function useCurrency() {
  const { data } = useSettings();
  return data?.currency ?? DEFAULT_CURRENCY;
}

export function useSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Settings>) => api.patch("/api/settings", body),
    onSuccess: (data) => {
      qc.setQueryData(KEY, data);
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}
