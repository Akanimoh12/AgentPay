"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useRecentPayments() {
	const { data, isLoading } = useQuery({
		queryKey: ["payments", "recent"],
		queryFn: () => api.payments.list({ limit: "10", offset: "0" }),
	});

	return { payments: data || [], isLoading };
}
