import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const AgentRegistryModule = buildModule("AgentRegistryModule", (m) => {
	const agentRegistry = m.contract("AgentRegistry");
	return { agentRegistry };
});

export default AgentRegistryModule;
