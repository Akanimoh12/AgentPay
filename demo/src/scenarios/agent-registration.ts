import chalk from "chalk";
import { createAgentPayClient } from "@agentpay/sdk";
import { randomBytes } from "crypto";

function randomAgentId(): string {
	return "0x" + randomBytes(32).toString("hex");
}

export async function run() {
	const client = createAgentPayClient({
		rpcUrl: process.env.RPC_URL || "https://evmrpc-testnet.0g.ai",
		chainId: Number(process.env.CHAIN_ID) || 16600,
		contracts: {
			agentRegistry: process.env.AGENT_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000001",
			paymentRouter: process.env.PAYMENT_ROUTER_ADDRESS || "0x0000000000000000000000000000000000000002",
			splitVault: process.env.SPLIT_VAULT_ADDRESS || "0x0000000000000000000000000000000000000003",
		},
		privateKey: process.env.PRIVATE_KEY,
	});

	const agentAId = randomAgentId();
	const agentBId = randomAgentId();

	console.log(chalk.hex("#5B45FF")("Registering Agent A: DataProvider"));
	console.log(chalk.dim(`  Agent ID: ${agentAId}`));
	const txA = await client.registry.registerAgent(agentAId, "DataProvider", [
		"data-query",
		"batch-export",
	]);
	console.log(chalk.green(`  ✓ TX Hash: ${txA}`));

	console.log();
	console.log(chalk.hex("#5B45FF")("Registering Agent B: InferenceEngine"));
	console.log(chalk.dim(`  Agent ID: ${agentBId}`));
	const txB = await client.registry.registerAgent(agentBId, "InferenceEngine", [
		"text-completion",
		"image-generation",
	]);
	console.log(chalk.green(`  ✓ TX Hash: ${txB}`));

	console.log();
	console.log(chalk.hex("#00E5BF")("Verifying registrations..."));

	const profileA = await client.registry.getAgent(agentAId);
	console.log(chalk.bold("\n  Agent A:"));
	console.log(`    Name:     ${profileA.name}`);
	console.log(`    Agent ID: ${profileA.agentId}`);
	console.log(`    Wallet:   ${profileA.wallet}`);
	console.log(`    Services: ${(profileA.services || []).join(", ")}`);
	console.log(`    Active:   ${profileA.active}`);

	const profileB = await client.registry.getAgent(agentBId);
	console.log(chalk.bold("\n  Agent B:"));
	console.log(`    Name:     ${profileB.name}`);
	console.log(`    Agent ID: ${profileB.agentId}`);
	console.log(`    Wallet:   ${profileB.wallet}`);
	console.log(`    Services: ${(profileB.services || []).join(", ")}`);
	console.log(`    Active:   ${profileB.active}`);

	console.log(chalk.green("\n✓ Agent registration complete"));
}
