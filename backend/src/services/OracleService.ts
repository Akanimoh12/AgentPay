import { desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { oraclePrices } from "../db/schema.js";
import { fetchOraclePrice } from "../lib/zgCompute.js";

export class OracleService {
	async getPrice(serviceType: string, params: Record<string, unknown>) {
		const result = await fetchOraclePrice(serviceType, params);

		const [row] = await db
			.insert(oraclePrices)
			.values({
				serviceType,
				floor: result.floor.toString(),
				suggested: result.suggested.toString(),
				ceiling: result.ceiling.toString(),
			})
			.returning();

		return {
			...row,
			floor: result.floor.toString(),
			suggested: result.suggested.toString(),
			ceiling: result.ceiling.toString(),
		};
	}

	async getPriceHistory(serviceType?: string, limit = 20) {
		const query = db
			.select()
			.from(oraclePrices)
			.orderBy(desc(oraclePrices.queriedAt))
			.limit(limit);

		if (serviceType) {
			return query.where(eq(oraclePrices.serviceType, serviceType));
		}

		return query;
	}
}

export const oracleService = new OracleService();
