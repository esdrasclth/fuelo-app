import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Household, HouseholdInvite } from "@/lib/types";

const HOUSEHOLDS = ["households"];
const INVITES = ["invites"];

export function useHouseholds() {
  return useQuery<Household[]>({
    queryKey: HOUSEHOLDS,
    queryFn: () => api.get("/api/households"),
  });
}

export function useInvites() {
  return useQuery<HouseholdInvite[]>({
    queryKey: INVITES,
    queryFn: () => api.get("/api/invites"),
  });
}

export function useHouseholdMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: HOUSEHOLDS });
    qc.invalidateQueries({ queryKey: INVITES });
    qc.invalidateQueries({ queryKey: ["vehicles"] });
    qc.invalidateQueries({ queryKey: ["fuel-logs"] });
  };

  const create = useMutation({
    mutationFn: (name: string) => api.post("/api/households", { name }),
    onSuccess: invalidate,
  });
  const remove = useMutation({
    mutationFn: (id: string) => api.del(`/api/households/${id}`),
    onSuccess: invalidate,
  });
  const invite = useMutation({
    mutationFn: ({ id, email }: { id: string; email: string }) =>
      api.post(`/api/households/${id}/invites`, { email }),
    onSuccess: invalidate,
  });
  const accept = useMutation({
    mutationFn: (inviteId: string) => api.post(`/api/invites/${inviteId}`, {}),
    onSuccess: invalidate,
  });
  const decline = useMutation({
    mutationFn: (inviteId: string) => api.del(`/api/invites/${inviteId}`),
    onSuccess: invalidate,
  });

  return { create, remove, invite, accept, decline };
}
