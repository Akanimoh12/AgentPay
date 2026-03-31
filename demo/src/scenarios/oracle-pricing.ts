import chalk from "chalk";
import { createAgentPayClient } from "@agentpay/sdk";

export async function run() {
	const client = createAgentPayClient({
		rpcUrl: process.env.RPC_URL || "https://evmrpc-testnet.0g.ai",
		chainId: Number(process.env.CHAIN_ID) || 16600,
		contracts: {
			agentRegistry: process.env.AGENT_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000001",
			paymentRouter: process.env.PAYMENT_ROUTER_ADDRESS || "0x0000000000000000000000000000000000000002",
			splitVault: process.env.SPLIT_VAULT_ADDRESS || "0x0000000000000000000000000000000000000003",
		},
		zgComputeEndpoint: process.env.ZG_COMPUTE_ENDPOINT,
	});

	console.log(chalk.hex("#5B45FF")("Querying oracle for text-completion..."));
	const textPrice = await client.oracle.getPrice("text-completion", {
		model: "gpt-4",
		tokens: 1000,
	});
	console.log(chalk.bold("\n  Text Completion Pricing:"));
	console.log(`    Floor:     ${textPrice.floor.toString()} wei`);
	console.log(
		chalk.hex("#00E5BF")(
			`    Suggested: ${textPrice.suggested.toString()} wei`,
		),
	);
	console.log(`    Ceiling:   ${textPrice.ceiling.toString()} wei`);

	console.log(chalk.hex("#5B45FF")("\nQuerying oracle for image-generation..."));
	const imagePrice = await client.oracle.getPrice("image-generation", {
		resolution: "1024x1024",
		style: "photorealistic",
	});
	console.log(chalk.bold("\n  Image Generation Pricing:"));
	console.log(`    Floor:     ${imagePrice.floor.toString()} wei`);
	console.log(
		chalk.hex("#00E5BF")(
			`    Suggested: ${imagePrice.suggested.toString()} wei`,
		),
	);
	console.log(`    Ceiling:   ${imagePrice.ceiling.toString()} wei`);

	console.log(chalk.bold("\n  Comparison:"));
	const textSuggested = Number(textPrice.suggested);
	const imageSuggested = Number(imagePrice.suggested);
	const ratio = imageSuggested / (textSuggested || 1);
	console.log(
		`    Image gen is ${ratio.toFixed(1)}x the price of text completion`,
	);

	console.log(chalk.green("\n✓ Oracle pricing demo complete"));
}
