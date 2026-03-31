import {
	type PublicClient,
	type WalletClient,
	type Address,
	getContract,
} from "viem";
import AgentRegistryAbi from "../abis/AgentRegistry.json";
import type { AgentProfile } from "../types/agent.js";

export class RegistryModule {
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

	async registerAgent(
		agentId: string,
		name: string,
		services: string[],
	): Promise<string> {
		if (!this.walletClient) throw new Error("Wallet client required for writes");
		const hash = await this.walletClient.writeContract({
			address: this.address,
			abi: AgentRegistryAbi,
			functionName: "registerAgent",
			args: [agentId as `0x${string}`, name, services],
		});
		return hash;
	}

	async getAgent(agentId: string): Promise<AgentProfile> {
		const result = await this.publicClient.readContract({
			address: this.address,
			abi: AgentRegistryAbi,
			functionName: "getAgent",
			args: [agentId as `0x${string}`],
		}) as any;
		return {
			wallet: result.wallet,
			agentId: result.agentId,
			name: result.name,
			services: result.services,
			active: result.active,
			registeredAt: result.registeredAt,
		};
	}

	async getAgentByWallet(address: string): Promise<string> {
		const agentId = await this.publicClient.readContract({
			address: this.address,
			abi: AgentRegistryAbi,
			functionName: "getAgentByWallet",
			args: [address as Address],
		});
		return agentId as string;
	}

	async isRegistered(agentId: string): Promise<boolean> {
		return (await this.publicClient.readContract({
			address: this.address,
			abi: AgentRegistryAbi,
			functionName: "isRegistered",
			args: [agentId as `0x${string}`],
		})) as boolean;
	}

	async getAllAgents(): Promise<AgentProfile[]> {
		const ids = (await this.publicClient.readContract({
			address: this.address,
			abi: AgentRegistryAbi,
			functionName: "getAllAgentIds",
		})) as string[];

		const profiles = await Promise.all(ids.map((id) => this.getAgent(id)));
		return profiles;
	}

	async updateServices(services: string[]): Promise<string> {
		if (!this.walletClient) throw new Error("Wallet client required for writes");
		const hash = await this.walletClient.writeContract({
			address: this.address,
			abi: AgentRegistryAbi,
			functionName: "updateServices",
			args: [services],
		});
		return hash;
	}
}
