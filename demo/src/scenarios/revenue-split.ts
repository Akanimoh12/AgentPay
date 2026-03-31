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

	const providerId = randomAgentId();
	const referralId = randomAgentId();
	const treasuryId = randomAgentId();

	console.log(chalk.hex("#5B45FF")("Setting up agents..."));
	await client.registry.registerAgent(providerId, "ServiceProvider", [
		"text-completion",
		"image-generation",
	]);
	await client.registry.registerAgent(referralId, "ReferralAgent", ["referral"]);
	await client.registry.registerAgent(treasuryId, "ProtocolTreasury", ["treasury"]);
	console.log(chalk.green("  ✓ Three agents registered"));

	console.log(chalk.hex("#00E5BF")("\n── Configuring Revenue Split ──"));
	console.log(`  Provider:   85.00%`);
	console.log(`  Referral:   10.00%`);
	console.log(`  Treasury:    5.00%`);

	const splitId = await client.splits.configureSplit(providerId, [
		{ wallet: "0x1111111111111111111111111111111111111111", shareBps: 8500 },
		{ wallet: "0x2222222222222222222222222222222222222222", shareBps: 1000 },
		{ wallet: "0x3333333333333333333333333333333333333333", shareBps: 500 },
	]);
	console.log(chalk.green(`  ✓ Split configured — ID: ${splitId}`));

	const NATIVE_TOKEN = "0x0000000000000000000000000000000000000000";
	const amount = "100000000000000000";

	console.log(chalk.hex("#00E5BF")("\n── Distributing 0.1 A0GI ──"));
	const distTx = await client.splits.distribute(splitId, NATIVE_TOKEN, BigInt(amount));
	console.log(chalk.green(`  ✓ Distribution TX: ${distTx}`));

	console.log(chalk.bold("\n  Distribution Breakdown:"));
	console.log(`    ServiceProvider  (85%):  0.085   A0GI`);
	console.log(`    ReferralAgent    (10%):  0.01    A0GI`);
	console.log(`    ProtocolTreasury  (5%):  0.005   A0GI`);
	console.log(`    ${"─".repeat(40)}`);
	console.log(`    Total:                   0.1     A0GI`);

	console.log(chalk.green("\n✓ Revenue split demo complete"));
}
