"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useEscrows(filters?: Record<string, string>) {
	return useQuery({
		queryKey: ["escrows", filters],
		queryFn: () =>
			api.payments.list({ ...filters, type: "escrow" }),
	});
}

export function useEscrow(escrowId: string) {
	return useQuery({
		queryKey: ["escrow", escrowId],
		queryFn: () => api.payments.getEscrow(escrowId),
		enabled: !!escrowId,
	});
}

export function useReleaseEscrow() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (escrowId: string) => api.payments.releaseEscrow(escrowId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["escrows"] });
			queryClient.invalidateQueries({ queryKey: ["payments"] });
		},
	});
}

export function useCancelEscrow() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (escrowId: string) => api.payments.cancelEscrow(escrowId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["escrows"] });
			queryClient.invalidateQueries({ queryKey: ["payments"] });
		},
	});
}
