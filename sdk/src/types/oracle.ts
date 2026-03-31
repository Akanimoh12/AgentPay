export type PricingRequest = {
	serviceType: string;
	params: Record<string, unknown>;
};

export type PriceRange = {
	floor: bigint;
	suggested: bigint;
	ceiling: bigint;
};

export type PricingResponse = {
	serviceType: string;
	priceRange: PriceRange;
	timestamp: number;
};
