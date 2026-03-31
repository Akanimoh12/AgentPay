import "dotenv/config";
import chalk from "chalk";
import * as readline from "readline";

import { run as agentRegistration } from "./scenarios/agent-registration.js";
import { run as simplePayment } from "./scenarios/simple-payment.js";
import { run as escrowPayment } from "./scenarios/escrow-payment.js";
import { run as revenueSplit } from "./scenarios/revenue-split.js";
import { run as oraclePricing } from "./scenarios/oracle-pricing.js";
import { run as fullWorkflow } from "./scenarios/full-workflow.js";

const scenarios = [
	{ name: "Agent Registration", fn: agentRegistration },
	{ name: "Simple Payment", fn: simplePayment },
	{ name: "Escrow Payment", fn: escrowPayment },
	{ name: "Revenue Split", fn: revenueSplit },
	{ name: "Oracle Pricing", fn: oraclePricing },
	{ name: "Full Workflow", fn: fullWorkflow },
];

function printBanner() {
	console.log();
	console.log(chalk.bold.hex("#5B45FF")("  ╔═══════════════════════════╗"));
	console.log(chalk.bold.hex("#5B45FF")("  ║    ") + chalk.bold.hex("#00E5BF")("AgentPay Demo") + chalk.bold.hex("#5B45FF")("         ║"));
	console.log(chalk.bold.hex("#5B45FF")("  ║  ") + chalk.dim("Payment Infrastructure") + chalk.bold.hex("#5B45FF")("   ║"));
	console.log(chalk.bold.hex("#5B45FF")("  ║  ") + chalk.dim("for the Agent Economy") + chalk.bold.hex("#5B45FF")("    ║"));
	console.log(chalk.bold.hex("#5B45FF")("  ╚═══════════════════════════╝"));
	console.log();
}

function printMenu() {
	console.log(chalk.bold("Select a scenario:\n"));
	scenarios.forEach((s, i) => {
		console.log(`  ${chalk.hex("#5B45FF")(`${i + 1}.`)} ${s.name}`);
	});
	console.log();
}

function prompt(message: string): Promise<string> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	return new Promise((resolve) => {
		rl.question(message, (answer) => {
			rl.close();
			resolve(answer.trim());
		});
	});
}

async function main() {
	printBanner();

	let running = true;
	while (running) {
		printMenu();
		const choice = await prompt(chalk.hex("#00E5BF")("Enter scenario number (1-6): "));
		const index = parseInt(choice, 10) - 1;

		if (index < 0 || index >= scenarios.length) {
			console.log(chalk.yellow("\nInvalid selection. Try again.\n"));
			continue;
		}

		console.log(
			chalk.bold(`\n${"─".repeat(40)}\n  Running: ${scenarios[index].name}\n${"─".repeat(40)}\n`),
		);

		try {
			await scenarios[index].fn();
		} catch (err: any) {
			console.log(chalk.red(`\nError: ${err.message}\n`));
		}

		console.log();
		const again = await prompt(chalk.dim("Run another scenario? (y/n): "));
		if (again.toLowerCase() !== "y") {
			running = false;
		}
		console.log();
	}

	console.log(chalk.dim("Goodbye!\n"));
}

main();
