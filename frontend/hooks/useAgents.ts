"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useAgents(filters?: { search?: string; active?: string; service?: string }) {
	return useQuery({
		queryKey: ["agents", filters],
		queryFn: () => api.agents.list(),
		select: (data: any[]) => {
			let result = data;
			if (filters?.search) {
				const s = filters.search.toLowerCase();
				result = result.filter(
					(a) =>
						a.name?.toLowerCase().includes(s) ||
						a.agentId?.toLowerCase().includes(s),
				);
			}
			if (filters?.active && filters.active !== "all") {
				const isActive = filters.active === "true";
				result = result.filter((a) => a.active === isActive);
			}
			if (filters?.service) {
				result = result.filter((a) =>
					(a.services || []).some((s: string) =>
						s.toLowerCase().includes(filters.service!.toLowerCase()),
					),
				);
			}
			return result;
		},
	});
}

export function useAgent(agentId: string) {
	return useQuery({
		queryKey: ["agent", agentId],
		queryFn: () => api.agents.get(agentId),
		enabled: !!agentId,
	});
}

export function useRegisterAgent() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (params: { agentId: string; name: string; services: string[] }) =>
			api.agents.register(params),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["agents"] });
		},
	});
}
