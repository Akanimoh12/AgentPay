import { getAgentPayClient } from "./agentpay.js";
import { getCache, setCache } from "./redis.js";
import type { PriceRange } from "@agentpay/sdk";

export async function fetchOraclePrice(
	serviceType: string,
	params: Record<string, unknown>,
): Promise<PriceRange> {
	const cacheKey = `oracle:${serviceType}:${JSON.stringify(params)}`;
	const cached = await getCache(cacheKey);
	if (cached) {
		const parsed = JSON.parse(cached);
		return {
			floor: BigInt(parsed.floor),
			suggested: BigInt(parsed.suggested),
			ceiling: BigInt(parsed.ceiling),
		};
	}

	const client = getAgentPayClient();
	const result = await client.oracle.getPrice(serviceType, params);

	await setCache(
		cacheKey,
		JSON.stringify({
			floor: result.floor.toString(),
			suggested: result.suggested.toString(),
			ceiling: result.ceiling.toString(),
		}),
		60,
	);

	return result;
}
