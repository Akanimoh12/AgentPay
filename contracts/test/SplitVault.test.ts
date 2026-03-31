import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("SplitVault", function () {
	async function deployFixture() {
		const [owner, addr1, addr2, addr3] = await hre.ethers.getSigners();
		const SplitVault = await hre.ethers.getContractFactory("SplitVault");
		const vault = await SplitVault.deploy();

		const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
		const token = await MockERC20.deploy("Mock Token", "MTK", hre.ethers.parseEther("1000000"));

		const agentId = hre.ethers.id("split-agent");

		return { vault, token, owner, addr1, addr2, addr3, agentId };
	}

	describe("Configure Split", function () {
		it("should configure a split with valid shares", async function () {
			const { vault, addr1, addr2, agentId } = await loadFixture(deployFixture);
			const recipients = [
				{ wallet: addr1.address, shareBps: 7000 },
				{ wallet: addr2.address, shareBps: 3000 },
			];

			await expect(vault.configureSplit(agentId, recipients))
				.to.emit(vault, "SplitConfigured");
		});

		it("should revert if shares do not sum to 10000", async function () {
			const { vault, addr1, addr2, agentId } = await loadFixture(deployFixture);
			const recipients = [
				{ wallet: addr1.address, shareBps: 5000 },
				{ wallet: addr2.address, shareBps: 3000 },
			];

			await expect(vault.configureSplit(agentId, recipients))
				.to.be.revertedWith("Shares must sum to 10000");
		});

		it("should enforce max 10 recipients", async function () {
			const { vault, addr1, agentId } = await loadFixture(deployFixture);
			const recipients = Array.from({ length: 11 }, () => ({
				wallet: addr1.address,
				shareBps: 909,
			}));

			await expect(vault.configureSplit(agentId, recipients))
				.to.be.revertedWith("Invalid recipient count");
		});
	});

	describe("Distribute Native", function () {
		it("should distribute native tokens according to shares", async function () {
			const { vault, addr1, addr2, owner, agentId } = await loadFixture(deployFixture);
			const recipients = [
				{ wallet: addr1.address, shareBps: 6000 },
				{ wallet: addr2.address, shareBps: 4000 },
			];

			const tx = await vault.configureSplit(agentId, recipients);
			const receipt = await tx.wait();
			const event = receipt?.logs.find((log: any) => {
				try {
					return vault.interface.parseLog({ topics: log.topics as string[], data: log.data })?.name === "SplitConfigured";
				} catch { return false; }
			});
			const parsed = vault.interface.parseLog({ topics: event!.topics as string[], data: event!.data });
			const splitId = parsed!.args[0];

			const amount = hre.ethers.parseEther("1");
			const addr1Before = await hre.ethers.provider.getBalance(addr1.address);
			const addr2Before = await hre.ethers.provider.getBalance(addr2.address);

			await vault.connect(owner).distribute(splitId, hre.ethers.ZeroAddress, amount, { value: amount });

			const addr1After = await hre.ethers.provider.getBalance(addr1.address);
			const addr2After = await hre.ethers.provider.getBalance(addr2.address);

			expect(addr1After - addr1Before).to.equal(hre.ethers.parseEther("0.6"));
			expect(addr2After - addr2Before).to.equal(hre.ethers.parseEther("0.4"));
		});
	});

	describe("Distribute ERC20", function () {
		it("should distribute ERC20 tokens according to shares", async function () {
			const { vault, token, addr1, addr2, owner, agentId } = await loadFixture(deployFixture);
			const recipients = [
				{ wallet: addr1.address, shareBps: 5000 },
				{ wallet: addr2.address, shareBps: 5000 },
			];

			const tx = await vault.configureSplit(agentId, recipients);
			const receipt = await tx.wait();
			const event = receipt?.logs.find((log: any) => {
				try {
					return vault.interface.parseLog({ topics: log.topics as string[], data: log.data })?.name === "SplitConfigured";
				} catch { return false; }
			});
			const parsed = vault.interface.parseLog({ topics: event!.topics as string[], data: event!.data });
			const splitId = parsed!.args[0];

			const amount = hre.ethers.parseEther("1000");
			await token.approve(await vault.getAddress(), amount);

			await vault.connect(owner).distribute(splitId, await token.getAddress(), amount);

			expect(await token.balanceOf(addr1.address)).to.equal(hre.ethers.parseEther("500"));
			expect(await token.balanceOf(addr2.address)).to.equal(hre.ethers.parseEther("500"));
		});
	});

	describe("Deactivate Split", function () {
		it("should deactivate a split", async function () {
			const { vault, addr1, addr2, agentId } = await loadFixture(deployFixture);
			const recipients = [
				{ wallet: addr1.address, shareBps: 5000 },
				{ wallet: addr2.address, shareBps: 5000 },
			];

			const tx = await vault.configureSplit(agentId, recipients);
			const receipt = await tx.wait();
			const event = receipt?.logs.find((log: any) => {
				try {
					return vault.interface.parseLog({ topics: log.topics as string[], data: log.data })?.name === "SplitConfigured";
				} catch { return false; }
			});
			const parsed = vault.interface.parseLog({ topics: event!.topics as string[], data: event!.data });
			const splitId = parsed!.args[0];

			await expect(vault.deactivateSplit(splitId))
				.to.emit(vault, "SplitDeactivated")
				.withArgs(splitId);
		});
	});
});
