"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useInvoices(filters?: Record<string, string>) {
	return useQuery({
		queryKey: ["invoices", filters],
		queryFn: () => api.invoices.list(filters),
	});
}

export function useInvoice(invoiceId: string) {
	return useQuery({
		queryKey: ["invoice", invoiceId],
		queryFn: () => api.invoices.get(invoiceId),
		enabled: !!invoiceId,
	});
}

export function useCreateInvoice() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (params: {
			fromAgentId: string;
			toAgentId: string;
			amount: string;
			description: string;
		}) => api.invoices.create(params),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["invoices"] });
		},
	});
}
