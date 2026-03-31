import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { payments, escrows } from "../db/schema.js";
import { getAgentPayClient } from "../lib/agentpay.js";

type DirectPayParams = {
	fromAgentId: string;
	toAgentId: string;
	token: string;
	amount: string;
};

type CreateEscrowParams = {
	payerAgentId: string;
	payeeAgentId: string;
	token: string;
	amount: string;
	jobId: string;
	deadline: string;
};

type PaymentFilters = {
	agentId?: string;
	type?: string;
	status?: string;
	limit?: number;
	offset?: number;
};

export class PaymentService {
	async payDirect(params: DirectPayParams) {
		const client = getAgentPayClient();
		const txHash = await client.payments.payDirect(
			params.toAgentId,
			params.token,
			BigInt(params.amount),
		);

		const [payment] = await db
			.insert(payments)
			.values({
				type: "direct",
				fromAgentId: params.fromAgentId,
				toAgentId: params.toAgentId,
				token: params.token,
				amount: params.amount,
				txHash,
				status: "completed",
			})
			.returning();

		return payment;
	}

	async createEscrow(params: CreateEscrowParams) {
		const client = getAgentPayClient();
		const deadline = BigInt(Math.floor(new Date(params.deadline).getTime() / 1000));
		const result = await client.payments.createEscrow(
			params.payeeAgentId,
			params.token,
			BigInt(params.amount),
			params.jobId,
			deadline,
		);

		const [escrow] = await db
			.insert(escrows)
			.values({
				escrowId: result.escrowId,
				payerAgentId: params.payerAgentId,
				payeeAgentId: params.payeeAgentId,
				token: params.token,
				amount: params.amount,
				jobId: params.jobId,
				deadline: new Date(params.deadline),
				status: "active",
				txHash: result.txHash,
			})
			.returning();

		return escrow;
	}

	async getEscrow(escrowId: string) {
		const [row] = await db
			.select()
			.from(escrows)
			.where(eq(escrows.escrowId, escrowId));
		return row || null;
	}

	async releaseEscrow(escrowId: string) {
		const client = getAgentPayClient();
		const txHash = await client.payments.releaseEscrow(escrowId);

		await db
			.update(escrows)
			.set({ status: "released", settledAt: new Date() })
			.where(eq(escrows.escrowId, escrowId));

		const [updated] = await db
			.select()
			.from(escrows)
			.where(eq(escrows.escrowId, escrowId));

		return { ...updated, txHash };
	}

	async cancelEscrow(escrowId: string) {
		const client = getAgentPayClient();
		const txHash = await client.payments.cancelEscrow(escrowId);

		await db
			.update(escrows)
			.set({ status: "cancelled", settledAt: new Date() })
			.where(eq(escrows.escrowId, escrowId));

		const [updated] = await db
			.select()
			.from(escrows)
			.where(eq(escrows.escrowId, escrowId));

		return { ...updated, txHash };
	}

	async getPayments(filters: PaymentFilters) {
		const conditions = [];
		if (filters.agentId) {
			conditions.push(eq(payments.fromAgentId, filters.agentId));
		}
		if (filters.type) {
			conditions.push(eq(payments.type, filters.type));
		}
		if (filters.status) {
			conditions.push(eq(payments.status, filters.status));
		}

		const limit = filters.limit || 50;
		const offset = filters.offset || 0;

		const query = db
			.select()
			.from(payments)
			.orderBy(desc(payments.createdAt))
			.limit(limit)
			.offset(offset);

		if (conditions.length) {
			return query.where(and(...conditions));
		}

		return query;
	}

	async getById(id: number) {
		const [row] = await db
			.select()
			.from(payments)
			.where(eq(payments.id, id));
		return row || null;
	}
}

export const paymentService = new PaymentService();
