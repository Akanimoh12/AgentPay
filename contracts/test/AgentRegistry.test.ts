import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("AgentRegistry", function () {
	async function deployFixture() {
		const [owner, addr1, addr2] = await hre.ethers.getSigners();
		const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
		const registry = await AgentRegistry.deploy();
		const agentId1 = hre.ethers.id("agent-1");
		const agentId2 = hre.ethers.id("agent-2");
		return { registry, owner, addr1, addr2, agentId1, agentId2 };
	}

	describe("Registration", function () {
		it("should register an agent successfully", async function () {
			const { registry, addr1, agentId1 } = await loadFixture(deployFixture);
			await expect(registry.connect(addr1).registerAgent(agentId1, "Agent One", ["compute", "storage"]))
				.to.emit(registry, "AgentRegistered")
				.withArgs(agentId1, addr1.address, "Agent One");

			const profile = await registry.getAgent(agentId1);
			expect(profile.wallet).to.equal(addr1.address);
			expect(profile.name).to.equal("Agent One");
			expect(profile.active).to.be.true;
			expect(profile.services.length).to.equal(2);
		});

		it("should revert on duplicate agentId", async function () {
			const { registry, addr1, addr2, agentId1 } = await loadFixture(deployFixture);
			await registry.connect(addr1).registerAgent(agentId1, "Agent One", ["compute"]);
			await expect(
				registry.connect(addr2).registerAgent(agentId1, "Agent Two", ["storage"])
			).to.be.revertedWith("AgentId already registered");
		});

		it("should revert if wallet already registered", async function () {
			const { registry, addr1, agentId1, agentId2 } = await loadFixture(deployFixture);
			await registry.connect(addr1).registerAgent(agentId1, "Agent One", ["compute"]);
			await expect(
				registry.connect(addr1).registerAgent(agentId2, "Agent Two", ["storage"])
			).to.be.revertedWith("Wallet already registered");
		});
	});

	describe("Update Services", function () {
		it("should update services for a registered agent", async function () {
			const { registry, addr1, agentId1 } = await loadFixture(deployFixture);
			await registry.connect(addr1).registerAgent(agentId1, "Agent One", ["compute"]);
			await expect(registry.connect(addr1).updateServices(["compute", "storage", "inference"]))
				.to.emit(registry, "ServicesUpdated")
				.withArgs(agentId1);

			const profile = await registry.getAgent(agentId1);
			expect(profile.services.length).to.equal(3);
		});

		it("should revert for unregistered wallet", async function () {
			const { registry, addr2 } = await loadFixture(deployFixture);
			await expect(
				registry.connect(addr2).updateServices(["compute"])
			).to.be.revertedWith("Not registered");
		});
	});

	describe("Deactivation", function () {
		it("should deactivate an agent", async function () {
			const { registry, addr1, agentId1 } = await loadFixture(deployFixture);
			await registry.connect(addr1).registerAgent(agentId1, "Agent One", ["compute"]);
			await expect(registry.connect(addr1).deactivateAgent())
				.to.emit(registry, "AgentDeactivated")
				.withArgs(agentId1);

			expect(await registry.isActiveAgent(agentId1)).to.be.false;
			expect(await registry.isRegistered(agentId1)).to.be.true;
		});
	});

	describe("View Functions", function () {
		it("should return correct agent count", async function () {
			const { registry, addr1, addr2, agentId1, agentId2 } = await loadFixture(deployFixture);
			await registry.connect(addr1).registerAgent(agentId1, "Agent One", ["compute"]);
			await registry.connect(addr2).registerAgent(agentId2, "Agent Two", ["storage"]);
			expect(await registry.getAgentCount()).to.equal(2);
		});

		it("should return all agent IDs", async function () {
			const { registry, addr1, addr2, agentId1, agentId2 } = await loadFixture(deployFixture);
			await registry.connect(addr1).registerAgent(agentId1, "Agent One", ["compute"]);
			await registry.connect(addr2).registerAgent(agentId2, "Agent Two", ["storage"]);
			const ids = await registry.getAllAgentIds();
			expect(ids.length).to.equal(2);
			expect(ids[0]).to.equal(agentId1);
			expect(ids[1]).to.equal(agentId2);
		});

		it("should resolve wallet to agentId", async function () {
			const { registry, addr1, agentId1 } = await loadFixture(deployFixture);
			await registry.connect(addr1).registerAgent(agentId1, "Agent One", ["compute"]);
			expect(await registry.getAgentByWallet(addr1.address)).to.equal(agentId1);
		});
	});
});
