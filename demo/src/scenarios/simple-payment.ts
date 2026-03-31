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

	console.log(chalk.hex("#5B45FF")("Setting up agents..."));
	await client.registry.registerAgent(agentAId, "Sender", ["data-query"]);
	await client.registry.registerAgent(agentBId, "Receiver", ["text-completion"]);
	console.log(chalk.green("  ✓ Both agents registered"));

	const NATIVE_TOKEN = "0x0000000000000000000000000000000000000000";
	const amount = "10000000000000000";

	console.log(
		chalk.hex("#00E5BF")(`\nSending 0.01 A0GI from Agent A → Agent B`),
	);

	const txHash = await client.payments.payDirect(agentBId, NATIVE_TOKEN, BigInt(amount));
	console.log(chalk.green(`  ✓ Payment TX: ${txHash}`));
	console.log(`    Amount:          0.01 A0GI`);
	console.log(`    Fee (est):       0.0001 A0GI (1%)`);
	console.log(`    Net received:    0.0099 A0GI`);

	console.log(chalk.green("\n✓ Simple payment complete"));
}
