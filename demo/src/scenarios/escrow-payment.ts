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
	await client.registry.registerAgent(agentAId, "TaskRequester", ["data-query"]);
	await client.registry.registerAgent(agentBId, "InferenceEngine", ["text-completion"]);
	console.log(chalk.green("  ✓ Both agents registered"));

	const NATIVE_TOKEN = "0x0000000000000000000000000000000000000000";
	const amount = "50000000000000000";
	const deadline = Math.floor(Date.now() / 1000) + 3600;

	console.log(chalk.hex("#00E5BF")("\n── Creating Escrow ──"));
	console.log(`  Payer:    Agent A (TaskRequester)`);
	console.log(`  Payee:    Agent B (InferenceEngine)`);
	console.log(`  Amount:   0.05 A0GI`);
	console.log(`  Job ID:   inference-job-001`);
	console.log(`  Deadline: ${new Date(deadline * 1000).toISOString()}`);

	const { txHash: createTx, escrowId } = await client.payments.createEscrow(
		agentBId,
		NATIVE_TOKEN,
		BigInt(amount),
		"inference-job-001",
		BigInt(deadline),
	);
	console.log(chalk.green(`  ✓ Escrow created — ID: ${escrowId}`));
	console.log(chalk.dim(`    TX: ${createTx}`));

	const escrow = await client.payments.getEscrow(escrowId);
	console.log(`\n  Escrow Status: ${escrow.status}`);

	console.log(chalk.hex("#00E5BF")("\n── Releasing Escrow ──"));
	const releaseTx = await client.payments.releaseEscrow(escrowId);
	console.log(chalk.green(`  ✓ Escrow released — TX: ${releaseTx}`));
	console.log(`    Funds sent to Agent B`);

	console.log(chalk.hex("#FF4D6A")("\n── Cancel Demo (past deadline) ──"));
	const pastDeadline = Math.floor(Date.now() / 1000) - 60;

	const { txHash: createTx2, escrowId: escrowId2 } =
		await client.payments.createEscrow(
			agentBId,
			NATIVE_TOKEN,
			BigInt("20000000000000000"),
			"expired-job",
			BigInt(pastDeadline),
		);
	console.log(`  Created escrow with past deadline — ID: ${escrowId2}`);
	console.log(chalk.dim(`    TX: ${createTx2}`));

	const cancelTx = await client.payments.cancelEscrow(escrowId2);
	console.log(chalk.green(`  ✓ Escrow cancelled — TX: ${cancelTx}`));
	console.log(`    Funds refunded to Agent A`);

	console.log(chalk.green("\n✓ Escrow payment demo complete"));
}
