import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("PaymentRouter", function () {
	async function deployFixture() {
		const [owner, payer, payee, feeRecipient] = await hre.ethers.getSigners();

		const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
		const registry = await AgentRegistry.deploy();

		const PaymentRouter = await hre.ethers.getContractFactory("PaymentRouter");
		const router = await PaymentRouter.deploy(await registry.getAddress());

		const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
		const token = await MockERC20.deploy("Mock Token", "MTK", hre.ethers.parseEther("1000000"));

		const payerAgentId = hre.ethers.id("payer-agent");
		const payeeAgentId = hre.ethers.id("payee-agent");

		await registry.connect(payer).registerAgent(payerAgentId, "Payer Agent", ["compute"]);
		await registry.connect(payee).registerAgent(payeeAgentId, "Payee Agent", ["storage"]);

		await token.transfer(payer.address, hre.ethers.parseEther("10000"));
		await token.connect(payer).approve(await router.getAddress(), hre.ethers.MaxUint256);

		return { registry, router, token, owner, payer, payee, feeRecipient, payerAgentId, payeeAgentId };
	}

	describe("Direct Native Payment", function () {
		it("should transfer native tokens with fee deduction", async function () {
			const { router, payer, payee, payeeAgentId } = await loadFixture(deployFixture);
			const amount = hre.ethers.parseEther("1");

			const payeeBefore = await hre.ethers.provider.getBalance(payee.address);
			await router.connect(payer).payDirect(payeeAgentId, hre.ethers.ZeroAddress, amount, { value: amount });
			const payeeAfter = await hre.ethers.provider.getBalance(payee.address);

			const fee = amount * 50n / 10000n;
			expect(payeeAfter - payeeBefore).to.equal(amount - fee);
		});
	});

	describe("Direct ERC20 Payment", function () {
		it("should transfer ERC20 tokens with fee deduction", async function () {
			const { router, token, payer, payee, payeeAgentId } = await loadFixture(deployFixture);
			const amount = hre.ethers.parseEther("100");

			const payeeBefore = await token.balanceOf(payee.address);
			await router.connect(payer).payDirect(payeeAgentId, await token.getAddress(), amount);
			const payeeAfter = await token.balanceOf(payee.address);

			const fee = amount * 50n / 10000n;
			expect(payeeAfter - payeeBefore).to.equal(amount - fee);
		});
	});

	describe("Escrow", function () {
		it("should create an escrow", async function () {
			const { router, payer, payeeAgentId } = await loadFixture(deployFixture);
			const amount = hre.ethers.parseEther("1");
			const jobId = hre.ethers.id("job-1");
			const deadline = (await time.latest()) + 86400;

			await expect(
				router.connect(payer).createEscrow(payeeAgentId, hre.ethers.ZeroAddress, amount, jobId, deadline, { value: amount })
			).to.emit(router, "EscrowCreated");
		});

		it("should release an escrow", async function () {
			const { router, payer, payee, payeeAgentId } = await loadFixture(deployFixture);
			const amount = hre.ethers.parseEther("1");
			const jobId = hre.ethers.id("job-1");
			const deadline = (await time.latest()) + 86400;

			const tx = await router.connect(payer).createEscrow(payeeAgentId, hre.ethers.ZeroAddress, amount, jobId, deadline, { value: amount });
			const receipt = await tx.wait();
			const event = receipt?.logs.find((log: any) => {
				try {
					return router.interface.parseLog({ topics: log.topics as string[], data: log.data })?.name === "EscrowCreated";
				} catch { return false; }
			});
			const parsed = router.interface.parseLog({ topics: event!.topics as string[], data: event!.data });
			const escrowId = parsed!.args[0];

			const payeeBefore = await hre.ethers.provider.getBalance(payee.address);
			await router.connect(payer).releaseEscrow(escrowId);
			const payeeAfter = await hre.ethers.provider.getBalance(payee.address);

			const fee = amount * 50n / 10000n;
			expect(payeeAfter - payeeBefore).to.equal(amount - fee);
		});

		it("should cancel an escrow after deadline", async function () {
			const { router, payer, payeeAgentId } = await loadFixture(deployFixture);
			const amount = hre.ethers.parseEther("1");
			const jobId = hre.ethers.id("job-1");
			const deadline = (await time.latest()) + 86400;

			const tx = await router.connect(payer).createEscrow(payeeAgentId, hre.ethers.ZeroAddress, amount, jobId, deadline, { value: amount });
			const receipt = await tx.wait();
			const event = receipt?.logs.find((log: any) => {
				try {
					return router.interface.parseLog({ topics: log.topics as string[], data: log.data })?.name === "EscrowCreated";
				} catch { return false; }
			});
			const parsed = router.interface.parseLog({ topics: event!.topics as string[], data: event!.data });
			const escrowId = parsed!.args[0];

			await time.increase(86401);

			await expect(router.connect(payer).cancelEscrow(escrowId))
				.to.emit(router, "EscrowCancelled");
		});

		it("should revert on early cancel", async function () {
			const { router, payer, payeeAgentId } = await loadFixture(deployFixture);
			const amount = hre.ethers.parseEther("1");
			const jobId = hre.ethers.id("job-1");
			const deadline = (await time.latest()) + 86400;

			const tx = await router.connect(payer).createEscrow(payeeAgentId, hre.ethers.ZeroAddress, amount, jobId, deadline, { value: amount });
			const receipt = await tx.wait();
			const event = receipt?.logs.find((log: any) => {
				try {
					return router.interface.parseLog({ topics: log.topics as string[], data: log.data })?.name === "EscrowCreated";
				} catch { return false; }
			});
			const parsed = router.interface.parseLog({ topics: event!.topics as string[], data: event!.data });
			const escrowId = parsed!.args[0];

			await expect(
				router.connect(payer).cancelEscrow(escrowId)
			).to.be.revertedWith("Deadline not reached");
		});

		it("should revert on double release", async function () {
			const { router, payer, payeeAgentId } = await loadFixture(deployFixture);
			const amount = hre.ethers.parseEther("1");
			const jobId = hre.ethers.id("job-1");
			const deadline = (await time.latest()) + 86400;

			const tx = await router.connect(payer).createEscrow(payeeAgentId, hre.ethers.ZeroAddress, amount, jobId, deadline, { value: amount });
			const receipt = await tx.wait();
			const event = receipt?.logs.find((log: any) => {
				try {
					return router.interface.parseLog({ topics: log.topics as string[], data: log.data })?.name === "EscrowCreated";
				} catch { return false; }
			});
			const parsed = router.interface.parseLog({ topics: event!.topics as string[], data: event!.data });
			const escrowId = parsed!.args[0];

			await router.connect(payer).releaseEscrow(escrowId);
			await expect(
				router.connect(payer).releaseEscrow(escrowId)
			).to.be.revertedWith("Escrow already settled");
		});
	});
});
