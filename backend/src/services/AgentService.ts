import { eq, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { agents } from "../db/schema.js";
import { getAgentPayClient } from "../lib/agentpay.js";

type RegisterParams = {
	agentId: string;
	name: string;
	services: string[];
};

type AgentFilters = {
	active?: boolean;
	service?: string;
};

export class AgentService {
	async register(params: RegisterParams) {
		const client = getAgentPayClient();
		const txHash = await client.registry.registerAgent(
			params.agentId,
			params.name,
			params.services,
		);

		const profile = await client.registry.getAgent(params.agentId);

		const [agent] = await db
			.insert(agents)
			.values({
				agentId: params.agentId,
				wallet: profile.wallet,
				name: params.name,
				services: params.services,
				active: true,
			})
			.returning();

		return { ...agent, txHash };
	}

	async getAll(filters: AgentFilters) {
		const conditions = [];
		if (filters.active !== undefined) {
			conditions.push(eq(agents.active, filters.active));
		}

		const rows = conditions.length
			? await db.select().from(agents).where(and(...conditions))
			: await db.select().from(agents);

		if (filters.service) {
			return rows.filter((r) =>
				(r.services as string[])?.includes(filters.service!),
			);
		}

		return rows;
	}

	async getById(agentId: string) {
		const [row] = await db
			.select()
			.from(agents)
			.where(eq(agents.agentId, agentId));

		if (row) return row;

		const client = getAgentPayClient();
		const profile = await client.registry.getAgent(agentId);
		return profile;
	}

	async updateServices(agentId: string, services: string[]) {
		const client = getAgentPayClient();
		const txHash = await client.registry.updateServices(services);

		await db
			.update(agents)
			.set({ services })
			.where(eq(agents.agentId, agentId));

		const [updated] = await db
			.select()
			.from(agents)
			.where(eq(agents.agentId, agentId));

		return { ...updated, txHash };
	}
}

export const agentService = new AgentService();
