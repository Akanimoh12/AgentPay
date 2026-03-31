import { eq, desc } from "drizzle-orm";
import { db } from "../db/index.js";
import { splits, distributions } from "../db/schema.js";
import { getAgentPayClient } from "../lib/agentpay.js";
import { randomUUID } from "node:crypto";

type ConfigureSplitParams = {
	agentId: string;
	recipients: { wallet: string; shareBps: number }[];
};

type DistributeParams = {
	token: string;
	amount: string;
};

export class SplitService {
	async configure(params: ConfigureSplitParams) {
		const client = getAgentPayClient();
		const splitId = await client.splits.configureSplit(
			params.agentId,
			params.recipients,
		);

		const [row] = await db
			.insert(splits)
			.values({
				splitId: splitId || randomUUID(),
				ownerAgentId: params.agentId,
				recipients: params.recipients,
				totalRecipients: params.recipients.length,
				status: "active",
			})
			.returning();

		return row;
	}

	async distribute(splitId: string, params: DistributeParams) {
		const client = getAgentPayClient();
		const txHash = await client.splits.distribute(
			splitId,
			params.token,
			BigInt(params.amount),
		);

		const [dist] = await db
			.insert(distributions)
			.values({
				splitId,
				token: params.token,
				amount: params.amount,
				txHash,
			})
			.returning();

		return { ...dist, txHash };
	}

	async getAll() {
		return db
			.select()
			.from(splits)
			.orderBy(desc(splits.createdAt));
	}

	async getById(splitId: string) {
		const [row] = await db
			.select()
			.from(splits)
			.where(eq(splits.splitId, splitId));
		return row || null;
	}
}

export const splitService = new SplitService();
