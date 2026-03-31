import {
	type PublicClient,
	type WalletClient,
	type Address,
	parseEventLogs,
} from "viem";
import SplitVaultAbi from "../abis/SplitVault.json";
import type { SplitConfig, SplitRecipient } from "../types/split.js";
import { isNativeToken } from "../utils/addresses.js";

export class SplitsModule {
	private publicClient: PublicClient;
	private walletClient: WalletClient | null;
	private address: Address;

	constructor(
		contractAddress: string,
		publicClient: PublicClient,
		walletClient: WalletClient | null,
	) {
		this.address = contractAddress as Address;
		this.publicClient = publicClient;
		this.walletClient = walletClient;
	}

	async configureSplit(
		agentId: string,
		recipients: SplitRecipient[],
	): Promise<string> {
		if (!this.walletClient) throw new Error("Wallet client required for writes");

		const args = recipients.map((r) => ({
			wallet: r.wallet as Address,
			shareBps: BigInt(r.shareBps),
		}));

		const hash = await this.walletClient.writeContract({
			address: this.address,
			abi: SplitVaultAbi,
			functionName: "configureSplit",
			args: [agentId as `0x${string}`, args],
		});

		const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
		const logs = parseEventLogs({
			abi: SplitVaultAbi as any,
			logs: receipt.logs,
			eventName: "SplitConfigured",
		});

		return (logs[0]?.args as any)?.splitId || hash;
	}

	async distribute(
		splitId: string,
		token: string,
		amount: bigint,
	): Promise<string> {
		if (!this.walletClient) throw new Error("Wallet client required for writes");

		const value = isNativeToken(token) ? amount : 0n;
		const hash = await this.walletClient.writeContract({
			address: this.address,
			abi: SplitVaultAbi,
			functionName: "distribute",
			args: [splitId as `0x${string}`, token as Address, amount],
			value,
		});
		return hash;
	}

	async getSplitConfig(splitId: string): Promise<SplitConfig> {
		const result = (await this.publicClient.readContract({
			address: this.address,
			abi: SplitVaultAbi,
			functionName: "getSplitConfig",
			args: [splitId as `0x${string}`],
		})) as any;

		return {
			ownerAgentId: result[0],
			recipients: result[1].map((r: any) => ({
				wallet: r.wallet,
				shareBps: Number(r.shareBps),
			})),
			active: result[2],
		};
	}

	async getSplitByAgent(agentId: string): Promise<string> {
		return (await this.publicClient.readContract({
			address: this.address,
			abi: SplitVaultAbi,
			functionName: "getSplitByAgent",
			args: [agentId as `0x${string}`],
		})) as string;
	}
}
