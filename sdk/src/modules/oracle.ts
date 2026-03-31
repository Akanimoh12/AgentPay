import type { PriceRange, PricingResponse } from "../types/oracle.js";
import { OracleUnavailableError } from "../utils/errors.js";

export class OracleModule {
	private endpoint: string | undefined;

	constructor(endpoint?: string) {
		this.endpoint = endpoint;
		if (!endpoint) {
			console.warn("0G Compute endpoint not configured — using mock prices");
		}
	}

	async getPrice(
		serviceType: string,
		params: Record<string, unknown>,
	): Promise<PriceRange> {
		if (this.endpoint) {
			try {
				const res = await fetch(`${this.endpoint}/price`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ serviceType, params }),
				});
				if (!res.ok) throw new Error();
				const data = await res.json();
				return {
					floor: BigInt(data.floor),
					suggested: BigInt(data.suggested),
					ceiling: BigInt(data.ceiling),
				};
			} catch {
				throw new OracleUnavailableError();
			}
		}

		return {
			floor: 1000000000000000n,
			suggested: 5000000000000000n,
			ceiling: 10000000000000000n,
		};
	}

	async getPriceHistory(
		serviceType: string,
		limit = 10,
	): Promise<PricingResponse[]> {
		if (this.endpoint) {
			try {
				const res = await fetch(
					`${this.endpoint}/price/history?serviceType=${encodeURIComponent(serviceType)}&limit=${limit}`,
				);
				if (!res.ok) throw new Error();
				return (await res.json()) as PricingResponse[];
			} catch {
				throw new OracleUnavailableError();
			}
		}

		return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
			serviceType,
			priceRange: {
				floor: 1000000000000000n,
				suggested: 5000000000000000n,
				ceiling: 10000000000000000n,
			},
			timestamp: Date.now() - i * 3600000,
		}));
	}
}
