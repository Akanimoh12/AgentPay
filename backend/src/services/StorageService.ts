import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { invoices } from "../db/schema.js";
import { storeInvoice, fetchInvoice, fetchAgentHistory } from "../lib/zgStorage.js";
import type { Invoice } from "@agentpay/sdk";
import { randomUUID } from "node:crypto";

type CreateInvoiceParams = {
	fromAgentId: string;
	toAgentId: string;
	amount: string;
	description: string;
	lineItems?: { description: string; quantity: number; unitPrice: string; total: string }[];
};

type InvoiceFilters = {
	agentId?: string;
	status?: string;
	limit?: number;
	offset?: number;
};

export class StorageService {
	async storeInvoice(params: CreateInvoiceParams) {
		const invoiceId = randomUUID();

		const invoice: Invoice = {
			invoiceId,
			fromAgentId: params.fromAgentId,
			toAgentId: params.toAgentId,
			amount: BigInt(params.amount),
			description: params.description,
			lineItems: (params.lineItems || []).map((li) => ({
				description: li.description,
				quantity: li.quantity,
				unitPrice: BigInt(li.unitPrice),
				total: BigInt(li.total),
			})),
			status: "draft",
			createdAt: Date.now(),
		};

		const storageKey = await storeInvoice(invoice);

		const [row] = await db
			.insert(invoices)
			.values({
				invoiceId,
				fromAgentId: params.fromAgentId,
				toAgentId: params.toAgentId,
				amount: params.amount,
				description: params.description,
				storageKey,
				status: "draft",
			})
			.returning();

		return row;
	}

	async getInvoice(invoiceId: string) {
		const [row] = await db
			.select()
			.from(invoices)
			.where(eq(invoices.invoiceId, invoiceId));

		if (!row) return null;

		if (row.storageKey) {
			const stored = await fetchInvoice(row.storageKey);
			return { ...row, storageData: stored };
		}

		return row;
	}

	async getHistory(filters: InvoiceFilters) {
		const limit = filters.limit || 50;
		const offset = filters.offset || 0;
		const conditions = [];

		if (filters.agentId) {
			conditions.push(eq(invoices.fromAgentId, filters.agentId));
		}
		if (filters.status) {
			conditions.push(eq(invoices.status, filters.status));
		}

		const query = db
			.select()
			.from(invoices)
			.orderBy(desc(invoices.createdAt))
			.limit(limit)
			.offset(offset);

		if (conditions.length) {
			return query.where(and(...conditions));
		}

		return query;
	}

	async syncEvents() {
		return { synced: 0, message: "Event sync not yet implemented" };
	}
}

export const storageService = new StorageService();
