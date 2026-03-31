import {
	type PublicClient,
	type WalletClient,
	type Address,
	parseEventLogs,
	zeroAddress,
} from "viem";
import PaymentRouterAbi from "../abis/PaymentRouter.json";
import type { EscrowRecord } from "../types/payment.js";
import { isNativeToken } from "../utils/addresses.js";

export class PaymentsModule {
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

	async payDirect(
		recipientAgentId: string,
		token: string,
		amount: bigint,
	): Promise<string> {
		if (!this.walletClient) throw new Error("Wallet client required for writes");

		const value = isNativeToken(token) ? amount : 0n;
		const hash = await this.walletClient.writeContract({
			address: this.address,
			abi: PaymentRouterAbi,
			functionName: "payDirect",
			args: [recipientAgentId as `0x${string}`, token as Address, amount],
			value,
		});
		return hash;
	}

	async createEscrow(
		payeeAgentId: string,
		token: string,
		amount: bigint,
		jobId: string,
		deadline: bigint,
	): Promise<{ txHash: string; escrowId: string }> {
		if (!this.walletClient) throw new Error("Wallet client required for writes");

		const value = isNativeToken(token) ? amount : 0n;
		const hash = await this.walletClient.writeContract({
			address: this.address,
			abi: PaymentRouterAbi,
			functionName: "createEscrow",
			args: [
				payeeAgentId as `0x${string}`,
				token as Address,
				amount,
				jobId as `0x${string}`,
				deadline,
			],
			value,
		});

		const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
		const logs = parseEventLogs({
			abi: PaymentRouterAbi as any,
			logs: receipt.logs,
			eventName: "EscrowCreated",
		});

		const escrowId = (logs[0]?.args as any)?.escrowId || "";
		return { txHash: hash, escrowId };
	}

	async releaseEscrow(escrowId: string): Promise<string> {
		if (!this.walletClient) throw new Error("Wallet client required for writes");
		const hash = await this.walletClient.writeContract({
			address: this.address,
			abi: PaymentRouterAbi,
			functionName: "releaseEscrow",
			args: [escrowId as `0x${string}`],
		});
		return hash;
	}

	async cancelEscrow(escrowId: string): Promise<string> {
		if (!this.walletClient) throw new Error("Wallet client required for writes");
		const hash = await this.walletClient.writeContract({
			address: this.address,
			abi: PaymentRouterAbi,
			functionName: "cancelEscrow",
			args: [escrowId as `0x${string}`],
		});
		return hash;
	}

	async getEscrow(escrowId: string): Promise<EscrowRecord> {
		const result = (await this.publicClient.readContract({
			address: this.address,
			abi: PaymentRouterAbi,
			functionName: "getEscrow",
			args: [escrowId as `0x${string}`],
		})) as any;

		return {
			escrowId,
			payerId: result.payerId,
			payeeId: result.payeeId,
			amount: result.amount,
			token: result.token,
			jobId: result.jobId,
			deadline: result.deadline,
			released: result.released,
			cancelled: result.cancelled,
			createdAt: result.createdAt,
		};
	}
}
