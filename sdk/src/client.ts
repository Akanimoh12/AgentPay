import {
	createPublicClient,
	createWalletClient,
	http,
	type PublicClient,
	type WalletClient,
	type Chain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ClientConfigSchema, type ClientConfig } from "./types/schemas.js";
import { RegistryModule } from "./modules/registry.js";
import { PaymentsModule } from "./modules/payments.js";
import { SplitsModule } from "./modules/splits.js";
import { StorageModule } from "./modules/storage.js";
import { OracleModule } from "./modules/oracle.js";

export class AgentPayClient {
	readonly registry: RegistryModule;
	readonly payments: PaymentsModule;
	readonly splits: SplitsModule;
	readonly storage: StorageModule;
	readonly oracle: OracleModule;
	readonly publicClient: PublicClient;
	readonly walletClient: WalletClient | null;

	constructor(config: ClientConfig) {
		const chain: Chain = {
			id: config.chainId,
			name: "0G Chain",
			nativeCurrency: { name: "A0GI", symbol: "A0GI", decimals: 18 },
			rpcUrls: {
				default: { http: [config.rpcUrl] },
			},
		};

		this.publicClient = createPublicClient({
			chain,
			transport: http(config.rpcUrl),
		});

		if (config.privateKey) {
			const account = privateKeyToAccount(config.privateKey as `0x${string}`);
			this.walletClient = createWalletClient({
				account,
				chain,
				transport: http(config.rpcUrl),
			});
		} else {
			this.walletClient = null;
		}

		this.registry = new RegistryModule(
			config.contracts.agentRegistry,
			this.publicClient,
			this.walletClient,
		);
		this.payments = new PaymentsModule(
			config.contracts.paymentRouter,
			this.publicClient,
			this.walletClient,
		);
		this.splits = new SplitsModule(
			config.contracts.splitVault,
			this.publicClient,
			this.walletClient,
		);
		this.storage = new StorageModule(config.zgStorageEndpoint);
		this.oracle = new OracleModule(config.zgComputeEndpoint);
	}
}

export function createAgentPayClient(config: ClientConfig): AgentPayClient {
	const validated = ClientConfigSchema.parse(config);
	return new AgentPayClient(validated);
}
