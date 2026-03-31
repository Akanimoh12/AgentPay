"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useStats() {
	const agents = useQuery({
		queryKey: ["agents"],
		queryFn: () => api.agents.list(),
	});

	const payments = useQuery({
		queryKey: ["payments"],
		queryFn: () => api.payments.list(),
	});

	const escrows = useQuery({
		queryKey: ["payments", "escrows"],
		queryFn: () => api.payments.list({ type: "escrow" }),
	});

	const isLoading = agents.isLoading || payments.isLoading || escrows.isLoading;

	const allPayments = payments.data || [];
	const allEscrows = escrows.data || [];

	const totalPayments = allPayments.length;
	const activeEscrows = allEscrows.filter((e: any) => e.status === "active").length;
	const registeredAgents = (agents.data || []).length;
	const totalVolume = allPayments.reduce(
		(sum: number, p: any) => sum + parseFloat(p.amount || "0"),
		0,
	);

	return {
		totalPayments,
		activeEscrows,
		registeredAgents,
		totalVolume: totalVolume.toFixed(4),
		isLoading,
	};
}
