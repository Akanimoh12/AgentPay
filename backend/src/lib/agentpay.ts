import { createAgentPayClient, type AgentPayClient } from "@agentpay/sdk";
import { config } from "./config.js";

let client: AgentPayClient | null = null;

export function getAgentPayClient(): AgentPayClient {
	if (!client) {
		client = createAgentPayClient({
			rpcUrl: config.zgRpcUrl,
			chainId: config.zgChainId,
			contracts: {
				agentRegistry: config.agentRegistryAddress,
				paymentRouter: config.paymentRouterAddress,
				splitVault: config.splitVaultAddress,
			},
			privateKey: config.deployerPrivateKey,
			zgStorageEndpoint: config.zgStorageEndpoint,
			zgComputeEndpoint: config.zgComputeEndpoint,
		});
	}
	return client;
}
