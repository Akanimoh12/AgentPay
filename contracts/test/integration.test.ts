import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("Integration", function () {
	async function deployFullFixture() {
		const [owner, agent1Wallet, agent2Wallet, splitRecipient1, splitRecipient2] = await hre.ethers.getSigners();

		const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
		const registry = await AgentRegistry.deploy();

		const PaymentRouter = await hre.ethers.getContractFactory("PaymentRouter");
		const router = await PaymentRouter.deploy(await registry.getAddress());

		const SplitVault = await hre.ethers.getContractFactory("SplitVault");
		const vault = await SplitVault.deploy();

		const agent1Id = hre.ethers.id("agent-1");
		const agent2Id = hre.ethers.id("agent-2");

		await registry.connect(agent1Wallet).registerAgent(agent1Id, "Agent One", ["compute"]);
		await registry.connect(agent2Wallet).registerAgent(agent2Id, "Agent Two", ["storage"]);

		return { registry, router, vault, owner, agent1Wallet, agent2Wallet, splitRecipient1, splitRecipient2, agent1Id, agent2Id };
	}

	describe("Escrow Full Flow", function () {
		it("should register agents, create escrow, release, and verify balances", async function () {
			const { router, agent1Wallet, agent2Wallet, agent2Id } = await loadFixture(deployFullFixture);

			const amount = hre.ethers.parseEther("2");
			const jobId = hre.ethers.id("integration-job");
			const deadline = (await time.latest()) + 86400;

			const tx = await router.connect(agent1Wallet).createEscrow(
				agent2Id, hre.ethers.ZeroAddress, amount, jobId, deadline, { value: amount }
			);
			const receipt = await tx.wait();
			const event = receipt?.logs.find((log: any) => {
				try {
					return router.interface.parseLog({ topics: log.topics as string[], data: log.data })?.name === "EscrowCreated";
				} catch { return false; }
			});
			const parsed = router.interface.parseLog({ topics: event!.topics as string[], data: event!.data });
			const escrowId = parsed!.args[0];

			const agent2Before = await hre.ethers.provider.getBalance(agent2Wallet.address);
			await router.connect(agent1Wallet).releaseEscrow(escrowId);
			const agent2After = await hre.ethers.provider.getBalance(agent2Wallet.address);

			const fee = amount * 50n / 10000n;
			expect(agent2After - agent2Before).to.equal(amount - fee);
		});
	});

	describe("Split Distribution Flow", function () {
		it("should configure split and distribute payment to all recipients", async function () {
			const { vault, splitRecipient1, splitRecipient2, agent1Id } = await loadFixture(deployFullFixture);

			const recipients = [
				{ wallet: splitRecipient1.address, shareBps: 7000 },
				{ wallet: splitRecipient2.address, shareBps: 3000 },
			];

			const tx = await vault.configureSplit(agent1Id, recipients);
			const receipt = await tx.wait();
			const event = receipt?.logs.find((log: any) => {
				try {
					return vault.interface.parseLog({ topics: log.topics as string[], data: log.data })?.name === "SplitConfigured";
				} catch { return false; }
			});
			const parsed = vault.interface.parseLog({ topics: event!.topics as string[], data: event!.data });
			const splitId = parsed!.args[0];

			const amount = hre.ethers.parseEther("10");
			const r1Before = await hre.ethers.provider.getBalance(splitRecipient1.address);
			const r2Before = await hre.ethers.provider.getBalance(splitRecipient2.address);

			await vault.distribute(splitId, hre.ethers.ZeroAddress, amount, { value: amount });

			const r1After = await hre.ethers.provider.getBalance(splitRecipient1.address);
			const r2After = await hre.ethers.provider.getBalance(splitRecipient2.address);

			expect(r1After - r1Before).to.equal(hre.ethers.parseEther("7"));
			expect(r2After - r2Before).to.equal(hre.ethers.parseEther("3"));
		});
	});
});
