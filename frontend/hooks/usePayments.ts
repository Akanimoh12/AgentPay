"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function usePayments(filters?: Record<string, string>) {
	return useQuery({
		queryKey: ["payments", filters],
		queryFn: () => api.payments.list(filters),
	});
}

export function usePayment(id: string) {
	return useQuery({
		queryKey: ["payment", id],
		queryFn: () => api.payments.get(id),
		enabled: !!id,
	});
}

export function usePayDirect() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (params: {
			fromAgentId: string;
			toAgentId: string;
			token: string;
			amount: string;
		}) => api.payments.direct(params),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["payments"] });
		},
	});
}

export function useCreateEscrow() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (params: {
			payerAgentId: string;
			payeeAgentId: string;
			token: string;
			amount: string;
			jobId: string;
			deadline: string;
		}) => api.payments.createEscrow(params),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["payments"] });
			queryClient.invalidateQueries({ queryKey: ["escrows"] });
		},
	});
}
