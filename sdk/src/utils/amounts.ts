export function formatTokenAmount(amount: bigint, decimals: number): string {
	const divisor = 10n ** BigInt(decimals);
	const whole = amount / divisor;
	const fraction = amount % divisor;
	const fractionStr = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
	return fractionStr ? `${whole}.${fractionStr}` : whole.toString();
}

export function parseTokenAmount(amount: string, decimals: number): bigint {
	const [whole, fraction = ""] = amount.split(".");
	const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
	return BigInt(whole + paddedFraction);
}

export function bpsToPercent(bps: number): number {
	return bps / 100;
}

export function percentToBps(percent: number): number {
	return Math.round(percent * 100);
}
