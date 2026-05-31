import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Reminder } from "@/lib/types";

const KEY = ["reminders"];

export function useReminders() {
  return useQuery<Reminder[]>({
    queryKey: KEY,
    queryFn: () => api.get("/api/reminders"),
  });
}

export function useReminderMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: KEY });

  const create = useMutation({
    mutationFn: (body: unknown) => api.post("/api/reminders", body),
    onSuccess: invalidate,
  });
  const update = useMutation({
    mutationFn: ({ id, body }: { id: string; body: unknown }) =>
      api.patch(`/api/reminders/${id}`, body),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.del(`/api/reminders/${id}`),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
