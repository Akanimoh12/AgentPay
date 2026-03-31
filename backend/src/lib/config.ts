import { z } from "zod";
import "dotenv/config";

const ConfigSchema = z.object({
	apiPort: z.coerce.number().default(3001),
	databaseUrl: z.string().url(),
	redisUrl: z.string().default("redis://localhost:6379"),
	zgRpcUrl: z.string().url(),
	zgChainId: z.coerce.number().int().positive(),
	zgStorageEndpoint: z.string().optional(),
	zgComputeEndpoint: z.string().optional(),
	agentRegistryAddress: z.string(),
	paymentRouterAddress: z.string(),
	splitVaultAddress: z.string(),
	deployerPrivateKey: z.string().optional(),
});

const parsed = ConfigSchema.safeParse({
	apiPort: process.env.API_PORT,
	databaseUrl: process.env.DATABASE_URL,
	redisUrl: process.env.REDIS_URL,
	zgRpcUrl: process.env.ZG_RPC_URL,
	zgChainId: process.env.ZG_CHAIN_ID,
	zgStorageEndpoint: process.env.ZG_STORAGE_ENDPOINT || undefined,
	zgComputeEndpoint: process.env.ZG_COMPUTE_ENDPOINT || undefined,
	agentRegistryAddress: process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS,
	paymentRouterAddress: process.env.NEXT_PUBLIC_PAYMENT_ROUTER_ADDRESS,
	splitVaultAddress: process.env.NEXT_PUBLIC_SPLIT_VAULT_ADDRESS,
	deployerPrivateKey: process.env.DEPLOYER_PRIVATE_KEY || undefined,
});

if (!parsed.success) {
	console.error("Invalid environment configuration:", parsed.error.format());
	process.exit(1);
}

export const config = parsed.data;
export type Config = z.infer<typeof ConfigSchema>;
