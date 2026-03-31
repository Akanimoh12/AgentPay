import type { Invoice, InvoiceFilter, PaginatedInvoices } from "../types/invoice.js";
import { StorageUnavailableError } from "../utils/errors.js";

export class StorageModule {
	private endpoint: string | undefined;
	private memoryStore: Map<string, string>;

	constructor(endpoint?: string) {
		this.endpoint = endpoint;
		this.memoryStore = new Map();
		if (!endpoint) {
			console.warn("0G Storage endpoint not configured — using in-memory fallback");
		}
	}

	async writeInvoice(invoice: Invoice): Promise<string> {
		const data = JSON.stringify(invoice);
		const key = `invoice-${invoice.invoiceId}-${Date.now()}`;

		if (this.endpoint) {
			try {
				const res = await fetch(`${this.endpoint}/store`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ key, data }),
				});
				if (!res.ok) throw new Error(`Storage write failed: ${res.status}`);
				return key;
			} catch {
				throw new StorageUnavailableError();
			}
		}

		this.memoryStore.set(key, data);
		return key;
	}

	async getInvoice(storageKey: string): Promise<Invoice | null> {
		if (this.endpoint) {
			try {
				const res = await fetch(`${this.endpoint}/retrieve?key=${encodeURIComponent(storageKey)}`);
				if (!res.ok) return null;
				const { data } = await res.json();
				return JSON.parse(data) as Invoice;
			} catch {
				throw new StorageUnavailableError();
			}
		}

		const data = this.memoryStore.get(storageKey);
		return data ? (JSON.parse(data) as Invoice) : null;
	}

	async getPaymentHistory(
		agentId: string,
		filters?: InvoiceFilter,
	): Promise<PaginatedInvoices> {
		if (this.endpoint) {
			try {
				const params = new URLSearchParams({ agentId });
				if (filters?.status) params.set("status", filters.status);
				if (filters?.dateFrom) params.set("dateFrom", String(filters.dateFrom));
				if (filters?.dateTo) params.set("dateTo", String(filters.dateTo));

				const res = await fetch(`${this.endpoint}/history?${params}`);
				if (!res.ok) throw new Error();
				return (await res.json()) as PaginatedInvoices;
			} catch {
				throw new StorageUnavailableError();
			}
		}

		const allInvoices: Invoice[] = [];
		for (const [, value] of this.memoryStore) {
			const invoice = JSON.parse(value) as Invoice;
			if (
				invoice.fromAgentId === agentId ||
				invoice.toAgentId === agentId
			) {
				allInvoices.push(invoice);
			}
		}

		return {
			items: allInvoices,
			total: allInvoices.length,
			offset: 0,
			limit: allInvoices.length,
		};
	}

	async writeAuditLog(entry: Record<string, unknown>): Promise<string> {
		const key = `audit-${Date.now()}`;
		const data = JSON.stringify(entry);

		if (this.endpoint) {
			try {
				const res = await fetch(`${this.endpoint}/store`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ key, data }),
				});
				if (!res.ok) throw new Error();
				return key;
			} catch {
				throw new StorageUnavailableError();
			}
		}

		this.memoryStore.set(key, data);
		return key;
	}
}
