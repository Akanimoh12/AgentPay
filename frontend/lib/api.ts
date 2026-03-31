const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
	const res = await fetch(`${BASE_URL}${path}`, {
		headers: { "Content-Type": "application/json" },
		...options,
	});
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body?.error?.message || `Request failed: ${res.status}`);
	}
	return res.json();
}

export const api = {
	agents: {
		list: () => request<any[]>("/agents"),
		get: (agentId: string) => request<any>(`/agents/${agentId}`),
		register: (params: { agentId: string; name: string; services: string[] }) =>
			request<any>("/agents", { method: "POST", body: JSON.stringify(params) }),
	},
	payments: {
		list: (filters?: Record<string, string>) => {
			const params = new URLSearchParams(filters);
			return request<any[]>(`/payments?${params}`);
		},
		get: (id: string) => request<any>(`/payments/${id}`),
		direct: (params: { fromAgentId: string; toAgentId: string; token: string; amount: string }) =>
			request<any>("/payments/direct", { method: "POST", body: JSON.stringify(params) }),
		createEscrow: (params: {
			payerAgentId: string;
			payeeAgentId: string;
			token: string;
			amount: string;
			jobId: string;
			deadline: string;
		}) => request<any>("/payments/escrow", { method: "POST", body: JSON.stringify(params) }),
		releaseEscrow: (escrowId: string) =>
			request<any>(`/payments/escrow/${escrowId}/release`, { method: "POST" }),
		cancelEscrow: (escrowId: string) =>
			request<any>(`/payments/escrow/${escrowId}/cancel`, { method: "POST" }),
		getEscrow: (escrowId: string) =>
			request<any>(`/payments/escrow/${escrowId}`),
	},
	invoices: {
		list: (filters?: Record<string, string>) => {
			const params = new URLSearchParams(filters);
			return request<any[]>(`/invoices?${params}`);
		},
		get: (invoiceId: string) => request<any>(`/invoices/${invoiceId}`),
		create: (params: { fromAgentId: string; toAgentId: string; amount: string; description: string }) =>
			request<any>("/invoices", { method: "POST", body: JSON.stringify(params) }),
	},
	splits: {
		list: () => request<any[]>("/splits"),
		get: (splitId: string) => request<any>(`/splits/${splitId}`),
		configure: (params: { agentId: string; recipients: { wallet: string; shareBps: number }[] }) =>
			request<any>("/splits", { method: "POST", body: JSON.stringify(params) }),
		distribute: (splitId: string, params: { token: string; amount: string }) =>
			request<any>(`/splits/${splitId}/distribute`, { method: "POST", body: JSON.stringify(params) }),
	},
	oracle: {
		getPrice: (serviceType: string, params?: Record<string, unknown>) =>
			request<any>("/oracle/price", {
				method: "POST",
				body: JSON.stringify({ serviceType, params }),
			}),
		history: (serviceType?: string) => {
			const params = serviceType ? `?serviceType=${encodeURIComponent(serviceType)}` : "";
			return request<any[]>(`/oracle/history${params}`);
		},
	},
};
