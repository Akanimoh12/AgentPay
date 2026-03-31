"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useOraclePrice() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (params: { serviceType: string; params?: Record<string, unknown> }) =>
			api.oracle.getPrice(params.serviceType, params.params),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["oracle-history"] });
		},
	});
}

export function useOraclePriceHistory(serviceType?: string) {
	return useQuery({
		queryKey: ["oracle-history", serviceType],
		queryFn: () => api.oracle.history(serviceType),
	});
}
