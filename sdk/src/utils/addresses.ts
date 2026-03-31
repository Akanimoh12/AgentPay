import { zeroAddress } from "viem";

export function isNativeToken(address: string): boolean {
	return address === zeroAddress || address === "0x0000000000000000000000000000000000000000";
}

export function shortenAddress(address: string): string {
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
