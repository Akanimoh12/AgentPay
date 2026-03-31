import chalk from "chalk";
import { createAgentPayClient } from "@agentpay/sdk";
import { randomBytes } from "crypto";

function randomAgentId(): string {
	return "0x" + randomBytes(32).toString("hex");
}

function phase(label: string) {
	console.log(chalk.bold.hex("#5B45FF")(`\n${"═".repeat(50)}`));
	console.log(chalk.bold.hex("#5B45FF")(`  PHASE: ${label}`));
	console.log(chalk.bold.hex("#5B45FF")(`${"═".repeat(50)}\n`));
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
		zgStorageEndpoint: process.env.ZG_STORAGE_ENDPOINT,
		zgComputeEndpoint: process.env.ZG_COMPUTE_ENDPOINT,
	});

	const NATIVE_TOKEN = "0x0000000000000000000000000000000000000000";
	const requesterId = randomAgentId();
	const providerId = randomAgentId();
	const referralId = randomAgentId();

	phase("1 — Agent Registration");
	await client.registry.registerAgent(requesterId, "TaskRequester", [
		"data-query",
	]);
	console.log(chalk.green("  ✓ TaskRequester registered"));
	await client.registry.registerAgent(providerId, "InferenceProvider", [
		"text-completion",
		"image-generation",
	]);
	console.log(chalk.green("  ✓ InferenceProvider registered"));
	await client.registry.registerAgent(referralId, "ReferralAgent", [
		"referral",
	]);
	console.log(chalk.green("  ✓ ReferralAgent registered"));

	phase("2 — Oracle Price Query");
	const price = await client.oracle.getPrice("text-completion", {
		model: "gpt-4",
		tokens: 2000,
	});
	console.log(`  Floor:     ${price.floor.toString()} wei`);
	console.log(chalk.hex("#00E5BF")(`  Suggested: ${price.suggested.toString()} wei`));
	console.log(`  Ceiling:   ${price.ceiling.toString()} wei`);

	phase("3 — Create Escrow at Suggested Price");
	const deadline = Math.floor(Date.now() / 1000) + 3600;
	const { txHash: escrowTx, escrowId } = await client.payments.createEscrow(
		providerId,
		NATIVE_TOKEN,
		price.suggested,
		"inference-job-full-workflow",
		BigInt(deadline),
	);
	console.log(chalk.green(`  ✓ Escrow created — ID: ${escrowId}`));
	console.log(chalk.dim(`    TX: ${escrowTx}`));
	console.log(`    Amount: ${price.suggested.toString()} wei`);

	phase("4 — Simulate Job Completion");
	console.log(chalk.yellow("  ⏳ Simulating inference job..."));
	await new Promise((r) => setTimeout(r, 2000));
	console.log(chalk.green("  ✓ Job completed successfully"));

	phase("5 — Release Escrow");
	const releaseTx = await client.payments.releaseEscrow(escrowId);
	console.log(chalk.green(`  ✓ Escrow released — TX: ${releaseTx}`));
	console.log(`    Funds sent to InferenceProvider`);

	phase("6 — Revenue Split Distribution");
	const splitId = await client.splits.configureSplit(providerId, [
		{ wallet: "0x1111111111111111111111111111111111111111", shareBps: 8500 },
		{ wallet: "0x2222222222222222222222222222222222222222", shareBps: 1000 },
		{ wallet: "0x3333333333333333333333333333333333333333", shareBps: 500 },
	]);
	console.log(chalk.green(`  ✓ Split configured — ID: ${splitId}`));
	const distTx = await client.splits.distribute(
		splitId,
		NATIVE_TOKEN,
		price.suggested,
	);
	console.log(chalk.green(`  ✓ Distributed — TX: ${distTx}`));

	phase("7 — Write Invoice to 0G Storage");
	const invoice = {
		invoiceId: `INV-${Date.now()}`,
		fromAgentId: requesterId,
		toAgentId: providerId,
		amount: price.suggested.toString(),
		description: "Text completion inference - full workflow demo",
		lineItems: [
			{
				description: "GPT-4 text completion (2000 tokens)",
				amount: price.suggested.toString(),
			},
		],
		status: "paid" as const,
		createdAt: new Date().toISOString(),
	};
	const storageKey = await client.storage.writeInvoice(invoice);
	console.log(chalk.green(`  ✓ Invoice written — Storage Key: ${storageKey}`));

	phase("8 — Verify Invoice from 0G Storage");
	const retrieved = await client.storage.getInvoice(storageKey);
	console.log(`  Invoice ID:  ${retrieved.invoiceId}`);
	console.log(`  From:        ${retrieved.fromAgentId.slice(0, 16)}...`);
	console.log(`  To:          ${retrieved.toAgentId.slice(0, 16)}...`);
	console.log(`  Amount:      ${retrieved.amount} wei`);
	console.log(`  Description: ${retrieved.description}`);
	console.log(`  Status:      ${retrieved.status}`);

	console.log(chalk.bold.hex("#00E5BF")(`\n${"═".repeat(50)}`));
	console.log(chalk.bold.hex("#00E5BF")("  FULL WORKFLOW SUMMARY"));
	console.log(chalk.bold.hex("#00E5BF")(`${"═".repeat(50)}`));
	console.log(`  Agents Registered:  3`);
	console.log(`  Oracle Queries:     1`);
	console.log(`  Escrows Created:    1`);
	console.log(`  Escrows Released:   1`);
	console.log(`  Splits Configured:  1`);
	console.log(`  Distributions:      1`);
	console.log(`  Invoices Written:   1`);
	console.log(`  Storage Verified:   1`);
	console.log(chalk.green("\n✓ Full workflow complete"));
}
